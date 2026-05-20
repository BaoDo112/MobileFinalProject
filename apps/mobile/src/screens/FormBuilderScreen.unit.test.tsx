import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { useExhibitionEditor } from "../query/useExhibitionEditor";
import { useFormBuilder } from "../query/useFormBuilder";
import type { ExhibitionEditorDto, FormSchemaEditorDto } from "../types/api";
import { FormBuilderScreen } from "./FormBuilderScreen";

jest.mock("../query/useExhibitionEditor", () => ({
  useExhibitionEditor: jest.fn(),
}));

jest.mock("../query/useFormBuilder", () => ({
  useFormBuilder: jest.fn(),
}));

const schema: FormSchemaEditorDto = {
  exhibitionId: "g-04",
  formSchemaVersionId: "fs-g-04-v2",
  version: 2,
  isActive: true,
  consentTitle: "Confirm your visit details",
  consentCopy: "Used for scheduling and check-in.",
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
  validation: {
    fieldCount: 1,
    requiredFieldCount: 1,
    isValid: true,
    validationIssues: [],
  },
  updatedAt: "2026-05-20T00:00:00.000Z",
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

describe("FormBuilderScreen", () => {
  const mockedUseExhibitionEditor = useExhibitionEditor as jest.Mock;
  const mockedUseFormBuilder = useFormBuilder as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the saved schema and submits the updated builder payload", async () => {
    const mutateAsync = jest.fn().mockResolvedValue(schema);
    mockedUseExhibitionEditor.mockReturnValue({
      editorQuery: { data: editorDraft, error: null, isLoading: false, refetch: jest.fn() },
    });

    mockedUseFormBuilder.mockReturnValue({
      formSchemaQuery: { data: schema, error: null, isLoading: false, refetch: jest.fn() },
      saveFormSchemaMutation: { isPending: false, mutateAsync },
    });

    render(<FormBuilderScreen exhibitionId="g-04" />);

    expect(screen.getByText("Signal Garden Draft")).toBeOnTheScreen();
    expect(screen.getByText("Full name")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Save schema"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          consentTitle: "Confirm your visit details",
          consentCopy: "Used for scheduling and check-in.",
        })
      );
    });
  });
});