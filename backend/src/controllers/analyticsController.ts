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
};
