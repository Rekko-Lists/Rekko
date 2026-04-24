import { create } from 'zustand';

interface RelatedAnime {
  id:    string;
  title: string;
  cover: string;
}

export interface Post {
  id:            string;
  user:          string;
  avatar?:       string;
  time:          string;
  relatedAnimes: RelatedAnime[];
  text:          string;
  userImage?:    string;
  likes:         number;
  comments:      number;
  liked:         boolean;
}

interface FeedState {
  posts:   Post[];
  loading: boolean;
  hasMore: boolean;
  setPosts:    (posts: Post[]) => void;
  appendPosts: (posts: Post[]) => void;
  setLoading:  (v: boolean)   => void;
  setHasMore:  (v: boolean)   => void;
  toggleLike:  (id: string)   => void;
}

export const useFeedStore = create<FeedState>()((set, get) => ({
  posts:   [],
  loading: false,
  hasMore: true,

  setPosts:    (posts) => set({ posts }),
  appendPosts: (posts) => set({ posts: [...get().posts, ...posts] }),
  setLoading:  (v)     => set({ loading: v }),
  setHasMore:  (v)     => set({ hasMore: v }),
  toggleLike:  (id)    => set({
    posts: get().posts.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ),
  }),
}));
