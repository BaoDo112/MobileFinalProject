import { fireEvent, render, screen } from "@testing-library/react-native";

import { useStampVault } from "../query/useStampVault";
import type { StampProgressDto } from "../types/api";
import { StampVaultScreen } from "./StampVaultScreen";

jest.mock("../query/useStampVault", () => ({
  useStampVault: jest.fn(),
}));

const progress: StampProgressDto = {
  totalUnlocked: 2,
  confirmedCount: 2,
  upcomingCount: 1,
  expiredCount: 1,
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
  expiredStamps: [
    {
      id: "expired-1",
      exhibitionId: "g-03",
      source: "ATTENDANCE",
      vaultSection: "EXPIRED",
      title: "Memory of Neon Streets",
      milestone: "Registration expired",
      note: "Apr 10, 2026 · 07:00 PM",
      accent: "#6f4d67",
    },
  ],
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

describe("StampVaultScreen", () => {
  const mockedUseStampVault = useStampVault as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders live stamp progress and opens a gallery from a confirmed stamp card", () => {
    const onOpenGallery = jest.fn();

    mockedUseStampVault.mockReturnValue({
      data: progress,
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(
      <StampVaultScreen
        profile={{
          id: "profile-1",
          userId: "user-1",
          name: "Phase Four Visitor",
          membershipLabel: "Collector tier",
          stats: [],
          highlights: [],
        }}
        onOpenGallery={onOpenGallery}
      />
    );

    expect(screen.getByText("Milestone track")).toBeOnTheScreen();
    expect(screen.getByText("Confirmed stamps")).toBeOnTheScreen();
    expect(screen.getByText("Lightwave Attendance")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Lightwave Attendance"));

    expect(onOpenGallery).toHaveBeenCalledWith("g-01");
  });
});