import { Router } from 'express';
import {
  getLogisticsDashboardStats,
  getLiveMovingVehicles,
  getAllTrips,
  createTrip,
  getTripById,
  updateTripStatus,
  updateTripStopStatus,
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartnerStatus,
  getAllRoutes,
  createRoute,
  getMatchingPartnersForParcel,
  assignPartnerToParcel,
  getHandoversAndPickups,
  getPartnerEarnings,
  getPartnerPayouts,
  processPartnerPayout,
  getLogisticsComplaints,
  resolveLogisticsComplaint,
  getLogisticsActivityLogs,
  getLogisticsAnalytics,
  deletePartnerById,
  bulkDeletePartners,
} from '../controllers/adminLogisticsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// Protect all admin logistics routes
router.use(authenticate as any);
router.use(requireRoles(['admin']) as any);

// 1. Dashboard Stats
router.get('/dashboard-stats', getLogisticsDashboardStats as any);

// 2. Live Moving Vehicles & Active Movements
router.get('/live', getLiveMovingVehicles as any);

// 3. Trips & Route Stops (/admin/logistics/trips)
router.get('/trips', getAllTrips as any);
router.post('/trips', createTrip as any);
router.get('/trips/:id', getTripById as any);
router.put('/trips/:id/status', updateTripStatus as any);
router.put('/trips/:id/stops/:stopId/status', updateTripStopStatus as any);

// 4. Partner Management
router.get('/partners', getAllPartners as any);
router.post('/partners', createPartner as any);
router.post('/partners/bulk-delete', bulkDeletePartners as any);
router.get('/partners/:id', getPartnerById as any);
router.put('/partners/:id/status', updatePartnerStatus as any);
router.delete('/partners/:id', deletePartnerById as any);

// 5. Routes Directory & Creation
router.get('/routes', getAllRoutes as any);
router.post('/routes', createRoute as any);

// 6. Matching & Assignment Engine
router.get('/match/:parcelId', getMatchingPartnersForParcel as any);
router.post('/assign/:parcelId', assignPartnerToParcel as any);

// 7. Multi-Leg Custody Chain & Handovers
router.get('/handovers', getHandoversAndPickups as any);

// 8. Financials: Earnings & Payouts
router.get('/earnings', getPartnerEarnings as any);
router.get('/payouts', getPartnerPayouts as any);
router.put('/payouts/:id', processPartnerPayout as any);

// 9. Complaints Resolution
router.get('/complaints', getLogisticsComplaints as any);
router.put('/complaints/:id', resolveLogisticsComplaint as any);

// 10. Activity Stream & Audit Trail
router.get('/activity', getLogisticsActivityLogs as any);

// 11. Logistics Analytics
router.get('/analytics', getLogisticsAnalytics as any);

export default router;
