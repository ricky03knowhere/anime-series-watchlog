import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/top10', analyticsController.getTop10);
router.get('/history', analyticsController.getHistory);
router.get('/timeline', analyticsController.getTimeline);
router.get('/insights', analyticsController.getInsights);
router.get('/genre-explorer', analyticsController.getGenreExplorer);
router.get('/studio-explorer', analyticsController.getStudioExplorer);

export default router;
