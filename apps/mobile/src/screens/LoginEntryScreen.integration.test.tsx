import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { authApi } from "../api/auth";
import type { AuthSessionEnvelope } from "../types/api";
import { LoginEntryScreen } from "./LoginEntryScreen";

const mockSetSessionEnvelope = jest.fn();

jest.mock("../api/auth", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    continueWithGoogle: jest.fn(),
  },
}));

jest.mock("../state/session", () => ({
  useSessionStore: (selector: (state: { setSessionEnvelope: typeof mockSetSessionEnvelope }) => unknown) =>
    selector({ setSessionEnvelope: mockSetSessionEnvelope }),
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

describe("LoginEntryScreen", () => {
  const mockedAuthApi = jest.mocked(authApi);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuthApi.login.mockResolvedValue(sessionEnvelope);
    mockedAuthApi.register.mockResolvedValue(sessionEnvelope);
    mockedAuthApi.continueWithGoogle.mockResolvedValue(sessionEnvelope);
  });

  it("submits the local sign-in flow", async () => {
    render(<LoginEntryScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "visitor@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("At least 8 characters"), "secure-pass-123");
    fireEvent.press(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith({
        email: "visitor@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "VISITOR",
      });
    });
    expect(mockSetSessionEnvelope).toHaveBeenCalledWith(sessionEnvelope);
  });

  it("submits the create-account flow for organizer mode", async () => {
    render(<LoginEntryScreen />);

    fireEvent.press(screen.getByTestId("login-mode-signup"));
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "organizer@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("At least 8 characters"), "secure-pass-123");
    fireEvent.changeText(screen.getByPlaceholderText("How should the workspace identify you?"), "Organizer Example");
    fireEvent.press(screen.getByTestId("login-role-organizer"));
    fireEvent.press(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(mockedAuthApi.register).toHaveBeenCalledWith({
        email: "organizer@example.com",
        password: "secure-pass-123",
        provider: "LOCAL",
        role: "ORGANIZER",
        name: "Organizer Example",
      });
    });
  });

  it("continues with Google using the current form email", async () => {
    render(<LoginEntryScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "google@example.com");
    fireEvent.press(screen.getByTestId("login-google"));

    await waitFor(() => {
      expect(mockedAuthApi.continueWithGoogle).toHaveBeenCalledWith({
        email: "google@example.com",
        name: "google",
        role: "VISITOR",
        providerId: "google@example.com",
      });
    });
  });
});
