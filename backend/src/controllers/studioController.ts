import { Request, Response, NextFunction } from 'express';
import { studioService } from '../services/studioService';
import { createStudioSchema, updateStudioSchema, studioQuerySchema } from '../validators/studioValidator';

export const studioController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = studioQuerySchema.parse(req.query);
      const studios = await studioService.getAllStudios(query.search, query.sortBy, query.sortOrder);

      res.json({
        success: true,
        message: 'Studios retrieved successfully',
        data: studios,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const studio = await studioService.getStudioById(id);

      res.json({
        success: true,
        message: 'Studio retrieved successfully',
        data: studio,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createStudioSchema.parse(req.body);
      const studio = await studioService.createStudio(body);

      res.status(201).json({
        success: true,
        message: 'Studio created successfully',
        data: studio,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const body = updateStudioSchema.parse(req.body);
      const studio = await studioService.updateStudio(id, body);

      res.json({
        success: true,
        message: 'Studio updated successfully',
        data: studio,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await studioService.deleteStudio(id);

      res.json({
        success: true,
        message: 'Studio deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
