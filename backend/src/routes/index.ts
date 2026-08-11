import { Router } from 'express';
import { healthCheck } from './health';
import mediaRoutes from './mediaRoutes';
import genreRoutes from './genreRoutes';
import studioRoutes from './studioRoutes';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Core Resource API Routes
router.use('/media', mediaRoutes);
router.use('/genres', genreRoutes);
router.use('/studios', studioRoutes);

export default router;
