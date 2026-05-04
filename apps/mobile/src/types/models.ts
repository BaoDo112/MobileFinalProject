export type UserRole = "visitor" | "organizer";

export type GalleryStatus = "past" | "present" | "future";
export type RegistrationStatus = "open" | "waitlist" | "closed";
export type FieldType = "text" | "email" | "phone" | "textarea" | "select";
export type ExhibitionStatus = "draft" | "review" | "published" | "closed";
export type SubmissionStatus = "pending" | "confirmed" | "checked-in";

export interface Gallery {
  id: string;
  title: string;
  type: "Art" | "Technology" | "Mixed";
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
  registrationStatus: RegistrationStatus;
  accent: string;
}

export interface Stamp {
  id: string;
  title: string;
  unlocked: boolean;
  milestone: string;
  galleryId: string;
  accent: string;
  note: string;
}

export interface Review {
  id: string;
  author: string;
  roleLabel: string;
  rating: number;
  body: string;
  postedAt: string;
  highlight: string;
}

export interface RegistrationField {
  id: string;
  label: string;
  type: FieldType;
  placeholder: string;
  required: boolean;
  helpText?: string;
  options?: string[];
}

export interface VisitSlot {
  id: string;
  label: string;
  remaining: string;
  vibe: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  tagline: string;
  city: string;
  membershipLabel: string;
  stats: StatItem[];
  highlights: string[];
}

export interface OrganizerExhibition {
  id: string;
  title: string;
  venue: string;
  district: string;
  dateLabel: string;
  summary: string;
  status: ExhibitionStatus;
  submissions: number;
  checkedIn: number;
  accent: string;
  fieldCount: number;
  nextAction: string;
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
