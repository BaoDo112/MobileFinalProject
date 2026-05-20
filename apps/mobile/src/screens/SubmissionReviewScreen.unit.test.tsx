import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { useSubmissionReview } from "../query/useSubmissionReview";
import type { SubmissionReviewDto } from "../types/api";
import { SubmissionReviewScreen } from "./SubmissionReviewScreen";

jest.mock("../query/useSubmissionReview", () => ({
  useSubmissionReview: jest.fn(),
}));

const reviewData: SubmissionReviewDto = {
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
      reservedCount: 2,
      pendingCount: 1,
      confirmedCount: 2,
      waitlistedCount: 0,
      checkedInCount: 0,
      waitlistCapacity: 12,
      isOverCapacity: false,
    },
  ],
  queueCards: [
    {
      registrationId: "seed-reg-03",
      attendeeName: "Linh Dao",
      sessionLabel: "May 21, 2026 · 06:30 PM - 08:00 PM",
      status: "CONFIRMED",
      submittedAt: "2026-05-20T01:59:29.080Z",
      note: "Needs accessibility support confirmation.",
    },
  ],
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

describe("SubmissionReviewScreen", () => {
  const mockedUseSubmissionReview = useSubmissionReview as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the selected attendee and fires the organizer decision mutation", async () => {
    const mutateAsync = jest.fn().mockResolvedValue(reviewData);

    mockedUseSubmissionReview.mockReturnValue({
      selectedRegistrationId: "seed-reg-03",
      setSelectedRegistrationId: jest.fn(),
      reviewQuery: {
        data: reviewData,
        error: null,
        isError: false,
        isLoading: false,
        refetch: jest.fn(),
      },
      updateDecisionMutation: {
        error: null,
        isError: false,
        isPending: false,
        mutateAsync,
      },
    });

    render(<SubmissionReviewScreen exhibitionId="g-01" />);

    expect(screen.getByText("Selected attendee")).toBeOnTheScreen();
    expect(screen.getByText("Email")).toBeOnTheScreen();
    expect(screen.getByText("Check in attendee")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Check in attendee"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ registrationId: "seed-reg-03", action: "CHECK_IN" });
    });
  });
});