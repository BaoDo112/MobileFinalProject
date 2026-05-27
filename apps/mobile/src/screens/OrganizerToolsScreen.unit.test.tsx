import { fireEvent, render, screen } from "@testing-library/react-native";

import { useExhibitionEditor } from "../query/useExhibitionEditor";
import type { ExhibitionEditorDto } from "../types/api";
import { OrganizerToolsScreen } from "./OrganizerToolsScreen";

jest.mock("../query/useExhibitionEditor", () => ({
  useExhibitionEditor: jest.fn(),
}));

const draft: ExhibitionEditorDto = {
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
    fieldCount: 2,
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

describe("OrganizerToolsScreen", () => {
  const mockedUseExhibitionEditor = useExhibitionEditor as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the live authoring draft and opens the form builder", async () => {
    const onOpenFormBuilder = jest.fn();
    mockedUseExhibitionEditor.mockReturnValue({
      exhibitionId: "g-04",
      editorQuery: { data: draft, error: null, isLoading: false, refetch: jest.fn() },
      createDraftMutation: { data: undefined, error: null, isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
      createVenueMutation: { isPending: false, mutateAsync: jest.fn() },
      saveDraftMutation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(draft) },
      publishMutation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue({ ...draft, status: "PUBLISHED" }) },
    });

    render(<OrganizerToolsScreen exhibitionId="g-04" onOpenFormBuilder={onOpenFormBuilder} />);

    expect(screen.getByText("Signal Garden Draft")).toBeOnTheScreen();
    expect(screen.getByText("Add venue")).toBeOnTheScreen();
    expect(screen.getByText("Open form builder")).toBeOnTheScreen();
    expect(screen.getByText("Save draft")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Open form builder"));

    expect(onOpenFormBuilder).toHaveBeenCalledWith("g-04");
  });
});