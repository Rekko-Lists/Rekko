import api from '@/lib/api';

export const adminService = {
  async triggerSeed(pages = 10): Promise<{ message: string; data: unknown }> {
    const res = await api.get<{ success: boolean; message: string; data: unknown }>(
      `/anime/seed?pages=${pages}`
    );
    return { message: res.data.message, data: res.data.data };
  },
};
