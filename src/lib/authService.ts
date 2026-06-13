import axios from 'axios';
import type { AuthUser } from '@/store/useAuthStore';
import api from '@/lib/api';

const BASE = import.meta.env.VITE_API_BASE_URL;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface RefreshResponse {
  accessToken: string;
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    passwordRepeat: string;
    username: string;
  }) {
    return axios.post(`${BASE}/user/`, data);
  },

  async login(email: string, password: string) {
    const res = await axios.post<{ success: boolean; data: LoginResponse }>(
      `${BASE}/auth/login`,
      { email, password }
    );
    return res.data.data;
  },

  async logout(refreshToken: string) {
    return axios.post(`${BASE}/auth/logout`, { refreshToken });
  },

  async refresh(refreshToken: string): Promise<string> {
    const res = await axios.post<{ success: boolean; data: RefreshResponse }>(
      `${BASE}/auth/refresh`,
      { refreshToken }
    );
    return res.data.data.accessToken;
  },

  async requestEmailVerification(username: string) {
    return api.post(`/user/${username}/verify-email`, {});
  },

  async changeEmail(username: string, newEmail: string) {
    return api.post(`/user/${username}/change-email`, { newEmail });
  },

  async changeUsername(username: string, email: string, newUsername: string) {
    return api.patch(`/user/${username}/change-username`, { email, username: newUsername });
  },

  async updateProfile(username: string, data: { biography?: string }) {
    return api.patch(`/user/${username}`, data);
  },

  async loginWithGoogle(tokenId: string) {
    const res = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      `${BASE}/oauth/google`,
      { tokenId }
    );
    return res.data.data;
  },

  async loginWithDiscord(code: string) {
    const res = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      `${BASE}/oauth/discord`,
      { code }
    );
    return res.data.data;
  },

  /**
   * Datos frescos del usuario autenticado desde GET /auth/me. Si se pasa
   * accessToken se usa explicitamente (util en login, cuando el token aun
   * no esta en el store); si no, el interceptor adjunta el del store.
   */
  async getMe(accessToken?: string): Promise<AuthUser> {
    const res = await api.get<{ success: boolean; data: AuthUser }>(
      '/auth/me',
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined
    );
    const d = res.data.data;
    return {
      userId: d.userId,
      email: d.email,
      username: d.username,
      emailVerified: d.emailVerified,
      profileImage: d.profileImage,
      role: d.role,
      streak: d.streak,
      createdAt: d.createdAt,
    };
  },

  async getUserProfile(username: string): Promise<UserProfileData> {
    const res = await api.get<{ success: boolean; data: UserProfileData }>(
      `/user/${username}?fields=biography,socialAccounts,emailVerified,profileImage`
    );
    return res.data.data;
  },

  async updateSocialAccounts(username: string, accounts: SocialLink[]) {
    return api.patch(`/user/${username}/social-accounts`, { accounts });
  },

  async getPublicProfile(username: string): Promise<PublicProfile> {
    const res = await axios.get<{ success: boolean; data: PublicProfile }>(
      `${BASE}/user/${username}?fields=userId,username,biography,profileImage,bannerImage,backgroundImage,reputation,socialAccounts,streak`
    );
    return res.data.data;
  },

  /**
   * Marca el Animedle de hoy como completado y suma racha. El backend es la
   * fuente de verdad anti-trampas: si ya se ganó hoy devuelve alreadyCompleted.
   */
  async completeDailyChallenge(
    username: string
  ): Promise<{ streak: number; alreadyCompleted: boolean }> {
    const res = await api.post<{
      success: boolean;
      data: { streak: number; alreadyCompleted: boolean };
    }>(`/user/${username}/complete-daily`);
    return res.data.data;
  },

  async uploadProfileImage(username: string, file: File): Promise<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('profileImage', file);
    const res = await api.post<{ success: boolean; data: { imageUrl: string } }>(
      `/user/${username}/upload-profile-image`,
      fd
    );
    return res.data.data;
  },

  async uploadBannerImage(username: string, file: File): Promise<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('bannerImage', file);
    const res = await api.post<{ success: boolean; data: { imageUrl: string } }>(
      `/user/${username}/upload-banner-image`,
      fd
    );
    return res.data.data;
  },

  async uploadBackgroundImage(username: string, file: File): Promise<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('backgroundImage', file);
    const res = await api.post<{ success: boolean; data: { imageUrl: string } }>(
      `/user/${username}/upload-background-image`,
      fd
    );
    return res.data.data;
  },

  async forgotPassword(username: string): Promise<void> {
    // Backend redirects after sending the email — manual prevents fetch from following it.
    await fetch(`${BASE}/user/${username}/forgot-password`, { method: 'POST', redirect: 'manual' });
  },

  /**
   * Flujo "Forgot password?" del login: pide el reset por email. El backend
   * responde 200 con un mensaje neutro exista o no la cuenta (anti-enumeración).
   */
  async requestPasswordReset(email: string): Promise<string> {
    const res = await axios.post<{ success: boolean; message: string }>(
      `${BASE}/auth/forgot-password`,
      { email }
    );
    return res.data.message;
  },
};

export interface SocialLink {
  name: string;
  url: string;
}

export interface UserProfileData {
  biography?: string;
  emailVerified: boolean;
  profileImage?: string;
  socialAccounts?: { name: string; url: string }[];
  userSocialAccount?: { name: string; url: string }[];
}

export interface PublicProfile {
  userId: number;
  username: string;
  biography?: string;
  profileImage?: string;
  bannerImage?: string;
  backgroundImage?: string;
  reputation: number;
  socialAccounts?: { name: string; url: string }[];
  streak?: number;
}

export { decodeAccessToken, decodeJwtUserId } from '@/lib/jwt';
export type { AccessTokenClaims } from '@/lib/jwt';
