import { genreRepository, GenreEntity } from '../repositories/genreRepository';
import { createAppError } from '../middleware/errorHandler';

export const genreService = {
  async getAllGenres(search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<GenreEntity[]> {
    return await genreRepository.findAll(search, sortBy, sortOrder);
  },

  async getGenreById(id: string): Promise<GenreEntity> {
    const genre = await genreRepository.findById(id);
    if (!genre) {
      throw createAppError(`Genre with ID ${id} not found`, 404);
    }
    return genre;
  },

  async createGenre(data: { name: string; description?: string | null }): Promise<GenreEntity> {
    const existing = await genreRepository.findByName(data.name);
    if (existing) {
      throw createAppError(`Genre with name '${data.name}' already exists`, 400);
    }
    return await genreRepository.create(data);
  },

  async updateGenre(id: string, data: Partial<{ name: string; description?: string | null }>): Promise<GenreEntity> {
    await this.getGenreById(id);

    if (data.name) {
      const existing = await genreRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw createAppError(`Genre name '${data.name}' is already taken`, 400);
      }
    }

    const updated = await genreRepository.update(id, data);
    if (!updated) {
      throw createAppError('Failed to update genre', 500);
    }
    return updated;
  },

  async deleteGenre(id: string): Promise<void> {
    await this.getGenreById(id);
    await genreRepository.delete(id);
  },
};
