import axios from 'axios';
import type { AuthUser } from '@/store/useAuthStore';

const BASE = 'http://localhost:5000';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { userId: number; email: string; username: string };
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

  async requestEmailVerification(username: string, accessToken: string) {
    return axios.post(
      `${BASE}/user/${username}/verify-email`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  async changeEmail(username: string, newEmail: string, accessToken: string) {
    return axios.post(
      `${BASE}/user/${username}/change-email`,
      { newEmail },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  async changeUsername(username: string, email: string, newUsername: string, accessToken: string) {
    return axios.patch(
      `${BASE}/user/${username}/change-username`,
      { email, username: newUsername },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  async updateProfile(username: string, data: { biography?: string }, accessToken: string) {
    return axios.patch(
      `${BASE}/user/${username}`,
      data,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
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

  async getUserByUsername(username: string): Promise<AuthUser> {
    const res = await axios.get<{ success: boolean; data: Record<string, unknown> }>(
      `${BASE}/user/${username}?fields=userId,email,username,emailVerified,profileImage`
    );
    const d = res.data.data as { userId: number; email: string; username: string; emailVerified: boolean; profileImage?: string };
    return {
      userId: d.userId,
      email: d.email,
      username: d.username,
      emailVerified: d.emailVerified,
      profileImage: d.profileImage,
    };
  },

  async getUserById(userId: number): Promise<AuthUser> {
    const res = await axios.get<{ success: boolean; data: Record<string, unknown> }>(
      `${BASE}/user/${userId}?fields=userId,email,username,emailVerified,profileImage`
    );
    const d = res.data.data as { userId: number; email: string; username: string; emailVerified: boolean; profileImage?: string };
    return {
      userId: d.userId,
      email: d.email,
      username: d.username,
      emailVerified: d.emailVerified,
      profileImage: d.profileImage,
    };
  },
};

export function decodeJwtUserId(token: string): number {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return Number(payload.userId ?? payload.sub ?? payload.id);
  } catch {
    throw new Error('Failed to decode access token');
  }
}
