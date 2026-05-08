import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storeRefreshToken, clearStoredRefreshToken } from '@/lib/tokenStorage';

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  emailVerified: boolean;
  profileImage?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: AuthUser, accessToken: string, refreshToken: string, rememberMe: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      login: (user, accessToken, refreshToken, rememberMe) => {
        storeRefreshToken(refreshToken, rememberMe);
        set({ user, accessToken });
      },
      logout: () => {
        clearStoredRefreshToken();
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'rekko-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
