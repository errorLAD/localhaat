import { Router } from 'express';
import {
  getPlatformStats,
  getUsers,
  getKycDocuments,
  verifyKycDocument,
  getAllPayouts,
  processPayout,
  getAdminBusinessAccounts,
  createAdminBusinessAccount,
  updateAdminBusinessAccount,
  resetAdminBusinessPassword,
  getAdminBusinessShipments,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate as any);
router.use(requireRoles(['admin']) as any);

router.get('/stats', getPlatformStats as any);
router.get('/users', getUsers as any);
router.get('/kyc', getKycDocuments as any);
router.put('/kyc/:id/verify', verifyKycDocument as any);
router.get('/payouts', getAllPayouts as any);
router.put('/payouts/:id/process', processPayout as any);

// Business Accounts (Admin only management)
router.get('/businesses', getAdminBusinessAccounts as any);
router.post('/businesses', createAdminBusinessAccount as any);
router.put('/businesses/:id', updateAdminBusinessAccount as any);
router.post('/businesses/:id/reset-password', resetAdminBusinessPassword as any);
router.get('/businesses/:id/shipments', getAdminBusinessShipments as any);

export default router;
