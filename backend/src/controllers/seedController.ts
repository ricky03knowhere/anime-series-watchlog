import { Request, Response, NextFunction } from 'express';
import { executeSeedProcess } from '../services/seedService';

export const seedController = {
  async seed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await executeSeedProcess();
      res.json({
        success: true,
        message: 'Database migration seed applied successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
