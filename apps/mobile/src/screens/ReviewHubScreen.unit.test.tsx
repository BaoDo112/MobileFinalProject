import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { useReviewHub } from "../query/useReviewHub";
import type { ReviewHubDto } from "../types/api";
import { ReviewHubScreen } from "./ReviewHubScreen";

jest.mock("../query/useReviewHub", () => ({
  useReviewHub: jest.fn(),
}));

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

describe("ReviewHubScreen", () => {
  const mockedUseReviewHub = useReviewHub as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders live review data and saves the current composer state", async () => {
    const mutate = jest.fn();

    mockedUseReviewHub.mockReturnValue({
      reviewQuery: {
        data: reviewHub,
        error: null,
        isError: false,
        isLoading: false,
        refetch: jest.fn(),
      },
      saveReviewMutation: {
        error: null,
        isError: false,
        isPending: false,
        mutate,
      },
    });

    render(<ReviewHubScreen exhibitionId="g-01" />);

    expect(screen.getByText("Your review")).toBeOnTheScreen();
    expect(screen.getByText("Bao Nguyen")).toBeOnTheScreen();
    expect(screen.getByText("Save review")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Save review"));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        rating: 4,
        content: "The quiet entry briefing kept the room calm while the projection wall shifted around the audience.",
      });
    });
  });
});