import api from "@/lib/api";
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

export async function getTopReputationUsers(
  limit = 4,
  signal?: AbortSignal,
): Promise<ReputationUser[]> {
  const response = await api.get<RawUsersEnvelope>("/user", {
    params: {
      fields: "userId,username,profileImage,reputation",
      sortField: "reputation",
      sortOrder: "desc",
      page: 1,
      limit,
    },
    signal,
  });

  return response.data.data?.data ?? [];
}
