import * as SecureStore from "expo-secure-store";

import { authApi } from "../api/auth";
import { useSessionStore } from "./session";
import type { AuthSessionEnvelope } from "../types/api";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("../api/auth", () => ({
  authApi: {
    getSession: jest.fn(),
    selectActiveRole: jest.fn(),
  },
}));

const sessionEnvelope: AuthSessionEnvelope = {
  token: "token-123",
  user: {
    id: "user-1",
    email: "visitor@example.com",
    role: "VISITOR",
    preferredRole: "VISITOR",
    createdAt: "2026-05-18T00:00:00.000Z",
    updatedAt: "2026-05-18T00:00:00.000Z",
  },
  activeRole: "VISITOR",
  availableRoles: ["VISITOR", "ORGANIZER"],
  visitorProfile: {
    id: "profile-1",
    userId: "user-1",
    name: "Visitor Example",
    createdAt: "2026-05-18T00:00:00.000Z",
    updatedAt: "2026-05-18T00:00:00.000Z",
  },
  notificationSettings: {
    emailAlerts: true,
    pushAlerts: false,
    reminderAlerts: true,
    queueAlerts: true,
    marketingOptIn: false,
  },
};

describe("useSessionStore", () => {
  const secureStore = jest.mocked(SecureStore);
  const mockedAuthApi = jest.mocked(authApi);
  const initialState = useSessionStore.getInitialState();

  beforeEach(() => {
    useSessionStore.setState(initialState, true);
    jest.clearAllMocks();
  });

  it("persists the session envelope", async () => {
    await useSessionStore.getState().setSessionEnvelope(sessionEnvelope);

    expect(secureStore.setItemAsync).toHaveBeenCalledWith("auth_token", "token-123");
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      "auth_session_snapshot",
      expect.stringContaining("Visitor Example")
    );
    expect(useSessionStore.getState().activeRole).toBe("VISITOR");
    expect(useSessionStore.getState().user?.email).toBe("visitor@example.com");
  });

  it("hydrates the saved snapshot", async () => {
    secureStore.getItemAsync
      .mockResolvedValueOnce("token-123")
      .mockResolvedValueOnce(
        JSON.stringify({
          user: sessionEnvelope.user,
          activeRole: sessionEnvelope.activeRole,
          availableRoles: sessionEnvelope.availableRoles,
          visitorProfile: sessionEnvelope.visitorProfile,
          organizerProfile: sessionEnvelope.organizerProfile,
          notificationSettings: sessionEnvelope.notificationSettings,
        })
      );

    await useSessionStore.getState().hydrate();

    expect(useSessionStore.getState().hasHydrated).toBe(true);
    expect(useSessionStore.getState().token).toBe("token-123");
    expect(useSessionStore.getState().visitorProfile?.name).toBe("Visitor Example");
  });

  it("switches active role through the auth API", async () => {
    useSessionStore.setState(
      {
        ...useSessionStore.getState(),
        token: "token-123",
      },
      true
    );

    mockedAuthApi.selectActiveRole.mockResolvedValue({
      ...sessionEnvelope,
      token: "token-456",
      activeRole: "ORGANIZER",
      organizerProfile: {
        id: "profile-2",
        userId: "user-1",
        name: "Visitor Example",
        organizationName: "Visitor Example Studio",
        createdAt: "2026-05-18T00:00:00.000Z",
        updatedAt: "2026-05-18T00:00:00.000Z",
      },
    });

    await useSessionStore.getState().switchRole("ORGANIZER");

    expect(mockedAuthApi.selectActiveRole).toHaveBeenCalledWith("ORGANIZER");
    expect(useSessionStore.getState().activeRole).toBe("ORGANIZER");
    expect(useSessionStore.getState().organizerProfile?.organizationName).toBe("Visitor Example Studio");
  });
});
