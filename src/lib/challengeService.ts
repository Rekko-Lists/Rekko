import api from '@/lib/api';
import axios from 'axios';
import type {
  DailyChallengesResponse,
  ChallengesListResponse,
  ChallengeResponseDTO,
} from '@/types/challenge';

const BASE = import.meta.env.VITE_API_BASE_URL;

export const challengeService = {
  async getDailyChallenges(): Promise<DailyChallengesResponse> {
    const res = await axios.get<{ success: boolean; data: DailyChallengesResponse }>(
      `${BASE}/challenges/daily`
    );
    return res.data.data;
  },

  async getChallengesByDate(date: string): Promise<{ challenges: ChallengeResponseDTO[]; date: string }> {
    const res = await axios.get<{
      success: boolean;
      data: { challenges: ChallengeResponseDTO[]; date: string };
    }>(`${BASE}/challenges/${date}`);
    return res.data.data;
  },

  async getChallenges(params?: {
    fromDate?: string;
    toDate?: string;
    type?: string;
    malId?: number;
    page?: number;
    limit?: number;
  }): Promise<ChallengesListResponse> {
    const query = new URLSearchParams();
    if (params?.fromDate) query.set('fromDate', params.fromDate);
    if (params?.toDate) query.set('toDate', params.toDate);
    if (params?.type) query.set('type', params.type);
    if (params?.malId != null) query.set('malId', String(params.malId));
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.limit != null) query.set('limit', String(params.limit));
    const res = await axios.get<{ success: boolean; data: ChallengesListResponse }>(
      `${BASE}/challenges?${query}`
    );
    return res.data.data;
  },

  async createChallenges(formData: FormData): Promise<{ challenges: ChallengeResponseDTO[] }> {
    const res = await api.post<{ success: boolean; data: { challenges: ChallengeResponseDTO[] } }>(
      '/challenges',
      formData
    );
    return res.data.data;
  },

  async updateChallenge(
    challengeId: number,
    formData: FormData
  ): Promise<{ challenge: ChallengeResponseDTO }> {
    const res = await api.patch<{ success: boolean; data: { challenge: ChallengeResponseDTO } }>(
      `/challenges/${challengeId}`,
      formData
    );
    return res.data.data;
  },

  async deleteChallengesByDate(date: string): Promise<void> {
    await api.delete(`/challenges/${date}`);
  },
};
