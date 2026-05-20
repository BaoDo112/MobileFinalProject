import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
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
import { palette, radii, spacing, typography } from "../theme/tokens";
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

const sharedTabOptions = {
  headerShown: false,
  tabBarActiveTintColor: palette.text,
  tabBarInactiveTintColor: palette.background,
  tabBarStyle: {
    backgroundColor: palette.text,
    borderTopWidth: 0,
    height: 72,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  tabBarItemStyle: {
    borderRadius: radii.pill,
    marginHorizontal: spacing.xxs,
    marginVertical: spacing.xxs,
  },
  tabBarActiveBackgroundColor: palette.backgroundAlt,
  tabBarLabelStyle: {
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
} as const;

const visitorTabOptions = {
  headerShown: false,
  tabBarActiveTintColor: palette.background,
  tabBarInactiveTintColor: palette.backgroundAlt,
  tabBarShowLabel: true,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    left: 19.5,
    right: 19.5,
    height: 56,
    borderRadius: 9999,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: "hidden",
  },
  tabBarBackground: () => (
    <View style={{ flex: 1, borderRadius: 9999, overflow: "hidden", backgroundColor: "rgba(41, 37, 36, 0.72)" }}>
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(41, 37, 36, 0.2)" }} />
    </View>
  ),
  tabBarItemStyle: {
    borderRadius: 9999,
    marginVertical: 2,
    marginHorizontal: 6,
    paddingVertical: 0,
    overflow: "hidden",
  },
  tabBarActiveBackgroundColor: palette.accent,
  tabBarIconStyle: {
    marginBottom: -2,
  },
  tabBarLabelStyle: {
    fontFamily: typography.body,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 0,
    lineHeight: 11,
  },
} as const;

function renderGalleryTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />;
}

function renderDiscoverTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons name={focused ? "compass" : "compass-outline"} size={22} color={color} />;
}

function renderVaultTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} />;
}

function renderProfileTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />;
}

function toVisitorProfileView(user: User | null, profile: VisitorProfile | null): UserProfile | null {
  if (!user) {
    return null;
  }

  return {
    id: profile?.id ?? `${user.id}-visitor`,
    userId: user.id,
    name: profile?.name ?? user.email.split("@")[0],
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
          bottom: insets.bottom + 8,
          height: 56 + insets.bottom,
          paddingTop: 2,
          paddingBottom: 2,
          justifyContent: "center",
        },
        tabBarItemStyle: {
          ...visitorTabOptions.tabBarItemStyle,
          flex: 1,
          marginVertical: 1,
          marginHorizontal: 2,
          paddingVertical: 0,
          paddingHorizontal: 8,
          height: 54,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIconStyle: {
          marginBottom: -1,
        },
        tabBarLabelStyle: {
          ...visitorTabOptions.tabBarLabelStyle,
          fontSize: 10,
          lineHeight: 10,
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
  return (
    <OrganizerTabs.Navigator screenOptions={sharedTabOptions}>
      <OrganizerTabs.Screen name="Dashboard" options={{ title: "Dashboard" }}>
        {() => (
          <OrganizerDashboardScreen
            onCreateExhibition={onCreateExhibition}
            onEditExhibition={onEditExhibition}
            onOpenFormBuilder={onOpenFormBuilder}
            onOpenSubmissions={onOpenSubmissions}
          />
        )}
      </OrganizerTabs.Screen>
      <OrganizerTabs.Screen name="Pipeline" options={{ title: "Pipeline" }}>
        {() => (
          <SubmissionPipelineScreen onOpenSubmissions={onOpenSubmissions} />
        )}
      </OrganizerTabs.Screen>
      <OrganizerTabs.Screen name="Profile" options={{ title: "Profile" }}>
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
