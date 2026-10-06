import { Router } from 'express';
import { getMyEarnings, requestPayout } from '../controllers/earningsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate as any);

router.get('/', getMyEarnings as any);
router.post('/payout-request', requestPayout as any);

export default router;
