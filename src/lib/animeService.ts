import api from "@/lib/api.ts";
import { AnimeCatalogueResponse } from "@/types/anime.ts";

type FilterOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "ne" | "in";

type FilterKey = `${string}[${FilterOperator}]`;

export interface SortEntry {
  field: string;
  order: "asc" | "desc";
}

export interface GetAnimesParams {
  page?: number;
  limit?: number;
  sort?: SortEntry[];
  q?: string;
  filters?: Record<FilterKey, string | number>;
}

export async function getGenres(): Promise<string[]> {
  const response = await api.get("/anime/genres");
  return response.data.data.genres as string[];
}

export async function getAnimes(
  params: GetAnimesParams = {},
  signal?: AbortSignal,
): Promise<AnimeCatalogueResponse> {
  const { filters, sort, ...query } = params;

  const sortParams: Record<string, string> = {};
  if (sort && sort.length > 0) {
    sortParams.sortField = sort.map((s) => s.field).join(",");
    sortParams.sortOrder = sort.map((s) => s.order).join(",");
  }

  const queryParams = { ...query, ...sortParams, ...filters };

  const response = await api.get("/anime", { params: queryParams, signal });
  return response.data.data;
}
