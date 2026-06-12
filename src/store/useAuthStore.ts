import { create } from 'zustand';
import { storeRefreshToken, clearStoredRefreshToken } from '@/lib/tokenStorage';
import { decodeAccessToken } from '@/lib/jwt';

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  emailVerified: boolean;
  profileImage?: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  streak?: number;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: AuthUser, accessToken: string, refreshToken: string, rememberMe: boolean) => void;
  logout: () => void;
}

// El user vive solo en memoria: la identidad (userId/role/emailVerified)
// deriva del JWT firmado y el perfil se reconstruye via GET /auth/me en cada
// arranque. Nada editable en localStorage decide que UI se muestra.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) =>
    set((state) => {
      if (!accessToken) return { accessToken };
      try {
        // Los claims del token ganan siempre sobre datos fetcheados:
        // un token nuevo trae role/emailVerified frescos.
        const claims = decodeAccessToken(accessToken);
        return {
          accessToken,
          user: state.user ? { ...state.user, ...claims } : state.user,
        };
      } catch {
        return { accessToken };
      }
    }),
  login: (user, accessToken, refreshToken, rememberMe) => {
    storeRefreshToken(refreshToken, rememberMe);
    const claims = decodeAccessToken(accessToken);
    set({ accessToken, user: { ...user, ...claims } });
  },
  logout: () => {
    clearStoredRefreshToken();
    set({ user: null, accessToken: null });
  },
}));

// Purga one-time del estado persistido antiguo (era spoofeable editando
// localStorage). Se puede eliminar pasado un tiempo.
localStorage.removeItem('rekko-auth');
