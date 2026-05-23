import { useCallback, useEffect, useState } from 'react';
import {
  likeAnime as apiLikeAnime,
  unlikeAnime as apiUnlikeAnime,
  setWatchState as apiSetWatchState,
  setRating as apiSetRating,
  setEpisodeProgress as apiSetEpisodeProgress,
} from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import { useAuthStore } from '@/store/useAuthStore';
import type { Anime, WatchState } from '@/types/anime';

interface UserActionsState {
  liked: boolean;
  likes: number;
  watchState: WatchState | null;
  episodeProgress: number;
  rating: number;
  inListCount: number;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAnimeUserActions(anime: Anime | null) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.user));

  const [state, setState] = useState<UserActionsState>({
    liked: false,
    likes: 0,
    watchState: null,
    episodeProgress: 0,
    rating: 0,
    inListCount: 0,
    isAuthenticated,
    error: null,
  });

  // Sync state when anime data loads/changes
  useEffect(() => {
    if (!anime) return;
    setState({
      liked: anime.liked ?? false,
      likes: anime.likes ?? 0,
      watchState: anime.userWatchState ?? null,
      episodeProgress: anime.userEpisodeProgress ?? 0,
      rating: anime.userRating ?? 0,
      inListCount: anime.inListCount ?? 0,
      isAuthenticated,
      error: null,
    });
  }, [anime, isAuthenticated]);

  const toggleLike = useCallback(async () => {
    if (!anime || !isAuthenticated) return;
    const wasLiked = state.liked;
    // Optimistic
    setState((prev) => ({
      ...prev,
      liked: !wasLiked,
      likes: wasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
      error: null,
    }));
    try {
      if (wasLiked) {
        await apiUnlikeAnime(anime.malId);
      } else {
        await apiLikeAnime(anime.malId);
      }
    } catch (err) {
      // Rollback
      setState((prev) => ({
        ...prev,
        liked: wasLiked,
        likes: wasLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
        error: extractApiError(err),
      }));
    }
  }, [anime, isAuthenticated, state.liked]);

  const setWatchState = useCallback(
    async (newState: WatchState | null) => {
      if (!anime || !isAuthenticated) return;
      const prevState = state.watchState;
      const prevInList = state.inListCount;
      const wasInList = prevState != null;
      const willBeInList = newState != null;

      setState((prev) => ({
        ...prev,
        watchState: newState,
        inListCount:
          !wasInList && willBeInList
            ? prev.inListCount + 1
            : wasInList && !willBeInList
              ? Math.max(0, prev.inListCount - 1)
              : prev.inListCount,
        error: null,
      }));

      try {
        if (newState != null) {
          await apiSetWatchState(anime.malId, newState, state.episodeProgress || undefined);
        } else {
          // Backend doesn't have a clear "remove from list" — best effort: no-op rollback if needed
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          watchState: prevState,
          inListCount: prevInList,
          error: extractApiError(err),
        }));
      }
    },
    [anime, isAuthenticated, state.watchState, state.episodeProgress, state.inListCount],
  );

  const setRating = useCallback(
    async (rating: number) => {
      if (!anime || !isAuthenticated) return;
      const prevRating = state.rating;
      setState((prev) => ({ ...prev, rating, error: null }));
      try {
        await apiSetRating(anime.malId, rating);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          rating: prevRating,
          error: extractApiError(err),
        }));
      }
    },
    [anime, isAuthenticated, state.rating],
  );

  const setEpisodeProgress = useCallback(
    async (episodes: number) => {
      if (!anime || !isAuthenticated) return;
      const prevEpisodes = state.episodeProgress;
      setState((prev) => ({ ...prev, episodeProgress: episodes, error: null }));
      try {
        await apiSetEpisodeProgress(anime.malId, episodes, state.watchState ?? undefined);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          episodeProgress: prevEpisodes,
          error: extractApiError(err),
        }));
      }
    },
    [anime, isAuthenticated, state.episodeProgress, state.watchState],
  );

  return {
    ...state,
    toggleLike,
    setWatchState,
    setRating,
    setEpisodeProgress,
  };
}
