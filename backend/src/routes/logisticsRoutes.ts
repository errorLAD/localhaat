import { Router } from 'express';
import {
  getPartnerDashboard,
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  matchRoutes,
  updateLiveLocation,
  registerVehicle,
  toggleOnline,
  getPartnerFullProfile,
  updatePartnerProfile,
  getPartnerLocations,
  addPartnerLocation,
  updatePartnerLocation,
  deactivatePartnerLocation,
  getPartnerShops,
  addPartnerShop,
  updatePartnerShop,
  deactivatePartnerShop,
  getPartnerVehicles,
  addPartnerVehicle,
  updatePartnerVehicle,
  deactivatePartnerVehicle,
  getPartnerDrivers,
  addPartnerDriver,
  updatePartnerDriver,
  deactivatePartnerDriver,
  getPartnerTrips,
  createPartnerTrip,
  updatePartnerTripStatus,
  getPartnerDocuments,
  uploadPartnerDocument,
  requestPartnerPayout,
} from '../controllers/logisticsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate as any);

// Dashboard & State
router.get('/dashboard', requireRoles(['logistics_partner', 'admin']) as any, getPartnerDashboard as any);
router.post('/toggle-online', requireRoles(['logistics_partner', 'admin']) as any, toggleOnline as any);
router.post('/location-update', requireRoles(['logistics_partner', 'admin']) as any, updateLiveLocation as any);

// Profile
router.get('/profile', requireRoles(['logistics_partner', 'admin']) as any, getPartnerFullProfile as any);
router.put('/profile', requireRoles(['logistics_partner', 'admin']) as any, updatePartnerProfile as any);

// Pickup & Drop Locations
router.get('/locations', requireRoles(['logistics_partner', 'admin']) as any, getPartnerLocations as any);
router.post('/locations', requireRoles(['logistics_partner', 'admin']) as any, addPartnerLocation as any);
router.put('/locations/:id', requireRoles(['logistics_partner', 'admin']) as any, updatePartnerLocation as any);
router.patch('/locations/:id/deactivate', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerLocation as any);
router.delete('/locations/:id', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerLocation as any);

// Shops / Business Locations
router.get('/shops', requireRoles(['logistics_partner', 'admin']) as any, getPartnerShops as any);
router.post('/shops', requireRoles(['logistics_partner', 'admin']) as any, addPartnerShop as any);
router.put('/shops/:id', requireRoles(['logistics_partner', 'admin']) as any, updatePartnerShop as any);
router.patch('/shops/:id/deactivate', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerShop as any);
router.delete('/shops/:id', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerShop as any);

// Vehicles
router.get('/vehicles', requireRoles(['logistics_partner', 'admin']) as any, getPartnerVehicles as any);
router.post('/vehicles', requireRoles(['logistics_partner', 'admin']) as any, addPartnerVehicle as any);
router.put('/vehicles/:id', requireRoles(['logistics_partner', 'admin']) as any, updatePartnerVehicle as any);
router.patch('/vehicles/:id/deactivate', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerVehicle as any);
router.delete('/vehicles/:id', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerVehicle as any);

// Drivers
router.get('/drivers', requireRoles(['logistics_partner', 'admin']) as any, getPartnerDrivers as any);
router.post('/drivers', requireRoles(['logistics_partner', 'admin']) as any, addPartnerDriver as any);
router.put('/drivers/:id', requireRoles(['logistics_partner', 'admin']) as any, updatePartnerDriver as any);
router.patch('/drivers/:id/deactivate', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerDriver as any);
router.delete('/drivers/:id', requireRoles(['logistics_partner', 'admin']) as any, deactivatePartnerDriver as any);

// Routes
router.get('/routes', getRoutes as any);
router.get('/routes/:id', getRouteById as any);
router.post('/routes', requireRoles(['logistics_partner', 'admin']) as any, createRoute as any);
router.put('/routes/:id', requireRoles(['logistics_partner', 'admin']) as any, updateRoute as any);
router.delete('/routes/:id', requireRoles(['logistics_partner', 'admin']) as any, deleteRoute as any);
router.post('/routes/match', matchRoutes as any);

// Trips
router.get('/trips', requireRoles(['logistics_partner', 'admin']) as any, getPartnerTrips as any);
router.post('/trips', requireRoles(['logistics_partner', 'admin']) as any, createPartnerTrip as any);
router.patch('/trips/:id/status', requireRoles(['logistics_partner', 'admin']) as any, updatePartnerTripStatus as any);

// Documents & Payouts
router.get('/documents', requireRoles(['logistics_partner', 'admin']) as any, getPartnerDocuments as any);
router.post('/documents', requireRoles(['logistics_partner', 'admin']) as any, uploadPartnerDocument as any);
router.post('/payouts', requireRoles(['logistics_partner', 'admin']) as any, requestPartnerPayout as any);

export default router;
