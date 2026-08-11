import { Request, Response } from 'express';

export function healthCheck(_req: Request, res: Response): void {
  res.json({
    success: true,
    message: 'AnimeSeries Watchlog API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}
