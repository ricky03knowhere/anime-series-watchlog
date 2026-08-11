import { mediaRepository, MediaEntity, MediaFilterOptions } from '../repositories/mediaRepository';
import { createAppError } from '../middleware/errorHandler';

export interface CreateMediaInput {
  title: string;
  media_type: 'anime' | 'tv_series';
  release_date?: string | null;
  episodes?: number | null;
  description?: string | null;
  score?: number | null;
  watched_date?: string | null;
  poster_url?: string | null;
  backdrop_url?: string | null;
  studio_id?: string | null;
  genre_ids?: string[];
}

export const mediaService = {
  async getMediaList(options: MediaFilterOptions) {
    const { data, total } = await mediaRepository.findAll(options);
    const totalPages = Math.ceil(total / options.limit) || 1;

    return {
      items: data,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
      },
    };
  },

  async getMediaById(id: string): Promise<MediaEntity> {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw createAppError(`Media item with ID ${id} not found`, 404);
    }
    return media;
  },

  async createMedia(input: CreateMediaInput): Promise<MediaEntity> {
    const { genre_ids, ...mediaData } = input;
    const media = await mediaRepository.create(mediaData);

    if (genre_ids && genre_ids.length > 0) {
      await mediaRepository.setGenres(media.id, genre_ids);
    }

    return await this.getMediaById(media.id);
  },

  async updateMedia(id: string, input: Partial<CreateMediaInput>): Promise<MediaEntity> {
    await this.getMediaById(id);

    const { genre_ids, ...mediaData } = input;

    if (Object.keys(mediaData).length > 0) {
      await mediaRepository.update(id, mediaData);
    }

    if (genre_ids !== undefined) {
      await mediaRepository.setGenres(id, genre_ids);
    }

    return await this.getMediaById(id);
  },

  async deleteMedia(id: string): Promise<void> {
    await this.getMediaById(id);
    await mediaRepository.delete(id);
  },
};
