import type { PropsWithChildren, ReactElement } from "react";
import { Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react-native";

import { authApi } from "../api/auth";
import { profileApi } from "../api/profile";
import { registrationsApi } from "../api/registrations";
import { GalleryDetailScreen } from "../screens/GalleryDetailScreen";
import { GalleryHomeScreen } from "../screens/GalleryHomeScreen";
import { DiscoverMapScreen } from "../screens/DiscoverMapScreen";
import { EventRegistrationScreen } from "../screens/EventRegistrationScreen";
import { FormBuilderScreen } from "../screens/FormBuilderScreen";
import { LoginEntryScreen } from "../screens/LoginEntryScreen";
import { OrganizerDashboardScreen } from "../screens/OrganizerDashboardScreen";
import { OrganizerToolsScreen } from "../screens/OrganizerToolsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ReviewHubScreen } from "../screens/ReviewHubScreen";
import { StampVaultScreen } from "../screens/StampVaultScreen";
import { SubmissionPipelineScreen } from "../screens/SubmissionPipelineScreen";
import { SubmissionReviewScreen } from "../screens/SubmissionReviewScreen";
import { useDiscover } from "../query/useDiscover";
import { useExhibitionDetail } from "../query/useExhibitionDetail";
import { useExhibitionEditor } from "../query/useExhibitionEditor";
import { useFormBuilder } from "../query/useFormBuilder";
import { useOrganizerDashboard } from "../query/useOrganizerDashboard";
import { useReviewHub } from "../query/useReviewHub";
import { useStampVault } from "../query/useStampVault";
import { useSubmissionPipeline } from "../query/useSubmissionPipeline";
import { useSubmissionReview } from "../query/useSubmissionReview";
import { useVisitorProfile } from "../query/useVisitorProfile";
import type {
  AuthSessionEnvelope,
  ExhibitionDetailDto,
  ExhibitionEditorDto,
  ExhibitionSummaryDto,
  FormSchemaEditorDto,
  NotificationSettingsDto,
  OrganizerDashboardDto,
  OrganizerNotificationsDto,
  RegistrationDraftDto,
  ReviewHubDto,
  SessionAvailabilityDto,
  StampProgressDto,
  SubmissionPipelineDto,
  SubmissionReviewDto,
  VisitorWorkspaceDto,
} from "../types/api";

const mockSetSessionEnvelope = jest.fn();
const mockSessionState = {
  user: {
    id: "user-1",
    email: "smoke.visitor@arthera.local",
    role: "VISITOR" as const,
    preferredRole: "VISITOR" as const,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  visitorProfile: {
    id: "visitor-profile-1",
    userId: "user-1",
    name: "Smoke Visitor",
    fullName: "Smoke Visitor",
    phoneNumber: "0900222333",
    membershipLabel: "Collector tier",
    accessibilityNotes: "Quiet route preferred",
  },
  setSessionEnvelope: mockSetSessionEnvelope,
};

jest.mock("../query/useDiscover", () => ({
  useDiscover: jest.fn(),
}));

jest.mock("../query/useExhibitionDetail", () => ({
  useExhibitionDetail: jest.fn(),
}));

jest.mock("../query/useReviewHub", () => ({
  useReviewHub: jest.fn(),
}));

jest.mock("../query/useStampVault", () => ({
  useStampVault: jest.fn(),
}));

jest.mock("../query/useOrganizerDashboard", () => ({
  useOrganizerDashboard: jest.fn(),
}));

jest.mock("../query/useExhibitionEditor", () => ({
  useExhibitionEditor: jest.fn(),
}));

jest.mock("../query/useFormBuilder", () => ({
  useFormBuilder: jest.fn(),
}));

jest.mock("../query/useSubmissionPipeline", () => ({
  useSubmissionPipeline: jest.fn(),
}));

jest.mock("../query/useSubmissionReview", () => ({
  useSubmissionReview: jest.fn(),
}));

jest.mock("../query/useVisitorProfile", () => ({
  useVisitorProfile: jest.fn(),
}));

jest.mock("../api/auth", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    continueWithGoogle: jest.fn(),
  },
}));

jest.mock("../api/registrations", () => ({
  registrationsApi: {
    listSessions: jest.fn(),
    getDraft: jest.fn(),
    submit: jest.fn(),
  },
}));

jest.mock("../api/profile", () => ({
  profileApi: {
    getNotificationSettings: jest.fn(),
    getOrganizerNotifications: jest.fn(),
    updateNotificationSettings: jest.fn(),
    getVisitorWorkspace: jest.fn(),
  },
}));

jest.mock("../state/session", () => ({
  useSessionStore: (selector: (state: typeof mockSessionState) => unknown) => selector(mockSessionState),
}));

jest.mock("../screens/MapComponent", () => {
  const { Pressable, Text, View } = require("react-native");

  const MockMap = ({ children }: PropsWithChildren) => (
    <View>
      <Text>Mock map</Text>
      {children}
    </View>
  );

  const Marker = ({ children, onPress }: PropsWithChildren<{ onPress?: (event: { stopPropagation: () => void }) => void }>) => (
    <Pressable onPress={() => onPress?.({ stopPropagation: () => undefined })}>
      {children}
    </Pressable>
  );

  return {
    __esModule: true,
    default: MockMap,
    Marker,
  };
});

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

const discoverItem: ExhibitionSummaryDto = {
  id: "g-01",
  title: "Lightwave: Kinetic Gallery",
  bio: "An immersive showcase where responsive projections react to live sound and body movement.",
  exhibitionType: "Technology",
  status: "PUBLISHED",
  timelineStatus: "PRESENT",
  organizerName: "Arthera Studio",
  district: "District 1",
  venueTitle: "Arthera Studio Hall A",
  dateLabel: "May 20 - May 28, 2026",
  timeLabel: "06:30 PM - 08:00 PM",
  capacityBadge: "12 spots left",
  registrationState: "open",
  accent: "#d66b55",
};

const sessionAvailability: SessionAvailabilityDto[] = [
  {
    sessionId: "s-01-2",
    dateLabel: "May 21, 2026",
    timeLabel: "06:30 PM - 08:00 PM",
    capacity: 32,
    remainingCapacity: 12,
    waitlistCapacity: 6,
    registrationState: "open",
    status: "SCHEDULED",
    vibe: "Quiet walkthrough",
  },
];

const detailData: ExhibitionDetailDto = {
  exhibition: discoverItem,
  venue: {
    id: "v-01",
    title: "Arthera Studio Hall A",
    district: "District 1",
    address: "25 Nguyen Hue, District 1, Ho Chi Minh City",
    city: "Ho Chi Minh City",
    latitude: 10.776531,
    longitude: 106.702087,
  },
  sessions: sessionAvailability,
  policyText: "Check in 15 minutes before your session.",
  curatorNote: "Arrive 10 minutes early for the intro loop and motion calibration.",
  highlights: ["Reactive projection hall", "Accessible pathway"],
  reviewPreview: [
    {
      id: "r-01",
      authorName: "Bao Nguyen",
      rating: 5,
      content: "The projection hall felt alive without becoming chaotic.",
      status: "PUBLISHED",
      createdAt: "2026-05-20T01:00:00.000Z",
    },
  ],
};

const registrationDraft: RegistrationDraftDto = {
  exhibitionId: "g-01",
  sessionId: "s-01-2",
  formSchemaVersionId: "fs-g-01-v1",
  fields: [
    {
      id: "full-name",
      label: "Full name",
      type: "TEXT",
      placeholder: "Your full name",
      isRequired: true,
      options: [],
      helpText: "Used for arrival check-in.",
      order: 1,
    },
  ],
  selectedSession: sessionAvailability[0],
  consentTitle: "Confirm your visit details",
  consentCopy: "Your answers are used for session planning and check-in.",
};

const reviewHub: ReviewHubDto = {
  exhibitionId: "g-01",
  exhibitionTitle: "Lightwave: Kinetic Gallery",
  averageRatingLabel: "4.7/5",
  reviewCount: 3,
  eligibility: {
    isEligible: true,
    checkedInAt: "2026-05-20T02:00:00.000Z",
    rewardNotice: "Publishing one post-visit review unlocks the community voice milestone stamp.",
  },
  composer: {
    reviewId: "review-1",
    rating: 4,
    content: "The quiet entry briefing kept the room calm while the projection wall shifted around the audience.",
    status: "PUBLISHED",
    submittedAt: "2026-05-20T03:00:00.000Z",
  },
  guidelines: ["Keep feedback concrete."],
  recentReviews: [
    {
      id: "r-01",
      authorName: "Bao Nguyen",
      rating: 5,
      content: "The projection hall felt alive without becoming chaotic.",
      status: "PUBLISHED",
      createdAt: "2026-05-20T01:00:00.000Z",
    },
  ],
};

const stampProgress: StampProgressDto = {
  totalUnlocked: 2,
  confirmedCount: 2,
  upcomingCount: 1,
  expiredCount: 0,
  nextMilestoneLabel: "Publish one visitor review",
  confirmedStamps: [
    {
      id: "stamp-1",
      exhibitionId: "g-01",
      source: "ATTENDANCE",
      vaultSection: "CONFIRMED",
      title: "Lightwave Attendance",
      milestone: "Visited and confirmed",
      note: "Attendance was verified from the organizer check-in flow.",
      accent: "#d66b55",
      unlockedAt: "2026-05-20T03:00:00.000Z",
    },
  ],
  upcomingStamps: [
    {
      id: "upcoming-1",
      exhibitionId: "g-02",
      source: "ATTENDANCE",
      vaultSection: "UPCOMING",
      title: "Roots in Motion",
      milestone: "Registration is active",
      note: "May 22, 2026 · 02:00 PM",
      accent: "#ba6f3d",
    },
  ],
  expiredStamps: [],
  lockedMilestones: [
    {
      id: "milestone-community-voice",
      title: "Community voice",
      milestone: "Publish one visitor review",
      note: "Visible post-visit feedback unlocks the review milestone stamp.",
      accent: "#6f4d67",
      unlocked: false,
    },
  ],
  history: [
    {
      id: "stamp-2",
      exhibitionId: "g-01",
      source: "MILESTONE",
      vaultSection: "CONFIRMED",
      title: "Community Voice",
      milestone: "Published visitor review",
      note: "Unlocked after a post-visit review became visible to the public feed.",
      accent: "#6f4d67",
      unlockedAt: "2026-05-20T04:00:00.000Z",
    },
  ],
};

const notificationSettings: NotificationSettingsDto = {
  emailAlerts: true,
  pushAlerts: false,
  reminderAlerts: true,
  queueAlerts: true,
  marketingOptIn: false,
};

const visitorWorkspace: VisitorWorkspaceDto = {
  user: mockSessionState.user,
  activeRole: "VISITOR",
  availableRoles: ["VISITOR", "ORGANIZER"],
  visitorProfile: {
    id: "visitor-profile-1",
    userId: "user-1",
    name: "Smoke Visitor",
    fullName: "Smoke Visitor",
    phoneNumber: "0900222333",
    membershipLabel: "Collector tier",
    accessibilityNotes: "Quiet route preferred",
  },
  notificationSettings,
  upcomingVisits: [
    {
      registrationId: "reg-1",
      exhibitionId: "g-01",
      exhibitionTitle: "Lightwave: Kinetic Gallery",
      status: "CONFIRMED",
      sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
    },
  ],
  pastVisits: [],
};

const organizerNotifications: OrganizerNotificationsDto = {
  queueCounts: {
    pending: 1,
    confirmed: 2,
    waitlisted: 1,
    rejected: 0,
    checkedIn: 1,
  },
  reminderWindowLabel: "Reminders run 24 hours before each scheduled session.",
  digestCadenceLabel: "Digest summary every morning at 08:00.",
  supportLinks: [
    {
      label: "Queue playbook",
      url: "https://example.invalid/queue",
      description: "Review triage guidance for organizers.",
    },
  ],
};

const dashboardData: OrganizerDashboardDto = {
  kpis: [
    { label: "Live exhibitions", value: "3", tone: "success" },
    { label: "Pending review", value: "1", tone: "alert" },
  ],
  urgentQueueCount: 2,
  sessionLoadSummary: "2 active exhibition windows · 1 waitlist queues live",
  exhibitions: [
    {
      exhibitionId: "g-01",
      title: "Lightwave: Kinetic Gallery",
      venueTitle: "Arthera Studio Hall A",
      status: "PUBLISHED",
      pendingCount: 1,
      checkedInCount: 1,
      nextAction: "Review pending submissions",
    },
  ],
};

const editorDraft: ExhibitionEditorDto = {
  exhibitionId: "g-04",
  organizerId: "org-04",
  organizerName: "Arthera Studio",
  title: "Signal Garden Draft",
  exhibitionType: "Installation",
  bio: "A sensory garden for small-group evening visits.",
  venueId: "v-01",
  status: "DRAFT",
  mediaUrls: ["https://example.invalid/poster.jpg"],
  curatorNote: "Open with the ambient route.",
  policyText: "Arrive 10 minutes early.",
  highlightList: ["Quiet route"],
  sessions: [
    {
      sessionId: "s-g-04-1",
      startsAt: "2026-06-10T11:00:00.000Z",
      endsAt: "2026-06-10T12:15:00.000Z",
      capacity: 18,
      reservedCount: 0,
      waitlistCapacity: 6,
      registrationState: "closed",
      status: "SCHEDULED",
      vibe: "Quiet walkthrough",
    },
  ],
  formSchema: {
    formSchemaVersionId: "fs-g-04-v2",
    version: 2,
    consentTitle: "Confirm your visit details",
    consentCopy: "Used for scheduling and check-in.",
    fieldCount: 1,
    isValid: true,
    validationIssues: [],
  },
  availableVenues: [
    {
      id: "v-01",
      title: "Arthera Studio Hall A",
      district: "District 1",
      address: "25 Nguyen Hue, District 1, Ho Chi Minh City",
      city: "Ho Chi Minh City",
    },
  ],
  checklist: {
    canPublish: true,
    blockingReasons: [],
    items: [
      { key: "title", label: "Title and concept", complete: true, detail: "Add an exhibition title and short concept." },
    ],
  },
  isLocked: false,
  createdAt: "2026-05-20T00:00:00.000Z",
  updatedAt: "2026-05-20T00:00:00.000Z",
};

const formSchema: FormSchemaEditorDto = {
  exhibitionId: "g-04",
  formSchemaVersionId: "fs-g-04-v2",
  version: 2,
  isActive: true,
  consentTitle: "Confirm your visit details",
  consentCopy: "Used for scheduling and check-in.",
  fields: registrationDraft.fields,
  validation: {
    fieldCount: 1,
    requiredFieldCount: 1,
    isValid: true,
    validationIssues: [],
  },
  updatedAt: "2026-05-20T00:00:00.000Z",
};

const pipelineData: SubmissionPipelineDto = {
  statusCounts: {
    pending: 1,
    confirmed: 2,
    waitlisted: 0,
    rejected: 0,
    checkedIn: 1,
  },
  urgentQueueCount: 1,
  boards: [
    {
      exhibitionId: "g-01",
      exhibitionTitle: "Lightwave: Kinetic Gallery",
      venueTitle: "Arthera Studio Hall A",
      statusCounts: {
        pending: 1,
        confirmed: 2,
        waitlisted: 0,
        rejected: 0,
        checkedIn: 1,
      },
      sessionWorkload: [
        {
          sessionId: "s-01-2",
          sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
          capacity: 32,
          reservedCount: 3,
          pendingCount: 1,
          confirmedCount: 2,
          waitlistedCount: 0,
          checkedInCount: 1,
          waitlistCapacity: 12,
          isOverCapacity: false,
        },
      ],
      waitlistSummary: [],
      queueCards: [
        {
          registrationId: "seed-reg-03",
          attendeeName: "Linh Dao",
          sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
          status: "PENDING",
          submittedAt: "2026-05-20T01:59:29.080Z",
          note: "Needs accessibility support confirmation.",
        },
      ],
    },
  ],
};

const submissionReview: SubmissionReviewDto = {
  exhibitionId: "g-01",
  exhibitionTitle: "Lightwave: Kinetic Gallery",
  venueTitle: "Arthera Studio Hall A",
  statusCounts: pipelineData.statusCounts,
  sessionWorkload: pipelineData.boards[0].sessionWorkload,
  queueCards: pipelineData.boards[0].queueCards,
  selectedSubmission: {
    registrationId: "seed-reg-03",
    attendeeName: "Linh Dao",
    status: "CONFIRMED",
    sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
    submittedAt: "2026-05-20T01:59:29.080Z",
    note: "Needs accessibility support confirmation.",
    availableActions: ["CHECK_IN", "WAITLIST", "REJECT"],
    answers: [{ label: "Email", value: "linh@example.com" }],
  },
};

const sessionEnvelope: AuthSessionEnvelope = {
  token: "token-123",
  user: mockSessionState.user,
  activeRole: "VISITOR",
  availableRoles: ["VISITOR", "ORGANIZER"],
  visitorProfile: visitorWorkspace.visitorProfile,
  notificationSettings,
};

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("v1.4 screen contract smoke", () => {
  const mockedUseDiscover = useDiscover as jest.Mock;
  const mockedUseExhibitionDetail = useExhibitionDetail as jest.Mock;
  const mockedUseReviewHub = useReviewHub as jest.Mock;
  const mockedUseStampVault = useStampVault as jest.Mock;
  const mockedUseOrganizerDashboard = useOrganizerDashboard as jest.Mock;
  const mockedUseExhibitionEditor = useExhibitionEditor as jest.Mock;
  const mockedUseFormBuilder = useFormBuilder as jest.Mock;
  const mockedUseSubmissionPipeline = useSubmissionPipeline as jest.Mock;
  const mockedUseSubmissionReview = useSubmissionReview as jest.Mock;
  const mockedUseVisitorProfile = useVisitorProfile as jest.Mock;
  const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
  const mockedRegistrationsApi = registrationsApi as jest.Mocked<typeof registrationsApi>;
  const mockedProfileApi = profileApi as jest.Mocked<typeof profileApi>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseDiscover.mockReturnValue({ data: [discoverItem], error: null, isError: false, isLoading: false, isFetching: false, refetch: jest.fn() });
    mockedUseExhibitionDetail.mockReturnValue({ data: detailData, error: null, isError: false, isLoading: false, refetch: jest.fn() });
    mockedUseReviewHub.mockReturnValue({ reviewQuery: { data: reviewHub, error: null, isError: false, isLoading: false, refetch: jest.fn() }, saveReviewMutation: { error: null, isError: false, isPending: false, mutate: jest.fn() } });
    mockedUseStampVault.mockReturnValue({ data: stampProgress, error: null, isError: false, isLoading: false, refetch: jest.fn() });
    mockedUseOrganizerDashboard.mockReturnValue({ data: dashboardData, error: null, isError: false, isLoading: false, refetch: jest.fn() });
    mockedUseExhibitionEditor.mockReturnValue({
      exhibitionId: "g-04",
      editorQuery: { data: editorDraft, error: null, isLoading: false, refetch: jest.fn() },
      createDraftMutation: { data: undefined, error: null, isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
      createVenueMutation: { isPending: false, mutateAsync: jest.fn() },
      saveDraftMutation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(editorDraft) },
      publishMutation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue({ ...editorDraft, status: "PUBLISHED" }) },
    });
    mockedUseFormBuilder.mockReturnValue({
      formSchemaQuery: { data: formSchema, error: null, isLoading: false, refetch: jest.fn() },
      saveFormSchemaMutation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(formSchema) },
    });
    mockedUseSubmissionPipeline.mockReturnValue({ data: pipelineData, error: null, isError: false, isLoading: false, refetch: jest.fn() });
    mockedUseSubmissionReview.mockReturnValue({ selectedRegistrationId: "seed-reg-03", setSelectedRegistrationId: jest.fn(), reviewQuery: { data: submissionReview, error: null, isError: false, isLoading: false, refetch: jest.fn() }, updateDecisionMutation: { error: null, isError: false, isPending: false, mutateAsync: jest.fn().mockResolvedValue(submissionReview) } });
    mockedUseVisitorProfile.mockReturnValue({ data: visitorWorkspace, error: null, isError: false, isLoading: false, refetch: jest.fn() });

    mockedAuthApi.login.mockResolvedValue(sessionEnvelope);
    mockedAuthApi.register.mockResolvedValue(sessionEnvelope);
    mockedAuthApi.continueWithGoogle.mockResolvedValue(sessionEnvelope);

    mockedRegistrationsApi.listSessions.mockResolvedValue(sessionAvailability);
    mockedRegistrationsApi.getDraft.mockResolvedValue(registrationDraft);
    mockedRegistrationsApi.submit.mockResolvedValue({
      registrationId: "reg-1",
      status: "CONFIRMED",
      sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
      submittedAt: "2026-05-20T04:00:00.000Z",
    });

    mockedProfileApi.getNotificationSettings.mockResolvedValue(notificationSettings);
    mockedProfileApi.getOrganizerNotifications.mockResolvedValue(organizerNotifications);
    mockedProfileApi.updateNotificationSettings.mockResolvedValue(notificationSettings);
    mockedProfileApi.getVisitorWorkspace.mockResolvedValue(visitorWorkspace);
  });

  it("mounts Screen 1 Auth", () => {
    renderWithClient(<LoginEntryScreen />);
    expect(screen.getByText("Continue with Google")).toBeOnTheScreen();
  });

  it("mounts Screen 2 Discover", () => {
    renderWithClient(<GalleryHomeScreen onOpenGallery={jest.fn()} />);
    expect(screen.getByText("Lightwave: Kinetic Gallery")).toBeOnTheScreen();
  });

  it("mounts Screen 3 Discover Map", () => {
    renderWithClient(<DiscoverMapScreen onOpenGallery={jest.fn()} />);
    expect(screen.getByText("Mock map")).toBeOnTheScreen();
  });

  it("mounts Screen 4 Exhibition Detail", () => {
    renderWithClient(<GalleryDetailScreen galleryId="g-01" onOpenRegistration={jest.fn()} onOpenReview={jest.fn()} />);
    expect(screen.getByText("Community preview")).toBeOnTheScreen();
  });

  it("mounts Screen 5 Event Registration", async () => {
    renderWithClient(<EventRegistrationScreen exhibitionId="g-01" />);

    await waitFor(() => {
      expect(screen.getByText("Reserve visit")).toBeOnTheScreen();
    });
  });

  it("mounts Screen 6 Review Hub", () => {
    renderWithClient(<ReviewHubScreen exhibitionId="g-01" />);
    expect(screen.getByText("Recent comments")).toBeOnTheScreen();
  });

  it("mounts Screen 7 Stamp Vault", () => {
    renderWithClient(
      <StampVaultScreen
        profile={{
          id: "profile-1",
          userId: "user-1",
          name: "Smoke Visitor",
          membershipLabel: "Collector tier",
          stats: [],
          highlights: [],
        }}
        onOpenGallery={jest.fn()}
      />
    );
    expect(screen.getByText("Milestone track")).toBeOnTheScreen();
  });

  it("mounts Screen 8 Visitor Profile", async () => {
    renderWithClient(
      <ProfileScreen
        role="VISITOR"
        profile={{
          id: "profile-1",
          userId: "user-1",
          name: "Smoke Visitor",
          fullName: "Smoke Visitor",
          membershipLabel: "Collector tier",
          stats: [],
          highlights: ["Collector tier"],
        }}
        onSwitchRole={jest.fn()}
        onLogout={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("1 upcoming")).toBeOnTheScreen();
    });
  });

  it("mounts Screen 9 Organizer Dashboard", () => {
    renderWithClient(
      <OrganizerDashboardScreen
        onCreateExhibition={jest.fn()}
        onEditExhibition={jest.fn()}
        onOpenFormBuilder={jest.fn()}
        onOpenSubmissions={jest.fn()}
      />
    );
    expect(screen.getByText("Command center")).toBeOnTheScreen();
  });

  it("mounts Screen 10 Exhibition Editor", () => {
    renderWithClient(<OrganizerToolsScreen exhibitionId="g-04" onOpenFormBuilder={jest.fn()} />);
    expect(screen.getByText("Signal Garden Draft")).toBeOnTheScreen();
  });

  it("mounts Screen 11 Form Builder", () => {
    renderWithClient(<FormBuilderScreen exhibitionId="g-04" />);
    expect(screen.getByText("Full name")).toBeOnTheScreen();
  });

  it("mounts Screen 12 Submission Pipeline", () => {
    renderWithClient(<SubmissionPipelineScreen onOpenSubmissions={jest.fn()} />);
    expect(screen.getByText("Submission pipeline")).toBeOnTheScreen();
  });

  it("mounts Screen 13 Submission Review and Organizer Profile contracts", async () => {
    renderWithClient(
      <View>
        <SubmissionReviewScreen exhibitionId="g-01" />
        <ProfileScreen
          role="ORGANIZER"
          profile={{
            id: "profile-2",
            userId: "user-2",
            name: "Smoke Organizer",
            fullName: "Smoke Organizer",
            stats: [],
            highlights: ["Queue ready"],
          }}
          onSwitchRole={jest.fn()}
          onLogout={jest.fn()}
        />
      </View>
    );

    expect(screen.getByText("Decision Actions")).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText("Queue health")).toBeOnTheScreen();
    });
  });
});