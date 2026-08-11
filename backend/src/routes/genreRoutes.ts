import { Router } from 'express';
import { genreController } from '../controllers/genreController';

const router = Router();

router.get('/', genreController.getAll);
router.get('/:id', genreController.getById);
router.post('/', genreController.create);
router.put('/:id', genreController.update);
router.delete('/:id', genreController.delete);

export default router;
