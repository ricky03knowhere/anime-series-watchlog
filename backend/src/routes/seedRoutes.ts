import { Router } from 'express';
import { seedController } from '../controllers/seedController';

const router = Router();

router.post('/', seedController.seed);
router.get('/', seedController.seed);

export default router;
