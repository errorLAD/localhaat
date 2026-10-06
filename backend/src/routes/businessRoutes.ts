import { Router } from 'express';
import {
  getBusinessDashboard,
  getBusinessShipments,
  createShipment,
  createBulkShipments,
  createPickupRequest,
  getBusinessInvoices,
  updateBusinessProfile,
  changeBusinessPassword,
} from '../controllers/businessController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate as any);
router.use(requireRoles(['business', 'admin']) as any);

router.get('/dashboard', getBusinessDashboard as any);
router.get('/shipments', getBusinessShipments as any);
router.post('/shipments', createShipment as any);
router.post('/shipments/bulk', createBulkShipments as any);
router.post('/pickups', createPickupRequest as any);
router.get('/invoices', getBusinessInvoices as any);
router.put('/profile', updateBusinessProfile as any);
router.put('/change-password', changeBusinessPassword as any);

export default router;
