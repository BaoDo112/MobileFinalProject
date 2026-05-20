import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import type {
  AuthAccount,
  AuthProvider,
  AuthSessionEnvelope,
  NotificationPreference,
  NotificationSettingsDto,
  OrganizerProfile,
  User,
  UserRole,
  VisitorProfile,
} from "../common/contracts";

const AVAILABLE_ROLES: UserRole[] = ["VISITOR", "ORGANIZER"];
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDto = {
  emailAlerts: true,
  pushAlerts: false,
  reminderAlerts: true,
  queueAlerts: true,
  marketingOptIn: false,
};

type StoredAccount = AuthAccount & {
  passwordHash?: string;
};

type SessionRecord = {
  token: string;
  userId: string;
  activeRole: UserRole;
  createdAt: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  role: UserRole;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
  role?: UserRole;
};

export type GoogleContinuationInput = {
  email: string;
  name: string;
  role: UserRole;
  providerId?: string;
};

@Injectable()
export class AuthService {
  private readonly usersById = new Map<string, User>();
  private readonly userIdsByEmail = new Map<string, string>();
  private readonly accountsByKey = new Map<string, StoredAccount>();
  private readonly visitorProfilesByUserId = new Map<string, VisitorProfile>();
  private readonly organizerProfilesByUserId = new Map<string, OrganizerProfile>();
  private readonly preferencesByUserId = new Map<string, NotificationPreference>();
  private readonly sessionsByToken = new Map<string, SessionRecord>();

  constructor(private readonly jwtService: JwtService) {
    this.seedDemoAccountsFromEnv();
  }

  async registerLocal(input: RegisterInput): Promise<AuthSessionEnvelope> {
    const email = this.normalizeEmail(input.email);
    const localKey = this.accountKey("LOCAL", email);
    if (this.accountsByKey.has(localKey)) {
      throw new BadRequestException("A local account already exists for this email.");
    }

    const user = this.getUserByEmail(email) ?? this.createUser(email, input.role);
    this.accountsByKey.set(localKey, {
      id: randomUUID(),
      userId: user.id,
      provider: "LOCAL",
      providerId: email,
      passwordHash: await bcrypt.hash(input.password, 10),
      createdAt: this.now(),
      updatedAt: this.now(),
    });

    this.ensureProfileForRole(user.id, input.role, input.name);
    this.ensurePreferences(user.id);
    return this.issueSession(user.id, input.role);
  }

  async loginLocal(input: LoginInput): Promise<AuthSessionEnvelope> {
    const email = this.normalizeEmail(input.email);
    const storedAccount = this.accountsByKey.get(this.accountKey("LOCAL", email));
    if (!storedAccount?.passwordHash) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(input.password, storedAccount.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const user = this.requireUser(storedAccount.userId);
    const activeRole = input.role ?? user.preferredRole ?? user.role;
    this.ensureProfileForRole(user.id, activeRole, this.getDisplayName(user.id));
    return this.issueSession(user.id, activeRole);
  }

  async continueWithGoogle(input: GoogleContinuationInput): Promise<AuthSessionEnvelope> {
    const email = this.normalizeEmail(input.email);
    const providerId = input.providerId?.trim() || email;
    const user = this.getUserByEmail(email) ?? this.createUser(email, input.role);
    const googleKey = this.accountKey("GOOGLE", providerId);

    if (!this.accountsByKey.has(googleKey)) {
      this.accountsByKey.set(googleKey, {
        id: randomUUID(),
        userId: user.id,
        provider: "GOOGLE",
        providerId,
        createdAt: this.now(),
        updatedAt: this.now(),
      });
    }

    this.ensureProfileForRole(user.id, input.role, input.name);
    this.ensurePreferences(user.id);
    return this.issueSession(user.id, input.role);
  }

  async getSessionEnvelope(token: string): Promise<AuthSessionEnvelope> {
    const session = await this.requireSession(token);
    return this.buildSessionEnvelope(session.userId, session.activeRole, session.token);
  }

  async selectActiveRole(token: string, role: UserRole): Promise<AuthSessionEnvelope> {
    const session = await this.requireSession(token);
    this.ensureProfileForRole(session.userId, role, this.getDisplayName(session.userId));
    this.sessionsByToken.delete(token);
    return this.issueSession(session.userId, role);
  }

  async getRoleState(token: string): Promise<Readonly<{ activeRole: UserRole; availableRoles: UserRole[] }>> {
    const session = await this.requireSession(token);
    return {
      activeRole: session.activeRole,
      availableRoles: [...AVAILABLE_ROLES],
    };
  }

  async getNotificationSettings(token: string): Promise<NotificationSettingsDto> {
    const session = await this.requireSession(token);
    return this.toNotificationSettings(this.ensurePreferences(session.userId));
  }

  async updateNotificationSettings(
    token: string,
    updates: Partial<NotificationSettingsDto>
  ): Promise<NotificationSettingsDto> {
    const session = await this.requireSession(token);
    const current = this.ensurePreferences(session.userId);
    const next: NotificationPreference = {
      ...current,
      ...updates,
      updatedAt: this.now(),
    };

    this.preferencesByUserId.set(session.userId, next);
    return this.toNotificationSettings(next);
  }

  private seedDemoAccountsFromEnv() {
    const visitorPassword = process.env.ARTHERA_DEMO_VISITOR_PASSWORD?.trim();
    if (visitorPassword) {
      this.seedDemoAccount({
        email: "visitor@arthera.local",
        password: visitorPassword,
        role: "VISITOR",
        name: "Arthera Visitor"
      });
    }

    const organizerPassword = process.env.ARTHERA_DEMO_ORGANIZER_PASSWORD?.trim();
    if (organizerPassword) {
      this.seedDemoAccount({
        email: "organizer@arthera.local",
        password: organizerPassword,
        role: "ORGANIZER",
        name: "Arthera Organizer"
      });
    }
  }

  private seedDemoAccount(input: RegisterInput) {
    const email = this.normalizeEmail(input.email);
    const user = this.createUser(email, input.role);
    this.accountsByKey.set(this.accountKey("LOCAL", email), {
      id: randomUUID(),
      userId: user.id,
      provider: "LOCAL",
      providerId: email,
      passwordHash: bcrypt.hashSync(input.password, 10),
      createdAt: this.now(),
      updatedAt: this.now(),
    });
    this.ensureProfileForRole(user.id, input.role, input.name);
    this.ensurePreferences(user.id);
  }

  private createUser(email: string, role: UserRole): User {
    const now = this.now();
    const user: User = {
      id: randomUUID(),
      email,
      role,
      preferredRole: role,
      createdAt: now,
      updatedAt: now,
    };

    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(email, user.id);
    return user;
  }

  private getUserByEmail(email: string): User | undefined {
    const userId = this.userIdsByEmail.get(email);
    return userId ? this.usersById.get(userId) : undefined;
  }

  private requireUser(userId: string): User {
    const user = this.usersById.get(userId);
    if (!user) {
      throw new UnauthorizedException("Unknown user session.");
    }
    return user;
  }

  private ensureProfileForRole(userId: string, role: UserRole, displayName: string) {
    if (role === "VISITOR") {
      if (!this.visitorProfilesByUserId.has(userId)) {
        this.visitorProfilesByUserId.set(userId, {
          id: randomUUID(),
          userId,
          name: displayName,
          fullName: displayName,
          tagline: "Collect exhibitions, visits, reviews, and stamps in one place.",
          city: "Ho Chi Minh City",
          membershipLabel: "Member",
          accessibilityNotes: "",
          createdAt: this.now(),
          updatedAt: this.now(),
        });
      }
    } else if (!this.organizerProfilesByUserId.has(userId)) {
      this.organizerProfilesByUserId.set(userId, {
        id: randomUUID(),
        userId,
        name: displayName,
        organizationName: `${displayName} Studio`,
        tagline: "Manage programming, approvals, and attendance from a shared mobile workspace.",
        city: "Ho Chi Minh City",
        createdAt: this.now(),
        updatedAt: this.now(),
      });
    }

    const user = this.requireUser(userId);
    const nextUser: User = {
      ...user,
      role,
      preferredRole: role,
      updatedAt: this.now(),
    };
    this.usersById.set(userId, nextUser);
  }

  private ensurePreferences(userId: string): NotificationPreference {
    const existing = this.preferencesByUserId.get(userId);
    if (existing) {
      return existing;
    }

    const now = this.now();
    const preference: NotificationPreference = {
      id: randomUUID(),
      userId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
      createdAt: now,
      updatedAt: now,
    };
    this.preferencesByUserId.set(userId, preference);
    return preference;
  }

  private async issueSession(userId: string, activeRole: UserRole): Promise<AuthSessionEnvelope> {
    const user = this.requireUser(userId);
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      activeRole,
      roles: AVAILABLE_ROLES,
    });

    this.sessionsByToken.set(token, {
      token,
      userId,
      activeRole,
      createdAt: this.now(),
    });

    return this.buildSessionEnvelope(user.id, activeRole, token);
  }

  private async requireSession(token: string): Promise<SessionRecord> {
    try {
      await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Session expired or invalid.");
    }

    const session = this.sessionsByToken.get(token);
    if (!session) {
      throw new UnauthorizedException("Session expired or invalid.");
    }

    return session;
  }

  private buildSessionEnvelope(userId: string, activeRole: UserRole, token: string): AuthSessionEnvelope {
    return {
      token,
      user: this.requireUser(userId),
      activeRole,
      availableRoles: [...AVAILABLE_ROLES],
      visitorProfile: this.visitorProfilesByUserId.get(userId),
      organizerProfile: this.organizerProfilesByUserId.get(userId),
      notificationSettings: this.toNotificationSettings(this.ensurePreferences(userId)),
    };
  }

  private toNotificationSettings(preference: NotificationPreference): NotificationSettingsDto {
    return {
      emailAlerts: preference.emailAlerts,
      pushAlerts: preference.pushAlerts,
      reminderAlerts: preference.reminderAlerts,
      queueAlerts: preference.queueAlerts,
      marketingOptIn: preference.marketingOptIn,
    };
  }

  private getDisplayName(userId: string): string {
    return (
      this.visitorProfilesByUserId.get(userId)?.name ??
      this.organizerProfilesByUserId.get(userId)?.name ??
      this.requireUser(userId).email.split("@")[0]
    );
  }

  private accountKey(provider: AuthProvider, providerId: string): string {
    return `${provider}:${providerId.toLowerCase()}`;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private now(): string {
    return new Date().toISOString();
  }
}
