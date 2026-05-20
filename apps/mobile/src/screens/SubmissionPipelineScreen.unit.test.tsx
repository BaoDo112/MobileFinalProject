import { fireEvent, render, screen } from "@testing-library/react-native";

import { useSubmissionPipeline } from "../query/useSubmissionPipeline";
import type { SubmissionPipelineDto } from "../types/api";
import { SubmissionPipelineScreen } from "./SubmissionPipelineScreen";

jest.mock("../query/useSubmissionPipeline", () => ({
  useSubmissionPipeline: jest.fn(),
}));

const pipelineData: SubmissionPipelineDto = {
  statusCounts: {
    pending: 1,
    confirmed: 2,
    waitlisted: 1,
    rejected: 0,
    checkedIn: 1,
  },
  urgentQueueCount: 2,
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
          reservedCount: 2,
          pendingCount: 1,
          confirmedCount: 2,
          waitlistedCount: 0,
          checkedInCount: 0,
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

describe("SubmissionPipelineScreen", () => {
  const mockedUseSubmissionPipeline = useSubmissionPipeline as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders queue data and opens the review board", () => {
    const onOpenSubmissions = jest.fn();

    mockedUseSubmissionPipeline.mockReturnValue({
      data: pipelineData,
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<SubmissionPipelineScreen onOpenSubmissions={onOpenSubmissions} />);

    expect(screen.getByText("Lightwave: Kinetic Gallery")).toBeOnTheScreen();
    expect(screen.getByText("Queue preview")).toBeOnTheScreen();
    expect(screen.getByText("Linh Dao")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Open review board"));

    expect(onOpenSubmissions).toHaveBeenCalledWith("g-01");
  });
});