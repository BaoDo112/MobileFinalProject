import type {
  AuthAccount,
  CommentPayload,
  NotificationPreference,
  OrganizerProfile,
  RegistrationAnswerInput,
  RegistrationFieldDto,
  RegistrationStatus,
  ReviewStatus,
  StampSource,
  StampVaultSection,
  Venue,
  User,
  VisitorProfile,
} from "../common/contracts";
import type { ExhibitionRecord, ExhibitionReviewRecord, ExhibitionSessionRecord } from "../exhibitions/exhibitions.mapper";

export type StoredAccount = AuthAccount & {
  passwordHash?: string;
};

export type FormSchemaVersionRecord = Readonly<{
  exhibitionId: string;
  formSchemaVersionId: string;
  version: number;
  isActive: boolean;
  consentTitle?: string;
  consentCopy?: string;
  fields: RegistrationFieldDto[];
  createdAt: string;
  updatedAt: string;
}>;

export type RegistrationRecord = Readonly<{
  id: string;
  attendeeName: string;
  userId: string;
  exhibitionId: string;
  exhibitionTitle: string;
  sessionId: string;
  sessionLabel: string;
  status: RegistrationStatus;
  note?: string;
  answers: RegistrationAnswerInput[];
  submittedAt: string;
  checkedInAt?: string;
}>;

export type ReviewRecord = Readonly<{
  id: string;
  exhibitionId: string;
  visitorId: string;
  authorName: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt?: string;
}>;

export type StampRecord = Readonly<{
  id: string;
  exhibitionId: string;
  visitorId: string;
  registrationId?: string;
  source: StampSource;
  vaultSection: StampVaultSection;
  title: string;
  milestone: string;
  note?: string;
  accent?: string;
  unlockedAt: string;
  dedupeKey: string;
}>;

export type CommentRecord = Readonly<CommentPayload & {
  id: string;
  createdAt: string;
}>;

export type PersistedAppState = {
  version: string;
  updatedAt: string;
  auth: {
    users: User[];
    accounts: StoredAccount[];
    visitorProfiles: VisitorProfile[];
    organizerProfiles: OrganizerProfile[];
    preferences: NotificationPreference[];
  };
  exhibitions: {
    records: ExhibitionRecord[];
    venues: Venue[];
    sessions: ExhibitionSessionRecord[];
    reviewRecords: ExhibitionReviewRecord[];
  };
  formSchemas: {
    versionsByExhibitionId: Record<string, FormSchemaVersionRecord[]>;
  };
  registrations: {
    records: RegistrationRecord[];
  };
  reviews: {
    records: ReviewRecord[];
  };
  stamps: {
    records: StampRecord[];
  };
  comments: {
    records: CommentRecord[];
  };
};