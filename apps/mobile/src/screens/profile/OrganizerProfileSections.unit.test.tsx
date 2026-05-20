import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { profileApi } from "../../api/profile";
import type { NotificationSettingsDto, OrganizerNotificationsDto } from "../../types/api";
import type { UserProfile } from "../../types/models";
import { OrganizerProfileSections } from "./OrganizerProfileSections";

jest.mock("../../api/profile", () => ({
  profileApi: {
    getNotificationSettings: jest.fn(),
    getOrganizerNotifications: jest.fn(),
    updateNotificationSettings: jest.fn(),
  },
}));

const profile: UserProfile = {
  id: "org-profile-1",
  userId: "org-user-1",
  name: "Arthera Studio",
  fullName: "Arthera Studio",
  email: "hello@arthera.local",
  phoneNumber: "+84 28 5555 0123",
  role: "organizer",
  tagline: "Publishing intimate exhibition formats.",
  city: "Ho Chi Minh City",
  membershipLabel: "Organizer tier",
  stats: [],
  highlights: [],
};

const notificationSettings: NotificationSettingsDto = {
  emailAlerts: true,
  pushAlerts: false,
  reminderAlerts: true,
  queueAlerts: true,
  marketingOptIn: false,
};

const organizerNotifications: OrganizerNotificationsDto = {
  queueCounts: {
    pending: 1,
    confirmed: 2,
    waitlisted: 1,
    rejected: 0,
    checkedIn: 3,
  },
  reminderWindowLabel: "Reminder job runs 24 hours before each scheduled session window.",
  digestCadenceLabel: "Digest cadence follows email alerts with queue escalation enabled.",
  supportLinks: [
    {
      label: "Support inbox",
      url: "mailto:support@arthera.local",
      description: "Use when an attendee needs a manual queue update.",
    },
  ],
};

describe("OrganizerProfileSections", () => {
  const mockedProfileApi = jest.mocked(profileApi);
  const queryClients: QueryClient[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProfileApi.getNotificationSettings.mockResolvedValue(notificationSettings);
    mockedProfileApi.getOrganizerNotifications.mockResolvedValue(organizerNotifications);
    mockedProfileApi.updateNotificationSettings.mockResolvedValue(notificationSettings);
  });

  afterEach(() => {
    queryClients.splice(0).forEach((client) => client.clear());
  });

  function renderSection() {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    queryClients.push(client);

    return render(
      <QueryClientProvider client={client}>
        <OrganizerProfileSections profile={profile} />
      </QueryClientProvider>
    );
  }

  it("renders organizer queue health and support metadata", async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText("Workspace identity")).toBeOnTheScreen();
    });

    expect(screen.getByText("Support inbox")).toBeOnTheScreen();
    expect(screen.getByText("Reminder job runs 24 hours before each scheduled session window.")).toBeOnTheScreen();
    expect(screen.getByText("3")).toBeOnTheScreen();
  });

  it("submits organizer notification preferences", async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText("Save preferences")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("Save preferences"));

    await waitFor(() => {
      expect(mockedProfileApi.updateNotificationSettings).toHaveBeenCalledWith(notificationSettings);
    });
  });
});