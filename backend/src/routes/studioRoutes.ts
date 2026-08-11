import { Router } from 'express';
import { studioController } from '../controllers/studioController';

const router = Router();

router.get('/', studioController.getAll);
router.get('/:id', studioController.getById);
router.post('/', studioController.create);
router.put('/:id', studioController.update);
router.delete('/:id', studioController.delete);

export default router;
