import api from "@/lib/api";
import { cached, TTL } from "@/lib/clientCache";
import type { AnimePagination } from "@/types/anime";

export interface ReputationUser {
  userId: number;
  username: string;
  profileImage?: string | null;
  reputation: number;
}

interface RawUsersEnvelope {
  data?: {
    data?: ReputationUser[];
    pagination?: AnimePagination;
  };
}

// Cacheado 10 min: leaderboard publico, igual para todos. El signal se
// ignora porque la promise se comparte entre montajes.
export async function getTopReputationUsers(
  limit = 4,
  _signal?: AbortSignal,
): Promise<ReputationUser[]> {
  return cached(`topReputation:${limit}`, TTL.TEN_MINUTES, async () => {
    const response = await api.get<RawUsersEnvelope>("/user", {
      params: {
        fields: "userId,username,profileImage,reputation",
        sortField: "reputation",
        sortOrder: "desc",
        page: 1,
        limit,
      },
    });

    return response.data.data?.data ?? [];
  });
}
