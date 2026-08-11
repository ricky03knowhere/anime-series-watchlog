import api from './client';
import type { ApiResponse, PaginatedResponse, Media, MediaQueryParams } from '@/types';

export const mediaApi = {
  async getAll(params?: MediaQueryParams): Promise<PaginatedResponse<Media>> {
    const { data } = await api.get('/media', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<Media>> {
    const { data } = await api.get(`/media/${id}`);
    return data;
  },

  async create(media: Partial<Media> & { genre_ids?: string[] }): Promise<ApiResponse<Media>> {
    const { data } = await api.post('/media', media);
    return data;
  },

  async update(id: string, media: Partial<Media> & { genre_ids?: string[] }): Promise<ApiResponse<Media>> {
    const { data } = await api.put(`/media/${id}`, media);
    return data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete(`/media/${id}`);
    return data;
  },
};
