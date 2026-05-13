import { 
  UserRole, AuthProvider, ExhibitionStatus, SessionStatus, RegistrationStatus, ReviewStatus, StampSource, FieldType,
  User, AuthAccount, VisitorProfile, OrganizerProfile, Venue, Exhibition, ExhibitionSession, FormSchemaVersion, FormField, Registration, RegistrationAnswer, Review, Stamp
} from './models.ts';

export interface AuthResponse {
  token: string;
  user: User;
}

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
  providerId?: string;
}
