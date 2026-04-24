import { create } from 'zustand';

interface Filters {
  genre:  string[];
  rating: [number, number];
  type:   string | null;
  season: string | null;
  year:   number | null;
}

interface AnimeListItem {
  id:     string;
  title:  string;
  cover:  string;
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
  score:  number | null;
}

interface AnimeState {
  list:     AnimeListItem[];
  filters:  Filters;
  setList:      (list: AnimeListItem[]) => void;
  addToList:    (anime: Omit<AnimeListItem, 'status' | 'score'>) => void;
  removeFromList:(id: string) => void;
  updateListItem:(id: string, patch: Partial<AnimeListItem>) => void;
  setFilters:   (partial: Partial<Filters>) => void;
}

export const useAnimeStore = create<AnimeState>()((set, get) => ({
  list:    [],
  filters: { genre: [], rating: [0, 10], type: null, season: null, year: null },

  setList:       (list)         => set({ list }),
  addToList:     (anime)        => set({ list: [...get().list, { ...anime, status: 'plan_to_watch', score: null }] }),
  removeFromList:(id)           => set({ list: get().list.filter(a => a.id !== id) }),
  updateListItem:(id, patch)    => set({ list: get().list.map(a => a.id === id ? { ...a, ...patch } : a) }),
  setFilters:    (partial)      => set({ filters: { ...get().filters, ...partial } }),
}));
