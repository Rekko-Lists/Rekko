import api from "./api";
import type { AnimePagination } from "@/types/anime";
import type { Post } from "@/store/useFeedStore";

interface CreatePostParams {
  title: string;
  description?: string;
  animeIds?: number[];
  photo?: File | null;
}

export async function createPost(params: CreatePostParams): Promise<void> {
  const formData = new FormData();
  formData.append("title", params.title);
  if (params.description) formData.append("description", params.description);
  if (params.animeIds?.length) {
    formData.append("animeIds", JSON.stringify(params.animeIds));
  }
  if (params.photo) formData.append("postImage", params.photo);

  await api.post("/post", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export interface PostAnimeSummary {
  malId: number;
  name: string;
  imgMedium: string;
  imgLarge: string;
}

export interface PostDetailData {
  postId: number;
  title: string;
  description: string | null;
  photo: string | null;
  likes: number;
  createdAt?: string | Date;
  commentCount?: number;
  userId: number | null;
  user?: { username: string; profileImage: string } | null;
  animes: PostAnimeSummary[];
  hasLiked: boolean;
}

export interface CommentData {
  commentId: number;
  message: string;
  likes: number;
  userId: number | null;
  user?: { username: string; profileImage: string } | null;
  postId: number;
  parentCommentId: number | null;
  replyCount?: number;
  hasReplies?: boolean;
  hasLiked: boolean;
}

export interface CommentsPage {
  comments: CommentData[];
  pagination: AnimePagination;
}

export interface PostDetailResponse {
  post: PostDetailData;
  comments: CommentsPage;
}

interface RawPostDetailEnvelope {
  data?: {
    post?: PostDetailData;
    comments?: {
      data?: CommentData[];
      comments?: CommentData[];
      pagination?: AnimePagination;
    };
  };
}

interface RawPostsEnvelope {
  data?: {
    posts?: PostDetailData[];
    pagination?: AnimePagination;
  };
}

interface RawCommentsEnvelope {
  data?: {
    comments?: CommentData[];
    pagination?: AnimePagination;
  };
}

interface RawLikePostEnvelope {
  data?: {
    post?: PostDetailData;
  };
}

interface RawLikeCommentEnvelope {
  data?: {
    comment?: CommentData;
  };
}

export interface PostsPage {
  posts: PostDetailData[];
  pagination: AnimePagination;
}

export interface ListPostsParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | number>;
}

export function formatPostTime(value: PostDetailData["createdAt"]): string {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function toFeedPost(post: PostDetailData): Post {
  return {
    id: String(post.postId),
    user: post.user?.username ?? "Deleted user",
    avatar: post.user?.profileImage ?? undefined,
    time: formatPostTime(post.createdAt),
    relatedAnimes: post.animes.map((anime) => ({
      id: String(anime.malId),
      title: anime.name,
      cover: anime.imgMedium || anime.imgLarge || "",
    })),
    text: post.description || post.title,
    userImage: post.photo ?? undefined,
    likes: post.likes,
    comments: post.commentCount ?? 0,
    liked: post.hasLiked,
  };
}

async function fetchPostsPage(url: string, params: ListPostsParams = {}, signal?: AbortSignal): Promise<PostsPage> {
  const { filters, ...rest } = params;
  const response = await api.get<RawPostsEnvelope>(url, {
    params: { page: 1, limit: 10, sortField: "createdAt", sortOrder: "desc", ...rest, ...filters },
    signal,
  });
  return {
    posts: response.data.data?.posts ?? [],
    pagination: response.data.data?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: 0,
      pages: 0,
    },
  };
}

export function getPosts(params: ListPostsParams = {}, signal?: AbortSignal): Promise<PostsPage> {
  return fetchPostsPage("/post", params, signal);
}

export async function getPopularPosts(
  limit = 5,
  signal?: AbortSignal,
): Promise<PostDetailData[]> {
  const response = await api.get<RawPostsEnvelope>("/post/popular", {
    params: { limit },
    signal,
  });

  return response.data.data?.posts ?? [];
}

export async function getPostById(
  postId: number,
  params: { page?: number; limit?: number } = {},
  signal?: AbortSignal,
): Promise<PostDetailResponse> {
  const response = await api.get<RawPostDetailEnvelope>(`/post/${postId}`, {
    params: { page: 1, limit: 20, ...params },
    signal,
  });

  const payload = response.data.data;
  const commentsPayload = payload?.comments;

  return {
    post: payload?.post as PostDetailData,
    comments: {
      comments: commentsPayload?.data ?? commentsPayload?.comments ?? [],
      pagination: commentsPayload?.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total: 0,
        pages: 0,
      },
    },
  };
}

export async function getCommentsByPostId(
  postId: number,
  params: { page?: number; limit?: number } = {},
  signal?: AbortSignal,
): Promise<CommentsPage> {
  const response = await api.get<RawCommentsEnvelope>(
    `/comment/by-post/${postId}`,
    {
      params: { page: 1, limit: 20, ...params },
      signal,
    },
  );

  return {
    comments: response.data.data?.comments ?? [],
    pagination: response.data.data?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: 0,
      pages: 0,
    },
  };
}

export async function createComment(params: {
  postId: number;
  message: string;
  parentCommentId?: number | null;
}): Promise<void> {
  await api.post("/comment", params);
}

export function getPostsByUsername(username: string, params: ListPostsParams = {}, signal?: AbortSignal): Promise<PostsPage> {
  return fetchPostsPage(`/post/by-user/${username}`, params, signal);
}

export async function likePost(postId: number): Promise<PostDetailData | null> {
  const response = await api.post<RawLikePostEnvelope>(`/post/${postId}/like`);
  return response.data.data?.post ?? null;
}

export async function unlikePost(postId: number): Promise<PostDetailData | null> {
  const response = await api.delete<RawLikePostEnvelope>(`/post/${postId}/like`);
  return response.data.data?.post ?? null;
}

export async function likeComment(commentId: number): Promise<CommentData | null> {
  const response = await api.post<RawLikeCommentEnvelope>(`/comment/${commentId}/like`);
  return response.data.data?.comment ?? null;
}

export async function unlikeComment(commentId: number): Promise<CommentData | null> {
  const response = await api.delete<RawLikeCommentEnvelope>(`/comment/${commentId}/like`);
  return response.data.data?.comment ?? null;
}
