import { useEffect, useMemo, type ComponentProps } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { authApi } from "../api/auth";
import { ErrorRecoveryPanel } from "../components/ErrorRecoveryPanel";
import { ScreenShell } from "../components/ScreenShell";
import { StatusChip } from "../components/StatusChip";
import { DiscoverMapScreen } from "../screens/DiscoverMapScreen";
import { EventRegistrationScreen } from "../screens/EventRegistrationScreen";
import { FormBuilderScreen } from "../screens/FormBuilderScreen";
import { GalleryDetailScreen } from "../screens/GalleryDetailScreen";
import { GalleryHomeScreen } from "../screens/GalleryHomeScreen";
import { LoginEntryScreen } from "../screens/LoginEntryScreen";
import { OrganizerDashboardScreen } from "../screens/OrganizerDashboardScreen";
import { OrganizerToolsScreen } from "../screens/OrganizerToolsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ReviewHubScreen } from "../screens/ReviewHubScreen";
import { StampVaultScreen } from "../screens/StampVaultScreen";
import { SubmissionPipelineScreen } from "../screens/SubmissionPipelineScreen";
import { SubmissionReviewScreen } from "../screens/SubmissionReviewScreen";
import { useSessionStore } from "../state/session";
import { palette, typography } from "../theme/tokens";
import type { OrganizerProfile, User, UserProfile, VisitorProfile } from "../types/models";

type RootStackParamList = {
  Login: undefined;
  VisitorTabs: undefined;
  OrganizerTabs: undefined;
  GalleryDetail: { galleryId: string };
  EventRegistration: { galleryId: string };
  ReviewHub: { galleryId: string };
  ExhibitionEditor: { exhibitionId?: string };
  FormBuilder: { exhibitionId: string };
  SubmissionReview: { exhibitionId: string };
};

type VisitorTabParamList = {
  Gallery: undefined;
  Discover: undefined;
  Vault: undefined;
  Profile: undefined;
};

type OrganizerTabParamList = {
  Dashboard: undefined;
  Pipeline: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const VisitorTabs = createBottomTabNavigator<VisitorTabParamList>();
const OrganizerTabs = createBottomTabNavigator<OrganizerTabParamList>();
const TAB_BAR_SIDE_MARGIN = 34;
const TAB_BAR_HEIGHT = 72;
const TAB_BAR_ITEM_HEIGHT = 58;
type IoniconName = ComponentProps<typeof Ionicons>["name"];

type TabIconProps = Readonly<{
  color: string;
  focused: boolean;
}>;

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.background,
    text: palette.text,
    border: "transparent",
    primary: palette.accent,
    notification: palette.gold,
  },
};

const visitorTabOptions = {
  headerShown: false,
  tabBarActiveTintColor: palette.background,
  tabBarInactiveTintColor: palette.backgroundAlt,
  tabBarShowLabel: true,
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    left: TAB_BAR_SIDE_MARGIN,
    right: TAB_BAR_SIDE_MARGIN,
    height: TAB_BAR_HEIGHT,
    borderRadius: 9999,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    ...(Platform.OS === "web" ? { boxShadow: "none" } : { shadowOpacity: 0 }),
  },
  tabBarBackground: () => (
    <View style={styles.tabBarBackground}>
      <View style={styles.tabBarBackgroundTint} />
    </View>
  ),
  tabBarItemStyle: {
    flex: 1,
    minWidth: 0,
    minHeight: TAB_BAR_ITEM_HEIGHT,
    borderRadius: 9999,
    marginVertical: 0,
    marginHorizontal: 4,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  tabBarIconStyle: {
    marginBottom: -1,
  },
  tabBarLabelStyle: {
    fontFamily: typography.body,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 10,
    textAlign: "center",
  },
} as const;

const organizerTabOptions = {
  ...visitorTabOptions,
  tabBarActiveTintColor: palette.background,
  tabBarInactiveTintColor: palette.backgroundAlt,
} as const;

function renderTabIcon({ color, focused }: TabIconProps, activeName: IoniconName, inactiveName: IoniconName, activeBadgeColor: string) {
  return (
    <View style={[styles.tabIconBadge, focused && { backgroundColor: activeBadgeColor }]}>
      <Ionicons name={focused ? activeName : inactiveName} size={22} color={focused ? palette.background : color} />
    </View>
  );
}

function renderGalleryTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "grid", "grid-outline", palette.accent);
}

function renderDiscoverTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "compass", "compass-outline", palette.accent);
}

function renderVaultTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "wallet", "wallet-outline", palette.accent);
}

function renderProfileTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "person", "person-outline", palette.accent);
}

function renderOrganizerProfileTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "person", "person-outline", palette.gold);
}

function renderDashboardTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "speedometer", "speedometer-outline", palette.gold);
}

function renderPipelineTabIcon(props: TabIconProps) {
  return renderTabIcon(props, "file-tray-full", "file-tray-full-outline", palette.gold);
}

function toVisitorProfileView(user: User | null, profile: VisitorProfile | null): UserProfile | null {
  if (!user) {
    return null;
  }

  return {
    id: profile?.id ?? `${user.id}-visitor`,
    userId: user.id,
    name: profile?.name ?? user.email.split("@")[0],
    avatarUrl: profile?.avatarUrl,
    fullName: profile?.fullName ?? profile?.name ?? user.email,
    email: user.email,
    phoneNumber: profile?.phoneNumber,
    role: "visitor",
    tagline: profile?.tagline ?? "Discover, reserve, review, and collect stamps.",
    city: profile?.city,
    membershipLabel: profile?.membershipLabel ?? "Member",
    stats: [
      { label: "Workspace", value: "Visitor" },
      { label: "Session", value: "Ready" },
    ],
    highlights: [profile?.membershipLabel, profile?.city, profile?.accessibilityNotes].filter(
      (value): value is string => Boolean(value?.trim())
    ),
  };
}

function toOrganizerProfileView(user: User | null, profile: OrganizerProfile | null): UserProfile | null {
  if (!user) {
    return null;
  }

  return {
    id: profile?.id ?? `${user.id}-organizer`,
    userId: user.id,
    name: profile?.name ?? user.email.split("@")[0],
    avatarUrl: profile?.avatarUrl,
    fullName: profile?.organizationName ?? profile?.name ?? user.email,
    email: user.email,
    phoneNumber: profile?.phoneNumber,
    role: "organizer",
    tagline: profile?.tagline ?? "Publish exhibitions and manage the live queue.",
    city: profile?.city,
    stats: [
      { label: "Workspace", value: "Organizer" },
      { label: "Session", value: "Ready" },
    ],
    highlights: [profile?.organizationName, profile?.city].filter(
      (value): value is string => Boolean(value?.trim())
    ),
  };
}

function VisitorTabShell({
  onOpenGallery,
  onSwitchRole,
  onLogout,
  profile,
}: Readonly<{
  onOpenGallery: (galleryId: string) => void;
  onSwitchRole: () => void;
  onLogout: () => void;
  profile: UserProfile | null;
}>) {
  const insets = useSafeAreaInsets();

  return (
    <VisitorTabs.Navigator
      screenOptions={{
        ...visitorTabOptions,
        tabBarStyle: {
          ...visitorTabOptions.tabBarStyle,
          bottom: insets.bottom > 0 ? insets.bottom : 24,
          paddingTop: 6,
          paddingBottom: 6,
          paddingHorizontal: 10,
        },
        tabBarIconStyle: {
          marginBottom: -1,
        },
        tabBarLabelStyle: {
          ...visitorTabOptions.tabBarLabelStyle,
          marginTop: 0,
          marginBottom: 0,
          textAlignVertical: "center",
        },
      }}
    >
      <VisitorTabs.Screen
        name="Gallery"
        options={{
          title: "Gallery",
          tabBarIcon: renderGalleryTabIcon,
        }}
      >
        {() => <GalleryHomeScreen onOpenGallery={onOpenGallery} />}
      </VisitorTabs.Screen>
      <VisitorTabs.Screen
        name="Discover"
        options={{
          title: "Discover",
          tabBarIcon: renderDiscoverTabIcon,
        }}
      >
        {() => <DiscoverMapScreen onOpenGallery={onOpenGallery} />}
      </VisitorTabs.Screen>
      <VisitorTabs.Screen
        name="Vault"
        options={{
          title: "Vault",
          tabBarIcon: renderVaultTabIcon,
        }}
      >
        {() => <StampVaultScreen profile={profile} onOpenGallery={onOpenGallery} />}
      </VisitorTabs.Screen>
      <VisitorTabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: renderProfileTabIcon,
        }}
      >
        {() => <ProfileScreen role="VISITOR" profile={profile} onSwitchRole={onSwitchRole} onLogout={onLogout} />}
      </VisitorTabs.Screen>
    </VisitorTabs.Navigator>
  );
}

function OrganizerTabShell({
  onCreateExhibition,
  onEditExhibition,
  onOpenFormBuilder,
  onOpenSubmissions,
  onSwitchRole,
  onLogout,
  profile,
}: Readonly<{
  onCreateExhibition: () => void;
  onEditExhibition: (exhibitionId: string) => void;
  onOpenFormBuilder: (exhibitionId: string) => void;
  onOpenSubmissions: (exhibitionId: string) => void;
  onSwitchRole: () => void;
  onLogout: () => void;
  profile: UserProfile | null;
}>) {
  const insets = useSafeAreaInsets();

  return (
    <OrganizerTabs.Navigator
      screenOptions={{
        ...organizerTabOptions,
        tabBarStyle: {
          ...organizerTabOptions.tabBarStyle,
          bottom: insets.bottom > 0 ? insets.bottom : 24,
          paddingTop: 6,
          paddingBottom: 6,
          paddingHorizontal: 10,
        },
        tabBarIconStyle: {
          marginBottom: -1,
        },
        tabBarLabelStyle: {
          ...organizerTabOptions.tabBarLabelStyle,
          marginTop: 0,
          marginBottom: 0,
          textAlignVertical: "center",
        },
      }}
    >
      <OrganizerTabs.Screen name="Dashboard" options={{ title: "Overview", tabBarIcon: renderDashboardTabIcon }}>
        {() => (
          <OrganizerDashboardScreen
            onCreateExhibition={onCreateExhibition}
            onEditExhibition={onEditExhibition}
            onOpenFormBuilder={onOpenFormBuilder}
            onOpenSubmissions={onOpenSubmissions}
          />
        )}
      </OrganizerTabs.Screen>
      <OrganizerTabs.Screen name="Pipeline" options={{ title: "Queue", tabBarIcon: renderPipelineTabIcon }}>
        {() => (
          <SubmissionPipelineScreen onOpenSubmissions={onOpenSubmissions} />
        )}
      </OrganizerTabs.Screen>
      <OrganizerTabs.Screen name="Profile" options={{ title: "Profile", tabBarIcon: renderOrganizerProfileTabIcon }}>
        {() => <ProfileScreen role="ORGANIZER" profile={profile} onSwitchRole={onSwitchRole} onLogout={onLogout} />}
      </OrganizerTabs.Screen>
    </OrganizerTabs.Navigator>
  );
}

export function AppNavigator() {
  const hydrate = useSessionStore((state) => state.hydrate);
  const setSessionEnvelope = useSessionStore((state) => state.setSessionEnvelope);
  const clearSession = useSessionStore((state) => state.clearSession);
  const switchRole = useSessionStore((state) => state.switchRole);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const token = useSessionStore((state) => state.token);
  const user = useSessionStore((state) => state.user);
  const activeRole = useSessionStore((state) => state.activeRole);
  const visitorBootstrap = useSessionStore((state) => state.visitorProfile);
  const organizerBootstrap = useSessionStore((state) => state.organizerProfile);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const sessionQuery = useQuery({
    queryKey: ["session-bootstrap", token],
    queryFn: () => authApi.getSession(),
    enabled: hasHydrated && Boolean(token),
    retry: false,
    staleTime: 300_000,
  });

  useEffect(() => {
    if (sessionQuery.data) {
      void setSessionEnvelope(sessionQuery.data);
    }
  }, [sessionQuery.data, setSessionEnvelope]);
  const visitorProfileView = useMemo(
    () => toVisitorProfileView(user, visitorBootstrap),
    [user, visitorBootstrap]
  );
  const organizerProfileView = useMemo(
    () => toOrganizerProfileView(user, organizerBootstrap),
    [user, organizerBootstrap]
  );

  if (!hasHydrated) {
    return (
      <ScreenShell title="Restoring workspace" subtitle="Loading the saved session and role selection before routing into the app.">
        <StatusChip label="Session bootstrap" tone="neutral" />
      </ScreenShell>
    );
  }

  if (token && sessionQuery.isError) {
    return (
      <ScreenShell title="Session recovery needed" subtitle="The saved token could not restore the current workspace bootstrap.">
        <ErrorRecoveryPanel
          description={sessionQuery.error instanceof Error ? sessionQuery.error.message : "Session bootstrap failed."}
          onRetry={() => {
            sessionQuery.refetch();
          }}
          secondaryLabel="Sign out"
          onSecondaryAction={() => {
            void clearSession();
          }}
        />
      </ScreenShell>
    );
  }

  const resolvedRole = activeRole ?? user?.preferredRole ?? user?.role ?? "VISITOR";
  const isAuthenticated = Boolean(token);
  let initialRouteName: keyof RootStackParamList = "Login";
  if (isAuthenticated) {
    initialRouteName = resolvedRole === "ORGANIZER" ? "OrganizerTabs" : "VisitorTabs";
  }
  const navigatorKey = token ? `member-${resolvedRole}` : "guest";

  let rootScreen = (
    <RootStack.Screen name="Login" options={{ headerShown: false }}>
      {() => <LoginEntryScreen />}
    </RootStack.Screen>
  );

  if (isAuthenticated && resolvedRole === "ORGANIZER") {
    rootScreen = (
      <RootStack.Screen name="OrganizerTabs" options={{ headerShown: false }}>
        {({ navigation }) => (
          <OrganizerTabShell
            onCreateExhibition={() => navigation.navigate("ExhibitionEditor", {})}
            onEditExhibition={(exhibitionId) => navigation.navigate("ExhibitionEditor", { exhibitionId })}
            onOpenFormBuilder={(exhibitionId) => navigation.navigate("FormBuilder", { exhibitionId })}
            onOpenSubmissions={(exhibitionId) => navigation.navigate("SubmissionReview", { exhibitionId })}
            onSwitchRole={() => {
              void switchRole("VISITOR");
            }}
            onLogout={() => {
              void clearSession();
            }}
            profile={organizerProfileView}
          />
        )}
      </RootStack.Screen>
    );
  } else if (isAuthenticated) {
    rootScreen = (
      <RootStack.Screen name="VisitorTabs" options={{ headerShown: false }}>
        {({ navigation }) => (
          <VisitorTabShell
            onOpenGallery={(galleryId) => navigation.navigate("GalleryDetail", { galleryId })}
            onSwitchRole={() => {
              void switchRole("ORGANIZER");
            }}
            onLogout={() => {
              void clearSession();
            }}
            profile={visitorProfileView}
          />
        )}
      </RootStack.Screen>
    );
  }

  return (
    <NavigationContainer key={navigatorKey} theme={navigationTheme}>
      <RootStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerTintColor: palette.text,
          headerStyle: { backgroundColor: palette.background },
          headerTitleStyle: { fontFamily: typography.body, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        {rootScreen}

        {token ? (
          <>
            <RootStack.Screen name="GalleryDetail" options={{ title: "Exhibition Details", headerBackTitle: "Back" }}>
              {({ route, navigation }) => (
                <GalleryDetailScreen
                  galleryId={route.params.galleryId}
                  onOpenRegistration={() => navigation.navigate("EventRegistration", { galleryId: route.params.galleryId })}
                  onOpenReview={() => navigation.navigate("ReviewHub", { galleryId: route.params.galleryId })}
                />
              )}
            </RootStack.Screen>

            <RootStack.Screen name="EventRegistration" options={{ title: "Reserve Visit", headerBackTitle: "Back" }}>
              {({ route }) => <EventRegistrationScreen exhibitionId={route.params.galleryId} />}
            </RootStack.Screen>

            <RootStack.Screen name="ReviewHub" options={{ title: "Review & Comment", headerBackTitle: "Back" }}>
              {({ route }) => <ReviewHubScreen exhibitionId={route.params.galleryId} />}
            </RootStack.Screen>

            <RootStack.Screen name="ExhibitionEditor" options={{ title: "Exhibition Studio", headerBackTitle: "Back" }}>
              {({ route, navigation }) => {
                const exhibitionId = route.params.exhibitionId;

                return (
                  <OrganizerToolsScreen
                    key={exhibitionId ?? "new"}
                    exhibitionId={exhibitionId}
                    onOpenFormBuilder={(nextExhibitionId) => navigation.navigate("FormBuilder", { exhibitionId: nextExhibitionId })}
                  />
                );
              }}
            </RootStack.Screen>

            <RootStack.Screen name="FormBuilder" options={{ title: "Form Builder", headerBackTitle: "Back" }}>
              {({ route }) => <FormBuilderScreen key={route.params.exhibitionId} exhibitionId={route.params.exhibitionId} />}
            </RootStack.Screen>

            <RootStack.Screen name="SubmissionReview" options={{ title: "Submission Review", headerBackTitle: "Back" }}>
              {({ route }) => <SubmissionReviewScreen key={route.params.exhibitionId} exhibitionId={route.params.exhibitionId} />}
            </RootStack.Screen>
          </>
        ) : null}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: "rgba(41, 37, 36, 0.72)",
  },
  tabBarBackgroundTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(41, 37, 36, 0.2)",
  },
  tabIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
