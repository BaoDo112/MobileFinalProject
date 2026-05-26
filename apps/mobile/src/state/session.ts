import { create } from "zustand";

import { authApi } from "../api/auth";
import { persistentStorage } from "./persistent-storage";
import type { AuthSessionEnvelope, NotificationSettingsDto } from "../types/api";
import type { OrganizerProfile, User, UserRole, VisitorProfile } from "../types/models";

const TOKEN_KEY = "auth_token";
const SESSION_KEY = "auth_session_snapshot";

type SessionSnapshot = {
  user: User;
  activeRole: UserRole;
  availableRoles: UserRole[];
  visitorProfile: VisitorProfile | null;
  organizerProfile: OrganizerProfile | null;
  notificationSettings: NotificationSettingsDto | null;
};

interface SessionState {
  token: string | null;
  user: User | null;
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  visitorProfile: VisitorProfile | null;
  organizerProfile: OrganizerProfile | null;
  notificationSettings: NotificationSettingsDto | null;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  setSessionEnvelope: (session: AuthSessionEnvelope) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearSession: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

function toSnapshot(session: AuthSessionEnvelope): SessionSnapshot {
  return {
    user: session.user,
    activeRole: session.activeRole,
    availableRoles: session.availableRoles,
    visitorProfile: session.visitorProfile ?? null,
    organizerProfile: session.organizerProfile ?? null,
    notificationSettings: session.notificationSettings ?? null,
  };
}

function applySnapshot(snapshot: SessionSnapshot) {
  return {
    user: snapshot.user,
    activeRole: snapshot.activeRole,
    availableRoles: snapshot.availableRoles,
    visitorProfile: snapshot.visitorProfile,
    organizerProfile: snapshot.organizerProfile,
    notificationSettings: snapshot.notificationSettings,
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  user: null,
  activeRole: null,
  availableRoles: [],
  visitorProfile: null,
  organizerProfile: null,
  notificationSettings: null,
  hasHydrated: false,

  hydrate: async () => {
    try {
      const token = await persistentStorage.getItem(TOKEN_KEY);
      const snapshotRaw = await persistentStorage.getItem(SESSION_KEY);

      if (token && snapshotRaw) {
        const snapshot = JSON.parse(snapshotRaw) as SessionSnapshot;
        set({ token, ...applySnapshot(snapshot), hasHydrated: true });
        return;
      }
    } catch (error) {
      console.warn("Session hydration failed", error);
      await persistentStorage.deleteItem(TOKEN_KEY);
      await persistentStorage.deleteItem(SESSION_KEY);
    }

    set({
      token: null,
      user: null,
      activeRole: null,
      availableRoles: [],
      visitorProfile: null,
      organizerProfile: null,
      notificationSettings: null,
      hasHydrated: true,
    });
  },

  setSessionEnvelope: async (session) => {
    const snapshot = toSnapshot(session);
    await persistentStorage.setItem(TOKEN_KEY, session.token);
    await persistentStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    set({ token: session.token, ...applySnapshot(snapshot) });
  },

  refreshSession: async () => {
    const token = get().token;
    if (!token) {
      return;
    }

    const session = await authApi.getSession();
    await get().setSessionEnvelope(session);
  },

  clearSession: async () => {
    await persistentStorage.deleteItem(TOKEN_KEY);
    await persistentStorage.deleteItem(SESSION_KEY);
    set({
      token: null,
      user: null,
      activeRole: null,
      availableRoles: [],
      visitorProfile: null,
      organizerProfile: null,
      notificationSettings: null,
    });
  },

  switchRole: async (role) => {
    const token = get().token;
    if (!token) {
      return;
    }

    const session = await authApi.selectActiveRole(role);
    await get().setSessionEnvelope(session);
  },
}));
