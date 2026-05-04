export type UserRole = "VISITOR" | "ORGANIZER";

export interface AuthResponse {
  token: string;
  role: UserRole;
  email: string;
}

export interface GallerySummary {
  id: string;
  title: string;
  galleryType: string;
  district: string;
  dateLabel: string;
  timeLabel: string;
  organizer: string;
  status: "PAST" | "PRESENT" | "FUTURE";
}

export interface CommentPayload {
  galleryId: string;
  authorId: string;
  rating: number;
  content: string;
}

export interface ExhibitionPayload {
  organizerId: string;
  title: string;
  exhibitionType: string;
  bio: string;
  address: string;
  mediaUrls: string[];
  formSchema?: Record<string, unknown>;
}
