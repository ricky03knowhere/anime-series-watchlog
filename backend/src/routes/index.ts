import { Router } from 'express';
import { healthCheck } from './health';
import mediaRoutes from './mediaRoutes';
import genreRoutes from './genreRoutes';
import studioRoutes from './studioRoutes';
import uploadRoutes from './uploadRoutes';
import seedRoutes from './seedRoutes';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Core Resource API Routes
router.use('/media', mediaRoutes);
router.use('/genres', genreRoutes);
router.use('/studios', studioRoutes);
router.use('/upload', uploadRoutes);
router.use('/seed', seedRoutes);

export default router;
