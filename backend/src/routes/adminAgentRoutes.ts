import { Router } from 'express';
import {
  getAgentDashboardStats,
  getAllAgents,
  getLiveAgents,
  getAgentById,
  updateAgentStatus,
  updateAgentProfile,
  getAgentPackages,
  getAgentEarnings,
  getAgentPayouts,
  processAgentPayoutAction,
  getAgentReviews,
  moderateAgentReview,
  getAgentComplaints,
  resolveAgentComplaint,
  getAgentDocuments,
  verifyAgentDocument,
  getAgentActivityLogs,
  getAdminAuditLogs,
  getAgentSettings,
  updateAgentSettings,
  exportAgentsCsv,
  createAgent,
  resetAgentPassword,
  bulkDeleteAgents,
  deleteAgentById,
} from '../controllers/adminAgentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// Protect all routes with admin authentication
router.use(authenticate as any);
router.use(requireRoles(['admin']) as any);

// 1. Dashboard Stats
router.get('/dashboard-stats', getAgentDashboardStats as any);

// 2. Export CSV (before :id to avoid route clash)
router.get('/export/csv', exportAgentsCsv as any);

// 3. Live Agents
router.get('/live', getLiveAgents as any);

// 4. Operations & Packages
router.get('/packages', getAgentPackages as any);

// 5. Financial Ledger
router.get('/earnings', getAgentEarnings as any);
router.get('/payouts', getAgentPayouts as any);
router.put('/payouts/:id/action', processAgentPayoutAction as any);

// 6. Reviews & Moderation
router.get('/reviews', getAgentReviews as any);
router.put('/reviews/:id/moderate', moderateAgentReview as any);

// 7. Complaints
router.get('/complaints', getAgentComplaints as any);
router.put('/complaints/:id/resolve', resolveAgentComplaint as any);

// 8. KYC Documents
router.get('/documents', getAgentDocuments as any);
router.put('/documents/:id/verify', verifyAgentDocument as any);

// 9. Activity & Audit Logs
router.get('/activity-logs', getAgentActivityLogs as any);
router.get('/audit-logs', getAdminAuditLogs as any);

// 10. Operations Settings
router.get('/settings', getAgentSettings as any);
router.put('/settings', updateAgentSettings as any);

// 11. Core Agents CRUD / Actions
router.get('/', getAllAgents as any);
router.post('/', createAgent as any);
router.post('/bulk-delete', bulkDeleteAgents as any);
router.get('/:id', getAgentById as any);
router.put('/:id/status', updateAgentStatus as any);
router.put('/:id/profile', updateAgentProfile as any);
router.post('/:id/reset-password', resetAgentPassword as any);
router.delete('/:id', deleteAgentById as any);

export default router;
