import axios from 'axios';
import { getStoredRefreshToken, storeRefreshToken, clearStoredRefreshToken } from '@/lib/tokenStorage';
import { useAuthStore } from '@/store/useAuthStore';
import { logger } from '@/lib/logger';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshing) {
        const refreshToken = getStoredRefreshToken();
        if (!refreshToken) throw new Error('no refresh token');

        refreshing = axios
          .post<{ success: boolean; data: { accessToken: string } }>(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refreshToken }
          )
          .then((res) => {
            const newToken = res.data.data.accessToken;
            useAuthStore.getState().setAccessToken(newToken);
            // keep refresh token stored as-is (same storage key)
            const stored = getStoredRefreshToken();
            if (stored) storeRefreshToken(stored, !!localStorage.getItem('rekko-refresh'));
            return newToken;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      const newToken = await refreshing;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      logger.error('Token refresh failed, logging out', refreshErr);
      clearStoredRefreshToken();
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export default api;
