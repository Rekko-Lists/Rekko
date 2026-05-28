import api from './api';

interface CreatePostParams {
  title: string;
  description?: string;
  animeIds?: number[];
  photo?: File | null;
}

export async function createPost(params: CreatePostParams): Promise<void> {
  const formData = new FormData();
  formData.append('title', params.title);
  if (params.description) formData.append('description', params.description);
  if (params.animeIds?.length) {
    formData.append('animeIds', JSON.stringify(params.animeIds));
  }
  if (params.photo) formData.append('postImage', params.photo);

  await api.post('/post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
