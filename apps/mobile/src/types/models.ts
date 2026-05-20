export type UserRole = "VISITOR" | "ORGANIZER";
export type AuthProvider = "LOCAL" | "GOOGLE";
export type ExhibitionStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "CLOSED";
export type SessionStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";
export type RegistrationStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "REJECTED" | "CHECKED_IN" | "CANCELLED";
export type ReviewStatus = "PUBLISHED" | "PENDING" | "HIDDEN" | "FLAGGED";
export type StampSource = "ATTENDANCE" | "MILESTONE";
export type StampVaultSection = "CONFIRMED" | "UPCOMING" | "EXPIRED";
export type FieldType = "TEXT" | "EMAIL" | "PHONE" | "TEXTAREA" | "SELECT";
export type GalleryStatus = "present" | "future" | "past";
export type GalleryRegistrationStatus = "open" | "waitlist" | "closed";
export type OrganizerExhibitionStatus = "draft" | "review" | "published" | "closed";
export type RegistrationFieldType = "text" | "email" | "phone" | "textarea" | "select";
export type SubmissionStatus = "pending" | "confirmed" | "waitlisted" | "rejected" | "checked-in";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  preferredRole?: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthAccount {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorProfile {
  id: string;
  userId: string;
  name: string;
  fullName?: string;
  phoneNumber?: string;
  tagline?: string;
  city?: string;
  membershipLabel?: string;
  accessibilityNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  name: string;
  organizationName?: string;
  phoneNumber?: string;
  tagline?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Gallery {
  id: string;
  title: string;
  name?: string;
  type: string;
  district: string;
  dateLabel: string;
  timeLabel: string;
  organizer: string;
  bio: string;
  address: string;
  artists: string[];
  images: string[];
  status: GalleryStatus;
  entryMode: string;
  capacityNote: string;
  curatorNote: string;
  highlights: string[];
  registrationStatus: GalleryRegistrationStatus;
  accent: string;
  logoImage?: string;
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
  role?: UserRole | "visitor" | "organizer";
  tagline?: string;
  city?: string;
  membershipLabel?: string;
  stats: Array<{ label: string; value: string }>;
  highlights: string[];
}

export interface OrganizerExhibition {
  id: string;
  title: string;
  venue: string;
  district: string;
  dateLabel: string;
  summary: string;
  status: OrganizerExhibitionStatus;
  submissions: number;
  checkedIn: number;
  accent: string;
  fieldCount: number;
  nextAction: string;
}

export interface RegistrationField {
  id: string;
  label: string;
  type: RegistrationFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

export interface VisitSlot {
  id: string;
  label: string;
  remaining: string;
  vibe: string;
}

export interface SubmissionAnswer {
  label: string;
  value: string;
}

export interface Submission {
  id: string;
  attendeeName: string;
  timeslot: string;
  status: SubmissionStatus;
  submittedAt: string;
  note: string;
  answers: SubmissionAnswer[];
}

export interface Venue {
  id: string;
  title: string;
  district: string;
  address: string;
  city?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  accessibilityNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exhibition {
  id: string;
  organizerId: string;
  venueId?: string;
  title: string;
  exhibitionType: string;
  bio: string;
  curatorNote?: string;
  policyText?: string;
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
  waitlistCapacity?: number;
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
  consentTitle?: string;
  consentCopy?: string;
  createdAt: string;
  updatedAt?: string;
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
  note?: string;
  decisionNote?: string;
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
  exhibitionId?: string;
  visitorId?: string;
  rating: number;
  content?: string;
  body?: string;
  author?: string;
  roleLabel?: string;
  highlight?: string;
  postedAt?: string;
  status?: ReviewStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceLog {
  id: string;
  registrationId: string;
  note?: string;
  checkedInAt: string;
}

export interface Stamp {
  id: string;
  visitorId?: string;
  exhibitionId: string;
  registrationId?: string;
  source: StampSource;
  vaultSection: StampVaultSection;
  title: string;
  milestone?: string;
  note?: string;
  accent?: string;
  unlockedAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailAlerts: boolean;
  pushAlerts: boolean;
  reminderAlerts: boolean;
  queueAlerts: boolean;
  marketingOptIn: boolean;
  createdAt?: string;
  updatedAt?: string;
}
