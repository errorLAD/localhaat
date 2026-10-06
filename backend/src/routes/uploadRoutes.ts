import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController.js';

const router = Router();

router.post('/', uploadFile);

export default router;
