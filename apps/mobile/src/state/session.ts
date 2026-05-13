import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserRole, User } from '../types/models';

interface SessionState {
  token: string | null;
  user: User | null;
  activeRole: UserRole | null;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: User, overrideRole?: UserRole) => Promise<void>;
  clearSession: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  user: null,
  activeRole: null,
  hasHydrated: false,

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userStr = await SecureStore.getItemAsync('auth_user');
      const roleStr = await SecureStore.getItemAsync('active_role');
      if (token && userStr) {
        set({ 
          token, 
          user: JSON.parse(userStr), 
          activeRole: (roleStr as UserRole) || null, 
          hasHydrated: true 
        });
        return;
      }
    } catch (e) {
      // Hydration failed
    }
    set({ hasHydrated: true });
  },

  setSession: async (token, user, overrideRole) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    const role = overrideRole || user.role;
    await SecureStore.setItemAsync('active_role', role);
    set({ token, user, activeRole: role });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    await SecureStore.deleteItemAsync('active_role');
    set({ token: null, user: null, activeRole: null });
  },

  switchRole: async (role) => {
    await SecureStore.setItemAsync('active_role', role);
    set({ activeRole: role });
  }
}));
