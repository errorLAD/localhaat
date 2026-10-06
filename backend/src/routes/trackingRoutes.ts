import { Router } from 'express';
import { trackPublicParcel } from '../controllers/trackingController.js';

const router = Router();

// Public tracking endpoint (no auth required)
router.get('/:trackingNumber', trackPublicParcel);

export default router;
