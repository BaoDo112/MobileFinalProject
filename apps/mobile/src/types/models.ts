export type UserRole = "VISITOR" | "ORGANIZER";
export type AuthProvider = "LOCAL" | "GOOGLE";
export type ExhibitionStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "CLOSED";
export type SessionStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";
export type RegistrationStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "REJECTED" | "CHECKED_IN" | "CANCELLED";
export type ReviewStatus = "PUBLISHED" | "HIDDEN" | "FLAGGED";
export type StampSource = "ATTENDANCE" | "MILESTONE";
export type StampVaultSection = "CONFIRMED" | "UPCOMING" | "EXPIRED";
export type FieldType = "TEXT" | "EMAIL" | "PHONE" | "TEXTAREA" | "SELECT";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthAccount {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorProfile {
  id: string;
  userId: string;
  name: string;
  tagline?: string;
  city?: string;
  membershipLabel?: string;
  accessibilityNotes?: string;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  name: string;
  tagline?: string;
  city?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phoneNumber?: string;
  tagline?: string;
  city?: string;
  membershipLabel?: string;
  stats: Array<{ label: string; value: string }>;
  highlights: string[];
}

export interface Venue {
  id: string;
  title: string;
  district: string;
  address: string;
  mapUrl?: string;
}

export interface Exhibition {
  id: string;
  organizerId: string;
  venueId: string;
  title: string;
  exhibitionType: string;
  bio: string;
  mediaUrls: string[];
  status: ExhibitionStatus;
  accent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExhibitionSession {
  id: string;
  exhibitionId: string;
  dateLabel: string;
  timeLabel: string;
  capacity: number;
  vibe?: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FormSchemaVersion {
  id: string;
  exhibitionId: string;
  version: number;
  isActive: boolean;
  createdAt: string;
}

export interface FormField {
  id: string;
  formSchemaVersionId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options: string[];
  helpText?: string;
  order: number;
}

export interface Registration {
  id: string;
  sessionId: string;
  visitorId: string;
  formSchemaVersionId?: string;
  status: RegistrationStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface RegistrationAnswer {
  id: string;
  registrationId: string;
  formFieldId: string;
  value: string;
}

export interface Review {
  id: string;
  exhibitionId: string;
  visitorId: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface Stamp {
  id: string;
  visitorId: string;
  exhibitionId: string;
  source: StampSource;
  vaultSection: StampVaultSection;
  title: string;
  milestone?: string;
  note?: string;
  accent?: string;
  unlockedAt: string;
}
