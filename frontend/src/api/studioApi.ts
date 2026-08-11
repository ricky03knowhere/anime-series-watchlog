import api from './client';
import type { ApiResponse, Studio } from '@/types';

export const studioApi = {
  async getAll(params?: { search?: string }): Promise<ApiResponse<Studio[]>> {
    const { data } = await api.get('/studios', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<Studio>> {
    const { data } = await api.get(`/studios/${id}`);
    return data;
  },

  async create(studio: { name: string; description?: string | null; website_url?: string | null }): Promise<ApiResponse<Studio>> {
    const { data } = await api.post('/studios', studio);
    return data;
  },

  async update(id: string, studio: Partial<{ name: string; description?: string | null; website_url?: string | null }>): Promise<ApiResponse<Studio>> {
    const { data } = await api.put(`/studios/${id}`, studio);
    return data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete(`/studios/${id}`);
    return data;
  },
};
