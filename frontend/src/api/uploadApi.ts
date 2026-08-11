import api from './client';
import type { ApiResponse } from '@/types';

export interface UploadResponse {
  url: string;
  fileName: string;
  bucket: string;
}

export const uploadApi = {
  async uploadImage(file: File, bucket: 'media-posters' | 'media-backdrops' = 'media-posters'): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },
};
