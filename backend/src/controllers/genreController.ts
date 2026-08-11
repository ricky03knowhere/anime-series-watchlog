import { Request, Response, NextFunction } from 'express';
import { genreService } from '../services/genreService';
import { createGenreSchema, updateGenreSchema, genreQuerySchema } from '../validators/genreValidator';

export const genreController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = genreQuerySchema.parse(req.query);
      const genres = await genreService.getAllGenres(query.search, query.sortBy, query.sortOrder);

      res.json({
        success: true,
        message: 'Genres retrieved successfully',
        data: genres,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const genre = await genreService.getGenreById(id);

      res.json({
        success: true,
        message: 'Genre retrieved successfully',
        data: genre,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createGenreSchema.parse(req.body);
      const genre = await genreService.createGenre(body);

      res.status(201).json({
        success: true,
        message: 'Genre created successfully',
        data: genre,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const body = updateGenreSchema.parse(req.body);
      const genre = await genreService.updateGenre(id, body);

      res.json({
        success: true,
        message: 'Genre updated successfully',
        data: genre,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await genreService.deleteGenre(id);

      res.json({
        success: true,
        message: 'Genre deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
