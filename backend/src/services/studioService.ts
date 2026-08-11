import { studioRepository, StudioEntity } from '../repositories/studioRepository';
import { createAppError } from '../middleware/errorHandler';

export const studioService = {
  async getAllStudios(search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<StudioEntity[]> {
    return await studioRepository.findAll(search, sortBy, sortOrder);
  },

  async getStudioById(id: string): Promise<StudioEntity> {
    const studio = await studioRepository.findById(id);
    if (!studio) {
      throw createAppError(`Studio with ID ${id} not found`, 404);
    }
    return studio;
  },

  async createStudio(data: { name: string; description?: string | null; website_url?: string | null }): Promise<StudioEntity> {
    const existing = await studioRepository.findByName(data.name);
    if (existing) {
      throw createAppError(`Studio with name '${data.name}' already exists`, 400);
    }
    return await studioRepository.create(data);
  },

  async updateStudio(id: string, data: Partial<{ name: string; description?: string | null; website_url?: string | null }>): Promise<StudioEntity> {
    await this.getStudioById(id);

    if (data.name) {
      const existing = await studioRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw createAppError(`Studio name '${data.name}' is already taken`, 400);
      }
    }

    const updated = await studioRepository.update(id, data);
    if (!updated) {
      throw createAppError('Failed to update studio', 500);
    }
    return updated;
  },

  async deleteStudio(id: string): Promise<void> {
    await this.getStudioById(id);
    await studioRepository.delete(id);
  },
};
