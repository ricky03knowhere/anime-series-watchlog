import { Request, Response, NextFunction } from 'express';
import { analyticsRepository } from '../repositories/analyticsRepository';

export const analyticsController = {
  async getDashboardAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsRepository.getDashboardAnalytics();
      res.json({
        success: true,
        message: 'Dashboard analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTop10(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year, type, genre, studio, sort } = req.query;
      const data = await analyticsRepository.getTop10({
        year: year ? Number(year) : undefined,
        type: type as 'anime' | 'tv_series' | undefined,
        genre: genre as string | undefined,
        studio: studio as string | undefined,
        sort: (sort as 'score' | 'episodes' | 'watched_date') || 'score',
      });
      res.json({
        success: true,
        message: 'Top 10 retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year, month } = req.query;
      const data = await analyticsRepository.getWatchHistory({
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
      });
      res.json({
        success: true,
        message: 'Watch history retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year, month } = req.query;
      const data = await analyticsRepository.getTimeline({
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
      });
      res.json({
        success: true,
        message: 'Timeline retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getInsights(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsRepository.getInsights();
      res.json({
        success: true,
        message: 'Insights retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getGenreExplorer(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsRepository.getGenreExplorerData();
      res.json({
        success: true,
        message: 'Genre explorer data retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStudioExplorer(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsRepository.getStudioExplorerData();
      res.json({
        success: true,
        message: 'Studio explorer data retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

