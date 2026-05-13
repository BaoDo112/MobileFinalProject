import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  exhibitionFormsById,
  exhibitionSubmissionsById,
  galleries,
  galleryReviews,
  organizerExhibitions,
  organizerProfile,
  passportStamps,
  registrationFormsByGallery,
  visitSlotsByGallery,
  visitorProfile
} from "../data/mockData";
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
import { palette, radii, spacing, typography } from "../theme/tokens";
import type { UserRole } from "../types/models";

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

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.background,
    text: palette.text,
    border: "transparent",
    primary: palette.accent,
    notification: palette.gold
  }
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
    paddingBottom: spacing.xs
  },
  tabBarItemStyle: {
    borderRadius: radii.pill,
    marginHorizontal: spacing.xxs,
    marginVertical: spacing.xxs
  },
  tabBarActiveBackgroundColor: palette.backgroundAlt,
  tabBarLabelStyle: {
    fontFamily: typography.body,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  }
} as const;

const visitorTabOptions = {
  headerShown: false,
  tabBarActiveTintColor: palette.background,
  tabBarInactiveTintColor: palette.backgroundAlt,
  tabBarShowLabel: true,
  tabBarStyle: {
    position: "absolute",
    bottom: 56,
    left: 19.5,
    right: 19.5,
    height: 80,
    borderRadius: 9999,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: "hidden"
  },
  tabBarBackground: () => (
    <View style={{ flex: 1, borderRadius: 9999, overflow: "hidden" }}>
      <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(41, 37, 36, 0.2)" }} />
    </View>
  ),
  tabBarItemStyle: {
    borderRadius: 9999,
    marginVertical: 12,
    marginHorizontal: 8,
    padding: 0,
    overflow: "hidden",
  },
  tabBarActiveBackgroundColor: palette.accent,
  tabBarLabelStyle: {
    fontFamily: typography.body,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  }
} as const;

function VisitorTabShell({
  onOpenGallery,
  onSwitchRole
}: Readonly<{
  onOpenGallery: (galleryId: string) => void;
  onSwitchRole: () => void;
}>) {
  return (
    <VisitorTabs.Navigator screenOptions={visitorTabOptions}>
      <VisitorTabs.Screen
        name="Gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
        }}
      >
        {() => <GalleryHomeScreen galleries={galleries} onOpenGallery={onOpenGallery} />}
      </VisitorTabs.Screen>
      <VisitorTabs.Screen
        name="Discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "compass" : "compass-outline"} size={24} color={color} />
        }}
      >
        {() => <DiscoverMapScreen galleries={galleries} onOpenGallery={onOpenGallery} />}
      </VisitorTabs.Screen>
      <VisitorTabs.Screen
        name="Vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
        }}
      >
        {() => <StampVaultScreen stamps={passportStamps} profile={visitorProfile} onOpenGallery={onOpenGallery} />}
      </VisitorTabs.Screen>
      <VisitorTabs.Screen 
        name="Profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
        }}
      >
        {() => <ProfileScreen role="visitor" profile={visitorProfile} onSwitchRole={onSwitchRole} />}
      </VisitorTabs.Screen>
    </VisitorTabs.Navigator>
  );
}

function OrganizerTabShell({
  onCreateExhibition,
  onEditExhibition,
  onOpenFormBuilder,
  onOpenSubmissions,
  onSwitchRole
}: Readonly<{
  onCreateExhibition: () => void;
  onEditExhibition: (exhibitionId: string) => void;
  onOpenFormBuilder: (exhibitionId: string) => void;
  onOpenSubmissions: (exhibitionId: string) => void;
  onSwitchRole: () => void;
}>) {
  return (
    <OrganizerTabs.Navigator screenOptions={sharedTabOptions}>
      <OrganizerTabs.Screen name="Dashboard" options={{ title: "Dashboard" }}>
        {() => (
          <OrganizerDashboardScreen
            exhibitions={organizerExhibitions}
            onCreateExhibition={onCreateExhibition}
            onEditExhibition={onEditExhibition}
            onOpenFormBuilder={onOpenFormBuilder}
            onOpenSubmissions={onOpenSubmissions}
          />
        )}
      </OrganizerTabs.Screen>
      <OrganizerTabs.Screen name="Pipeline" options={{ title: "Pipeline" }}>
        {() => (
          <SubmissionPipelineScreen
            exhibitions={organizerExhibitions}
            submissionsByExhibition={exhibitionSubmissionsById}
            onOpenSubmissions={onOpenSubmissions}
          />
        )}
      </OrganizerTabs.Screen>
      <OrganizerTabs.Screen name="Profile" options={{ title: "Profile" }}>
        {() => <ProfileScreen role="organizer" profile={organizerProfile} onSwitchRole={onSwitchRole} />}
      </OrganizerTabs.Screen>
    </OrganizerTabs.Navigator>
  );
}

export function AppNavigator() {
  const [role, setRole] = useState<UserRole>("visitor");

  const galleryMap = useMemo(
    () => new Map(galleries.map((gallery) => [gallery.id, gallery])),
    []
  );

  const exhibitionMap = useMemo(
    () => new Map(organizerExhibitions.map((exhibition) => [exhibition.id, exhibition])),
    []
  );

  return (
    <NavigationContainer key={role} theme={navigationTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerTintColor: palette.text,
          headerStyle: { backgroundColor: palette.background },
          headerTitleStyle: { fontFamily: typography.body, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background }
        }}
      >
        <RootStack.Screen name="Login" options={{ headerShown: false }}>
          {({ navigation }) => (
            <LoginEntryScreen
              onContinue={(selectedRole) => {
                setRole(selectedRole);
                navigation.replace(selectedRole === "visitor" ? "VisitorTabs" : "OrganizerTabs");
              }}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="VisitorTabs" options={{ headerShown: false }}>
          {({ navigation }) => (
            <VisitorTabShell
              onOpenGallery={(galleryId) => navigation.navigate("GalleryDetail", { galleryId })}
              onSwitchRole={() => {
                setRole("organizer");
                navigation.replace("OrganizerTabs");
              }}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="OrganizerTabs" options={{ headerShown: false }}>
          {({ navigation }) => (
            <OrganizerTabShell
              onCreateExhibition={() => navigation.navigate("ExhibitionEditor", {})}
              onEditExhibition={(exhibitionId) => navigation.navigate("ExhibitionEditor", { exhibitionId })}
              onOpenFormBuilder={(exhibitionId) => navigation.navigate("FormBuilder", { exhibitionId })}
              onOpenSubmissions={(exhibitionId) => navigation.navigate("SubmissionReview", { exhibitionId })}
              onSwitchRole={() => {
                setRole("visitor");
                navigation.replace("VisitorTabs");
              }}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen
          name="GalleryDetail"
          options={{ title: "Exhibition Details", headerBackTitle: "Back" }}
        >
          {({ route, navigation }) => (
            <GalleryDetailScreen
              gallery={galleryMap.get(route.params.galleryId)}
              reviews={galleryReviews[route.params.galleryId] ?? []}
              onOpenRegistration={() => navigation.navigate("EventRegistration", { galleryId: route.params.galleryId })}
              onOpenReview={() => navigation.navigate("ReviewHub", { galleryId: route.params.galleryId })}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="EventRegistration" options={{ title: "Reserve Visit", headerBackTitle: "Back" }}>
          {({ route }) => (
            <EventRegistrationScreen
              gallery={galleryMap.get(route.params.galleryId)}
              fields={registrationFormsByGallery[route.params.galleryId] ?? []}
              slots={visitSlotsByGallery[route.params.galleryId] ?? []}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="ReviewHub" options={{ title: "Review & Comment", headerBackTitle: "Back" }}>
          {({ route }) => (
            <ReviewHubScreen
              gallery={galleryMap.get(route.params.galleryId)}
              reviews={galleryReviews[route.params.galleryId] ?? []}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="ExhibitionEditor" options={{ title: "Exhibition Studio", headerBackTitle: "Back" }}>
          {({ route, navigation }) => {
            const exhibitionId = route.params.exhibitionId;
            const exhibition = exhibitionId ? exhibitionMap.get(exhibitionId) : undefined;

            return (
              <OrganizerToolsScreen
                key={exhibitionId ?? "new"}
                exhibition={exhibition}
                formFields={exhibitionId ? exhibitionFormsById[exhibitionId] ?? [] : []}
                onOpenFormBuilder={exhibitionId ? () => navigation.navigate("FormBuilder", { exhibitionId }) : undefined}
              />
            );
          }}
        </RootStack.Screen>

        <RootStack.Screen name="FormBuilder" options={{ title: "Form Builder", headerBackTitle: "Back" }}>
          {({ route }) => (
            <FormBuilderScreen
              key={route.params.exhibitionId}
              exhibition={exhibitionMap.get(route.params.exhibitionId)}
              initialFields={exhibitionFormsById[route.params.exhibitionId] ?? []}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="SubmissionReview" options={{ title: "Submission Review", headerBackTitle: "Back" }}>
          {({ route }) => (
            <SubmissionReviewScreen
              key={route.params.exhibitionId}
              exhibition={exhibitionMap.get(route.params.exhibitionId)}
              submissions={exhibitionSubmissionsById[route.params.exhibitionId] ?? []}
            />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
