import api from './client';
import type { ApiResponse, Genre } from '@/types';

export const genreApi = {
  async getAll(params?: { search?: string }): Promise<ApiResponse<Genre[]>> {
    const { data } = await api.get('/genres', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<Genre>> {
    const { data } = await api.get(`/genres/${id}`);
    return data;
  },

  async create(genre: { name: string; description?: string | null }): Promise<ApiResponse<Genre>> {
    const { data } = await api.post('/genres', genre);
    return data;
  },

  async update(id: string, genre: Partial<{ name: string; description?: string | null }>): Promise<ApiResponse<Genre>> {
    const { data } = await api.put(`/genres/${id}`, genre);
    return data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete(`/genres/${id}`);
    return data;
  },
};
