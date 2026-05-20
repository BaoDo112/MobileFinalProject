import { fireEvent, render, screen } from "@testing-library/react-native";
import type {
  QueryObserverLoadingErrorResult,
  QueryObserverLoadingResult,
  QueryObserverResult,
  QueryObserverSuccessResult,
} from "@tanstack/react-query";

import { useOrganizerDashboard } from "../query/useOrganizerDashboard";
import type { OrganizerDashboardDto } from "../types/api";
import { OrganizerDashboardScreen } from "./OrganizerDashboardScreen";

jest.mock("../query/useOrganizerDashboard", () => ({
  useOrganizerDashboard: jest.fn(),
}));

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

describe("OrganizerDashboardScreen", () => {
  const mockedUseOrganizerDashboard = jest.mocked(useOrganizerDashboard);

  function createBaseQueryResult() {
    return {
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: true,
      fetchStatus: "idle" as const,
      promise: Promise.resolve(dashboardData),
      refetch: jest.fn<Promise<QueryObserverResult<OrganizerDashboardDto, Error>>, []>(async () => createSuccessQueryResult()),
    };
  }

  function createLoadingQueryResult(): QueryObserverLoadingResult<OrganizerDashboardDto, Error> {
    return {
      ...createBaseQueryResult(),
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
      isLoading: true,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isInitialLoading: true,
      fetchStatus: "fetching",
      status: "pending",
    };
  }

  function createSuccessQueryResult(): QueryObserverSuccessResult<OrganizerDashboardDto, Error> {
    return {
      ...createBaseQueryResult(),
      data: dashboardData,
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isPlaceholderData: false,
      status: "success",
    };
  }

  function createErrorQueryResult(error: Error, refetch: jest.Mock): QueryObserverLoadingErrorResult<OrganizerDashboardDto, Error> {
    return {
      ...createBaseQueryResult(),
      data: undefined,
      error,
      failureCount: 1,
      failureReason: error,
      errorUpdateCount: 1,
      isError: true,
      isPending: false,
      isLoading: false,
      isLoadingError: true,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: "error",
      refetch,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading state", () => {
    mockedUseOrganizerDashboard.mockReturnValue(createLoadingQueryResult());

    render(
      <OrganizerDashboardScreen
        onCreateExhibition={jest.fn()}
        onEditExhibition={jest.fn()}
        onOpenFormBuilder={jest.fn()}
        onOpenSubmissions={jest.fn()}
      />
    );

    expect(screen.getByText("Loading dashboard")).toBeOnTheScreen();
  });

  it("renders aggregate data and fires organizer actions", () => {
    const onCreateExhibition = jest.fn();
    const onEditExhibition = jest.fn();
    const onOpenFormBuilder = jest.fn();
    const onOpenSubmissions = jest.fn();

    mockedUseOrganizerDashboard.mockReturnValue(createSuccessQueryResult());

    render(
      <OrganizerDashboardScreen
        onCreateExhibition={onCreateExhibition}
        onEditExhibition={onEditExhibition}
        onOpenFormBuilder={onOpenFormBuilder}
        onOpenSubmissions={onOpenSubmissions}
      />
    );

    expect(screen.getByText("Command center")).toBeOnTheScreen();
    expect(screen.getByText("Live exhibitions")).toBeOnTheScreen();
    expect(screen.getByText("Lightwave: Kinetic Gallery")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Create exhibition draft"));
    fireEvent.press(screen.getByText("Edit brief"));
    fireEvent.press(screen.getByText("Field map"));
    fireEvent.press(screen.getByText("Submissions"));

    expect(onCreateExhibition).toHaveBeenCalledTimes(1);
    expect(onEditExhibition).toHaveBeenCalledWith("g-01");
    expect(onOpenFormBuilder).toHaveBeenCalledWith("g-01");
    expect(onOpenSubmissions).toHaveBeenCalledWith("g-01");
  });

  it("renders the error state", () => {
    const refetch = jest.fn();
    mockedUseOrganizerDashboard.mockReturnValue(createErrorQueryResult(new Error("Organizer dashboard could not be loaded."), refetch));

    render(
      <OrganizerDashboardScreen
        onCreateExhibition={jest.fn()}
        onEditExhibition={jest.fn()}
        onOpenFormBuilder={jest.fn()}
        onOpenSubmissions={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText("Try again"));

    expect(screen.getByText("Organizer dashboard could not be loaded.")).toBeOnTheScreen();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});