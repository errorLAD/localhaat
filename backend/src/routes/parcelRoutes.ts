import { Router } from 'express';
import {
  getAvailableVillageAgents,
  searchParcelMatches,
  createParcel,
  getMyParcels,
  getParcels,
  getParcelByTrackingNumber,
  acceptParcel,
  rejectParcel,
  verifyPickup,
  verifyHandover,
  verifyDelivery,
  updateParcelStatus,
  getParcelMatches,
  selectParcelPartner,
  getTripStopManifest,
  advanceParcelLifecycle,
  createBookingRequest,
  acceptBookingRequest,
  rejectBookingRequest,
  cancelBookingRequest,
  getPartnerBookingRequests,
  getBookingRequestById,
  payCashForParcel,
  createParcelPaymentOrder,
  verifyParcelPayment,
  confirmCashPayment,
} from '../controllers/parcelController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth as any);

router.get('/agents', getAvailableVillageAgents as any);
router.post('/search-matches', searchParcelMatches as any);
router.post('/', createParcel as any);
router.get('/my-parcels', getMyParcels as any);
router.get('/trips/:tripId/manifest', getTripStopManifest as any);

// Booking Requests (Sections 19, 21, 22, 23, 32)
router.post('/booking-requests', createBookingRequest as any);
router.get('/booking-requests/partner', getPartnerBookingRequests as any);
router.get('/booking-requests/:requestId', getBookingRequestById as any);
router.post('/booking-requests/:requestId/accept', acceptBookingRequest as any);
router.post('/booking-requests/:requestId/reject', rejectBookingRequest as any);
router.post('/booking-requests/:requestId/cancel', cancelBookingRequest as any);

// Payment Operations (Sections 24-30)
router.post('/:id/pay-cash', payCashForParcel as any);
router.post('/:id/create-payment-order', createParcelPaymentOrder as any);
router.post('/:id/verify-payment', verifyParcelPayment as any);
router.post('/:id/confirm-cash', confirmCashPayment as any);

router.get('/', getParcels as any);
router.get('/track/:trackingNumber', getParcelByTrackingNumber as any);

// Route Matching & Partner Selection (Sections 2, 7, 8, 9, 10)
router.get('/:id/matches', getParcelMatches as any);
router.post('/:id/select-partner', selectParcelPartner as any);
router.post('/:id/lifecycle-step', advanceParcelLifecycle as any);

router.post('/:id/accept', acceptParcel as any);
router.post('/:id/reject', rejectParcel as any);
router.post('/:id/verify-pickup', verifyPickup as any);
router.post('/:id/verify-pickup-code', verifyPickup as any);
router.post('/:id/verify-handover', verifyHandover as any);
router.post('/:id/verify-agent-handover', verifyHandover as any);
router.post('/:id/verify-agent-handover-code', verifyHandover as any);
router.post('/:id/verify-agent-code', verifyHandover as any);
router.post('/:id/verify-delivery', verifyDelivery as any);
router.post('/:id/verify-delivery-code', verifyDelivery as any);
router.put('/:id/status', updateParcelStatus as any);

export default router;
