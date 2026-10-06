import { Router } from 'express';
import {
  getParcelDashboardStats,
  getAllParcels,
  getParcelById,
  findMatchingPartnersForParcel,
  assignPartnerToParcel,
  assignAgentToParcel,
  adminVerifyPickup,
  adminVerifyHandover,
  adminVerifyDelivery,
  adminFailDelivery,
  adminInitiateReturn,
  adminCancelParcel,
  updateParcelDetails,
  createOrUpdateDispute,
  addParcelAuditNote,
  bulkParcelActions,
  bulkDeleteParcels,
  deleteParcelById,
  exportParcelsCsv,
  getParcelAnalytics,
} from '../controllers/adminParcelController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// Protect all parcel operations with admin authentication
router.use(authenticate as any);
router.use(requireRoles(['admin']) as any);

// 1. Dashboard Stats
router.get('/dashboard-stats', getParcelDashboardStats as any);

// 2. Export CSV (placed before :id param)
router.get('/export/csv', exportParcelsCsv as any);

// 3. Analytics & Performance
router.get('/analytics', getParcelAnalytics as any);

// 4. Bulk Operations
router.post('/bulk-actions', bulkParcelActions as any);
router.post('/bulk-delete', bulkDeleteParcels as any);

// 5. Query All Parcels
router.get('/', getAllParcels as any);

// 6. Parcel 360° Operations Dossier & Matching
router.get('/:id', getParcelById as any);
router.delete('/:id', deleteParcelById as any);
router.get('/:id/matches', findMatchingPartnersForParcel as any);

// 7. Assignment & Logistics Control
router.post('/:id/assign-partner', assignPartnerToParcel as any);
router.post('/:id/assign-agent', assignAgentToParcel as any);

// 8. Lifecycle Transitions & Handover Verifications
router.post('/:id/verify-pickup', adminVerifyPickup as any);
router.post('/:id/verify-handover', adminVerifyHandover as any);
router.post('/:id/verify-delivery', adminVerifyDelivery as any);
router.post('/:id/fail-delivery', adminFailDelivery as any);
router.post('/:id/return', adminInitiateReturn as any);
router.post('/:id/cancel', adminCancelParcel as any);

// 9. Details Override & Pricing
router.put('/:id/details', updateParcelDetails as any);

// 10. Disputes & Operational Audit Notes
router.post('/:id/disputes', createOrUpdateDispute as any);
router.post('/:id/audit-note', addParcelAuditNote as any);

export default router;
