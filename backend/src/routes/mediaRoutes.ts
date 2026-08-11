import { Router } from 'express';
import { mediaController } from '../controllers/mediaController';

const router = Router();

router.get('/', mediaController.getAll);
router.get('/:id', mediaController.getById);
router.post('/', mediaController.create);
router.put('/:id', mediaController.update);
router.delete('/:id', mediaController.delete);

export default router;
