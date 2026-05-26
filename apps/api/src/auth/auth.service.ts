import { BadRequestException, Injectable, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import type {
  AuthProvider,
  AuthSessionEnvelope,
  NotificationPreference,
  NotificationSettingsDto,
  User,
  UserRole,
} from "../common/contracts";
import { AssetsService } from "../assets/assets.service";
import { AppStateService } from "../persistence/app-state.service";
import type { StoredAccount } from "../persistence/app-state.types";

const AVAILABLE_ROLES: UserRole[] = ["VISITOR", "ORGANIZER"];
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDto = {
  emailAlerts: true,
  pushAlerts: false,
  reminderAlerts: true,
  queueAlerts: true,
  marketingOptIn: false,
};

type SessionRecord = {
  token: string;
  userId: string;
  activeRole: UserRole;
};

type SessionTokenPayload = Readonly<{
  sub?: string;
  activeRole?: UserRole;
}>;

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
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appState: AppStateService,
    private readonly assetsService: AssetsService,
  ) {}

  async onModuleInit() {
    await this.seedDemoAccountsFromEnv();
  }

  async registerLocal(input: RegisterInput): Promise<AuthSessionEnvelope> {
    const email = this.normalizeEmail(input.email);
    if (this.getAccount("LOCAL", email)) {
      throw new BadRequestException("A local account already exists for this email.");
    }

    const user = this.getUserByEmail(email) ?? this.createUser(email, input.role);
    this.accounts.push({
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
    await this.appState.persist();
    return this.issueSession(user.id, input.role);
  }

  async loginLocal(input: LoginInput): Promise<AuthSessionEnvelope> {
    const email = this.normalizeEmail(input.email);
    const storedAccount = this.getAccount("LOCAL", email);
    if (!storedAccount?.passwordHash) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(input.password, storedAccount.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const user = this.requireUser(storedAccount.userId);
    const activeRole = input.role ?? user.preferredRole ?? user.role;
    const didChange = this.ensureProfileForRole(user.id, activeRole, this.getDisplayName(user.id));
    if (didChange) {
      await this.appState.persist();
    }

    return this.issueSession(user.id, activeRole);
  }

  async continueWithGoogle(input: GoogleContinuationInput): Promise<AuthSessionEnvelope> {
    const email = this.normalizeEmail(input.email);
    const providerId = input.providerId?.trim() || email;
    const user = this.getUserByEmail(email) ?? this.createUser(email, input.role);

    if (!this.getAccount("GOOGLE", providerId)) {
      this.accounts.push({
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
    await this.appState.persist();
    return this.issueSession(user.id, input.role);
  }

  async getSessionEnvelope(token: string): Promise<AuthSessionEnvelope> {
    const session = await this.requireSession(token);
    return this.buildSessionEnvelope(session.userId, session.activeRole, token);
  }

  async selectActiveRole(token: string, role: UserRole): Promise<AuthSessionEnvelope> {
    const session = await this.requireSession(token);
    this.ensureProfileForRole(session.userId, role, this.getDisplayName(session.userId));
    await this.appState.persist();
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

    const currentIndex = this.preferences.findIndex((preference) => preference.userId === session.userId);
    if (currentIndex >= 0) {
      this.preferences.splice(currentIndex, 1, next);
    } else {
      this.preferences.push(next);
    }

    await this.appState.persist();
    return this.toNotificationSettings(next);
  }

  async updateProfileAvatar(token: string, avatarUrl: string): Promise<AuthSessionEnvelope> {
    const session = await this.requireSession(token);
    const nextAvatarUrl = avatarUrl.trim();
    if (!nextAvatarUrl) {
      throw new BadRequestException("Avatar URL is required.");
    }

    this.ensureProfileForRole(session.userId, session.activeRole, this.getDisplayName(session.userId));
    let previousAvatarUrl: string | undefined;
    if (session.activeRole === "VISITOR") {
      const profile = this.visitorProfiles.find((candidate) => candidate.userId === session.userId);
      if (!profile) {
        throw new UnauthorizedException("Visitor profile is unavailable.");
      }

      previousAvatarUrl = profile.avatarUrl;
      profile.avatarUrl = nextAvatarUrl;
      profile.updatedAt = this.now();
    } else {
      const profile = this.organizerProfiles.find((candidate) => candidate.userId === session.userId);
      if (!profile) {
        throw new UnauthorizedException("Organizer profile is unavailable.");
      }

      previousAvatarUrl = profile.avatarUrl;
      profile.avatarUrl = nextAvatarUrl;
      profile.updatedAt = this.now();
    }

    await this.appState.persist();
    if (previousAvatarUrl && previousAvatarUrl !== nextAvatarUrl && !this.isAvatarStillReferenced(previousAvatarUrl)) {
      await this.assetsService.deleteManagedAsset(previousAvatarUrl);
    }
    return this.buildSessionEnvelope(session.userId, session.activeRole, token);
  }

  private get users() {
    return this.appState.getState().auth.users;
  }

  private get accounts() {
    return this.appState.getState().auth.accounts;
  }

  private get visitorProfiles() {
    return this.appState.getState().auth.visitorProfiles;
  }

  private get organizerProfiles() {
    return this.appState.getState().auth.organizerProfiles;
  }

  private get preferences() {
    return this.appState.getState().auth.preferences;
  }

  private async seedDemoAccountsFromEnv() {
    let didChange = false;

    const visitorPassword = process.env.ARTHERA_DEMO_VISITOR_PASSWORD?.trim();
    if (visitorPassword) {
      didChange = this.seedDemoAccount({
        email: "visitor@arthera.local",
        password: visitorPassword,
        role: "VISITOR",
        name: "Arthera Visitor",
      }) || didChange;
    }

    const organizerPassword = process.env.ARTHERA_DEMO_ORGANIZER_PASSWORD?.trim();
    if (organizerPassword) {
      didChange = this.seedDemoAccount({
        email: "organizer@arthera.local",
        password: organizerPassword,
        role: "ORGANIZER",
        name: "Arthera Organizer",
      }) || didChange;
    }

    if (didChange) {
      await this.appState.persist();
    }
  }

  private seedDemoAccount(input: RegisterInput) {
    const email = this.normalizeEmail(input.email);
    if (this.getAccount("LOCAL", email)) {
      return false;
    }

    const user = this.getUserByEmail(email) ?? this.createUser(email, input.role);
    this.accounts.push({
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
    return true;
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

    this.users.push(user);
    return user;
  }

  private getUserByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  private requireUser(userId: string): User {
    const user = this.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new UnauthorizedException("Unknown user session.");
    }

    return user;
  }

  private ensureProfileForRole(userId: string, role: UserRole, displayName: string) {
    let didChange = false;

    if (role === "VISITOR") {
      if (!this.visitorProfiles.some((profile) => profile.userId === userId)) {
        this.visitorProfiles.push({
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
        didChange = true;
      }
    } else if (!this.organizerProfiles.some((profile) => profile.userId === userId)) {
      this.organizerProfiles.push({
        id: randomUUID(),
        userId,
        name: displayName,
        organizationName: `${displayName} Studio`,
        tagline: "Manage programming, approvals, and attendance from a shared mobile workspace.",
        city: "Ho Chi Minh City",
        createdAt: this.now(),
        updatedAt: this.now(),
      });
      didChange = true;
    }

    const user = this.requireUser(userId);
    if (user.role !== role || user.preferredRole !== role) {
      user.role = role;
      user.preferredRole = role;
      user.updatedAt = this.now();
      didChange = true;
    }

    return didChange;
  }

  private ensurePreferences(userId: string): NotificationPreference {
    const existing = this.preferences.find((preference) => preference.userId === userId);
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
    this.preferences.push(preference);
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

    return this.buildSessionEnvelope(user.id, activeRole, token);
  }

  private async requireSession(token: string): Promise<SessionRecord> {
    let payload: SessionTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<SessionTokenPayload>(token);
    } catch {
      throw new UnauthorizedException("Session expired or invalid.");
    }

    const userId = typeof payload?.sub === "string" ? payload.sub : undefined;
    if (!userId) {
      throw new UnauthorizedException("Session expired or invalid.");
    }

    const user = this.requireUser(userId);
    const activeRole = payload.activeRole === "VISITOR" || payload.activeRole === "ORGANIZER"
      ? payload.activeRole
      : user.preferredRole ?? user.role;

    return {
      token,
      userId,
      activeRole,
    };
  }

  private buildSessionEnvelope(userId: string, activeRole: UserRole, token: string): AuthSessionEnvelope {
    return {
      token,
      user: this.requireUser(userId),
      activeRole,
      availableRoles: [...AVAILABLE_ROLES],
      visitorProfile: this.visitorProfiles.find((profile) => profile.userId === userId),
      organizerProfile: this.organizerProfiles.find((profile) => profile.userId === userId),
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
      this.visitorProfiles.find((profile) => profile.userId === userId)?.name ??
      this.organizerProfiles.find((profile) => profile.userId === userId)?.name ??
      this.requireUser(userId).email.split("@")[0]
    );
  }

  private isAvatarStillReferenced(assetUrl: string) {
    return this.visitorProfiles.some((profile) => profile.avatarUrl === assetUrl) || this.organizerProfiles.some((profile) => profile.avatarUrl === assetUrl);
  }

  private getAccount(provider: AuthProvider, providerId: string): StoredAccount | undefined {
    const normalizedProviderId = providerId.toLowerCase();
    return this.accounts.find((account) => account.provider === provider && account.providerId.toLowerCase() === normalizedProviderId);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private now(): string {
    return new Date().toISOString();
  }
}