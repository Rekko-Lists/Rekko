import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getUserWatchList,
  getUserRateList,
  setWatchState,
  setRating,
  removeFromList,
  removeRating,
  setEpisodeProgress,
  type WatchListItem,
} from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import type { WatchState } from '@/types/anime';

export type ListState = 'COMPLETED' | 'WATCHING' | 'ON_HOLD' | 'DROPPED' | 'PLAN_TO_WATCH';

export interface UserListEntry {
  userWatchAnimeId: number;
  animeId: number;
  malId: number;
  name: string;
  imgMedium: string;
  imgLarge: string;
  state: ListState;
  numEpisodesWatched: number;
  numEpisodesTotal: number;
  animeStatus: string;
  mediaType: string;
  malMean: number;
  mean: number;
  likes: number;
  broadcast: { dayOfWeek: string; startTime: string };
  userRate: number | null;
}

export function mergeEntries(
  watchList: WatchListItem[],
  rateMap: Map<number, number>,
): UserListEntry[] {
  return watchList.map((w) => ({
    userWatchAnimeId: w.userWatchAnimeId,
    animeId: w.animeId,
    malId: w.anime.malId,
    name: w.anime.name,
    imgMedium: w.anime.imgMedium,
    imgLarge: w.anime.imgLarge,
    state: (w.state as string).toUpperCase() as ListState,
    numEpisodesWatched: w.numEpisodes,
    numEpisodesTotal: w.anime.numEpisodes,
    animeStatus: w.anime.status,
    mediaType: w.anime.mediaType,
    malMean: w.anime.malMean,
    mean: w.anime.mean,
    likes: w.anime.likes,
    broadcast: w.anime.broadcast,
    userRate: rateMap.get(w.animeId) ?? null,
  }));
}

// Límite máximo permitido por el backend (findOptionsSchema.max(110))
const PAGE_LIMIT = 110;

export function useUserList() {
  const userId = useAuthStore((s) => s.user?.userId);

  const [entries, setEntries] = useState<UserListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    console.log('[useUserList] effect — userId:', userId, typeof userId);

    if (userId == null) {
      console.warn('[useUserList] userId is null/undefined — no fetch made. Check localStorage "rekko-auth" key.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([
      getUserWatchList(userId, { limit: PAGE_LIMIT }, controller.signal),
      getUserRateList(userId, { limit: PAGE_LIMIT }, controller.signal),
    ])
      .then(([watchRes, rateRes]) => {
        if (controller.signal.aborted) return;
        const rateMap = new Map<number, number>(
          (rateRes.ratingList ?? []).map((r) => [r.animeId, r.rate]),
        );
        setEntries(mergeEntries(watchRes.watchList ?? [], rateMap));
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted || axios.isCancel(err)) return;
        setError(extractApiError(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [userId, fetchKey]);

  const refresh = useCallback(() => setFetchKey((k) => k + 1), []);

  const updateState = useCallback(async (malId: number, newState: WatchState, numEpisodes?: number) => {
    await setWatchState(malId, newState, numEpisodes);
    setEntries((prev) =>
      prev.map((e) =>
        e.malId === malId
          ? { ...e, state: newState as ListState, numEpisodesWatched: numEpisodes ?? e.numEpisodesWatched }
          : e,
      ),
    );
  }, []);

  const updateEpisodes = useCallback(async (malId: number, episodes: number, currentState: ListState) => {
    await setEpisodeProgress(malId, episodes, currentState as WatchState);
    setEntries((prev) =>
      prev.map((e) => e.malId === malId ? { ...e, numEpisodesWatched: episodes } : e),
    );
  }, []);

  const updateRating = useCallback(async (malId: number, rating: number) => {
    await setRating(malId, rating);
    setEntries((prev) =>
      prev.map((e) => e.malId === malId ? { ...e, userRate: rating } : e),
    );
  }, []);

  const deleteEntry = useCallback(async (malId: number, hasRating: boolean) => {
    await removeFromList(malId);
    if (hasRating) await removeRating(malId);
    setEntries((prev) => prev.filter((e) => e.malId !== malId));
  }, []);

  return {
    entries,
    loading,
    error,
    refresh,
    updateState,
    updateEpisodes,
    updateRating,
    deleteEntry,
  };
}
