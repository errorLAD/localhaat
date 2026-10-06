import { Router } from 'express';
import {
  getAgentDashboard,
  getAgentProfile,
  updateAgentProfile,
  toggleAgentStatus,
  recordCashCollection,
  confirmManualAgentHandover,
} from '../controllers/agentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate as any);
router.use(requireRoles(['village_agent', 'admin']) as any);

router.get('/dashboard', getAgentDashboard as any);
router.get('/profile', getAgentProfile as any);
router.put('/profile', updateAgentProfile as any);
router.patch('/toggle-status', toggleAgentStatus as any);
router.post('/cash-collection', recordCashCollection as any);
router.post('/parcels/:id/manual-handover', confirmManualAgentHandover as any);

export default router;
