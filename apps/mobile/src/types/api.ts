import type {
  AuthProvider,
  ExhibitionStatus,
  FieldType,
  NotificationPreference,
  OrganizerProfile,
  RegistrationStatus,
  ReviewStatus,
  SessionStatus,
  Stamp,
  User,
  UserRole,
  Venue,
  VisitorProfile,
} from "./models";

export type RegistrationCtaState = "open" | "waitlist" | "closed";

export type AuthResponse = AuthSessionEnvelope;

export interface RegisterDto {
  email: string;
  password?: string;
  provider: AuthProvider;
  role: UserRole;
  name: string;
  providerId?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
  provider: AuthProvider;
  role?: UserRole;
  providerId?: string;
}

export interface GoogleContinuationDto {
  email: string;
  name: string;
  role: UserRole;
  providerId?: string;
}

export interface ProfileSummaryDto {
  id: string;
  role: UserRole;
  displayName: string;
  tagline?: string;
  city?: string;
  membershipLabel?: string;
}

export interface NotificationSettingsDto extends Pick<NotificationPreference, "emailAlerts" | "pushAlerts" | "reminderAlerts" | "queueAlerts" | "marketingOptIn"> {}

export type UpdateNotificationSettingsDto = Partial<NotificationSettingsDto>;

export interface AuthSessionEnvelope {
  token: string;
  user: User;
  activeRole: UserRole;
  availableRoles: UserRole[];
  visitorProfile?: VisitorProfile;
  organizerProfile?: OrganizerProfile;
  notificationSettings?: NotificationSettingsDto;
}

export interface SessionAvailabilityDto {
  sessionId: string;
  dateLabel: string;
  timeLabel: string;
  capacity: number;
  remainingCapacity: number;
  waitlistCapacity?: number;
  registrationState: RegistrationCtaState;
  status: SessionStatus;
  vibe?: string;
}

export interface ExhibitionSummaryDto {
  id: string;
  title: string;
  exhibitionType: string;
  status: ExhibitionStatus;
  organizerName: string;
  district: string;
  venueTitle?: string;
  dateLabel: string;
  timeLabel: string;
  capacityBadge: string;
  registrationState: RegistrationCtaState;
  accent?: string;
}

export interface ReviewItemDto {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ExhibitionDetailDto {
  exhibition: ExhibitionSummaryDto;
  venue?: Venue;
  sessions: SessionAvailabilityDto[];
  policyText?: string;
  curatorNote?: string;
  highlights: string[];
  reviewPreview: ReviewItemDto[];
}

export interface RegistrationFieldDto {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  isRequired: boolean;
  options: string[];
  helpText?: string;
  order: number;
}

export interface RegistrationAnswerInput {
  formFieldId: string;
  value: string;
}

export interface RegistrationDraftDto {
  exhibitionId: string;
  sessionId: string;
  formSchemaVersionId?: string;
  fields: RegistrationFieldDto[];
  selectedSession: SessionAvailabilityDto;
  consentTitle?: string;
  consentCopy?: string;
}

export interface RegistrationSubmissionDto {
  sessionId: string;
  formSchemaVersionId?: string;
  note?: string;
  answers: RegistrationAnswerInput[];
}

export interface RegistrationReceiptDto {
  registrationId: string;
  status: RegistrationStatus;
  sessionLabel: string;
  waitlistPosition?: number;
  submittedAt: string;
}

export interface VisitorVisitSummaryDto {
  registrationId: string;
  exhibitionId: string;
  exhibitionTitle: string;
  status: RegistrationStatus;
  sessionLabel: string;
  checkedInAt?: string;
}

export interface OrganizerKpiCardDto {
  label: string;
  value: string;
  tone?: "neutral" | "alert" | "success";
}

export interface OrganizerExhibitionCardDto {
  exhibitionId: string;
  title: string;
  venueTitle?: string;
  status: ExhibitionStatus;
  pendingCount: number;
  checkedInCount: number;
  nextAction?: string;
}

export interface OrganizerDashboardDto {
  kpis: OrganizerKpiCardDto[];
  urgentQueueCount: number;
  sessionLoadSummary: string;
  exhibitions: OrganizerExhibitionCardDto[];
}

export interface QueueCountsDto {
  pending: number;
  confirmed: number;
  waitlisted: number;
  rejected: number;
  checkedIn: number;
}

export interface QueueCardDto {
  registrationId: string;
  attendeeName: string;
  sessionLabel: string;
  status: RegistrationStatus;
  submittedAt: string;
  note?: string;
}

export interface SubmissionDecisionDetailDto {
  registrationId: string;
  attendeeName: string;
  status: RegistrationStatus;
  sessionLabel: string;
  note?: string;
  answers: RegistrationAnswerInput[];
}

export interface StampProgressDto {
  totalUnlocked: number;
  confirmedCount: number;
  upcomingCount: number;
  expiredCount: number;
  nextMilestoneLabel?: string;
  stamps: Stamp[];
}
