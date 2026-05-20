import type {
  AuthProvider,
  ExhibitionStatus,
  FieldType,
  NotificationPreference,
  OrganizerProfile,
  RegistrationStatus,
  ReviewStatus,
  SessionStatus,
  StampSource,
  StampVaultSection,
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
  bio?: string;
  exhibitionType: string;
  status: ExhibitionStatus;
  timelineStatus: "PRESENT" | "FUTURE" | "PAST";
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

export interface ReviewEligibilityDto {
  isEligible: boolean;
  reason?: string;
  checkedInAt?: string;
  rewardNotice?: string;
}

export interface ReviewComposerDto {
  reviewId?: string;
  rating: number;
  content: string;
  status?: ReviewStatus;
  submittedAt?: string;
}

export interface ReviewHubDto {
  exhibitionId: string;
  exhibitionTitle: string;
  averageRatingLabel: string;
  reviewCount: number;
  eligibility: ReviewEligibilityDto;
  composer: ReviewComposerDto;
  guidelines: string[];
  recentReviews: ReviewItemDto[];
}

export interface SaveReviewDto {
  rating: number;
  content: string;
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

export interface VisitorWorkspaceDto {
  user: User;
  activeRole: UserRole;
  availableRoles: UserRole[];
  visitorProfile?: VisitorProfile;
  notificationSettings: NotificationSettingsDto;
  upcomingVisits: VisitorVisitSummaryDto[];
  pastVisits: VisitorVisitSummaryDto[];
}

export interface SupportLinkDto {
  label: string;
  url: string;
  description?: string;
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

export interface OrganizerNotificationsDto {
  queueCounts: QueueCountsDto;
  reminderWindowLabel: string;
  digestCadenceLabel: string;
  supportLinks: SupportLinkDto[];
}

export interface VenueOptionDto {
  id: string;
  title: string;
  district: string;
  address: string;
  city?: string;
}

export interface AuthoringSessionDto {
  sessionId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reservedCount: number;
  waitlistCapacity?: number;
  registrationState: RegistrationCtaState;
  status: SessionStatus;
  vibe?: string;
}

export interface FormSchemaValidationDto {
  fieldCount: number;
  requiredFieldCount: number;
  isValid: boolean;
  validationIssues: string[];
}

export interface FormSchemaEditorDto {
  exhibitionId: string;
  formSchemaVersionId: string;
  version: number;
  isActive: boolean;
  consentTitle?: string;
  consentCopy?: string;
  fields: RegistrationFieldDto[];
  validation: FormSchemaValidationDto;
  updatedAt: string;
}

export interface ExhibitionPublishChecklistItemDto {
  key: string;
  label: string;
  complete: boolean;
  detail: string;
}

export interface ExhibitionPublishChecklistDto {
  canPublish: boolean;
  blockingReasons: string[];
  items: ExhibitionPublishChecklistItemDto[];
}

export interface ExhibitionEditorDto {
  exhibitionId: string;
  organizerId: string;
  organizerName: string;
  title: string;
  exhibitionType: string;
  bio: string;
  venueId?: string;
  status: ExhibitionStatus;
  mediaUrls: string[];
  curatorNote?: string;
  policyText?: string;
  highlightList: string[];
  sessions: AuthoringSessionDto[];
  formSchema: {
    formSchemaVersionId?: string;
    version?: number;
    consentTitle?: string;
    consentCopy?: string;
    fieldCount: number;
    isValid: boolean;
    validationIssues: string[];
  };
  availableVenues: VenueOptionDto[];
  checklist: ExhibitionPublishChecklistDto;
  isLocked: boolean;
  lockReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSessionInputDto {
  sessionId?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  waitlistCapacity?: number;
  status?: SessionStatus;
  vibe?: string;
}

export interface SaveExhibitionDraftDto {
  title: string;
  exhibitionType: string;
  bio: string;
  venueId?: string;
  mediaUrls: string[];
  curatorNote?: string;
  policyText?: string;
  highlightList: string[];
  sessions: UpsertSessionInputDto[];
}

export interface SaveFormSchemaDto {
  consentTitle?: string;
  consentCopy?: string;
  fields: RegistrationFieldDto[];
}

export interface QueueCardDto {
  registrationId: string;
  attendeeName: string;
  sessionLabel: string;
  status: RegistrationStatus;
  submittedAt: string;
  note?: string;
}

export interface SubmissionAnswerDto {
  label: string;
  value: string;
}

export interface QueueSessionWorkloadDto {
  sessionId: string;
  sessionLabel: string;
  capacity: number;
  reservedCount: number;
  pendingCount: number;
  confirmedCount: number;
  waitlistedCount: number;
  checkedInCount: number;
  waitlistCapacity?: number;
  isOverCapacity: boolean;
}

export interface QueueWaitlistSummaryDto {
  sessionId: string;
  sessionLabel: string;
  waitlistedCount: number;
  waitlistCapacity?: number;
  remainingWaitlistCapacity?: number;
}

export interface ExhibitionQueueBoardDto {
  exhibitionId: string;
  exhibitionTitle: string;
  venueTitle?: string;
  statusCounts: QueueCountsDto;
  sessionWorkload: QueueSessionWorkloadDto[];
  waitlistSummary: QueueWaitlistSummaryDto[];
  queueCards: QueueCardDto[];
}

export interface SubmissionPipelineDto {
  statusCounts: QueueCountsDto;
  urgentQueueCount: number;
  boards: ExhibitionQueueBoardDto[];
}

export type SubmissionDecisionAction = "APPROVE" | "REJECT" | "WAITLIST" | "CHECK_IN";

export interface SubmissionDecisionDetailDto {
  registrationId: string;
  attendeeName: string;
  status: RegistrationStatus;
  sessionLabel: string;
  submittedAt: string;
  note?: string;
  checkedInAt?: string;
  stampNotice?: string;
  availableActions: SubmissionDecisionAction[];
  answers: SubmissionAnswerDto[];
}

export interface SubmissionReviewDto {
  exhibitionId: string;
  exhibitionTitle: string;
  venueTitle?: string;
  statusCounts: QueueCountsDto;
  sessionWorkload: QueueSessionWorkloadDto[];
  queueCards: QueueCardDto[];
  selectedSubmission?: SubmissionDecisionDetailDto;
}

export interface UpdateSubmissionDecisionDto {
  action: SubmissionDecisionAction;
}

export interface StampCardDto {
  id: string;
  exhibitionId?: string;
  source: StampSource;
  vaultSection: StampVaultSection;
  title: string;
  milestone: string;
  note?: string;
  accent?: string;
  unlockedAt?: string;
}

export interface StampMilestoneDto {
  id: string;
  title: string;
  milestone: string;
  note: string;
  accent?: string;
  unlocked: boolean;
  exhibitionId?: string;
}

export interface StampProgressDto {
  totalUnlocked: number;
  confirmedCount: number;
  upcomingCount: number;
  expiredCount: number;
  nextMilestoneLabel?: string;
  confirmedStamps: StampCardDto[];
  upcomingStamps: StampCardDto[];
  expiredStamps: StampCardDto[];
  lockedMilestones: StampMilestoneDto[];
  history: StampCardDto[];
}
