import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/mediaService';
import { createMediaSchema, updateMediaSchema, mediaQuerySchema } from '../validators/mediaValidator';

export const mediaController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = mediaQuerySchema.parse(req.query);
      const result = await mediaService.getMediaList(query);

      res.json({
        success: true,
        message: 'Media list retrieved successfully',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const media = await mediaService.getMediaById(id);

      res.json({
        success: true,
        message: 'Media retrieved successfully',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createMediaSchema.parse(req.body);
      const media = await mediaService.createMedia(body);

      res.status(201).json({
        success: true,
        message: 'Media created successfully',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const body = updateMediaSchema.parse(req.body);
      const media = await mediaService.updateMedia(id, body);

      res.json({
        success: true,
        message: 'Media updated successfully',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await mediaService.deleteMedia(id);

      res.json({
        success: true,
        message: 'Media deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
