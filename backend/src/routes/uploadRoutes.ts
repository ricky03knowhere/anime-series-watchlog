import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1MB
});

const router = Router();

router.post('/', upload.single('file'), uploadController.uploadImage);

export default router;
