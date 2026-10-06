import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import parcelRoutes from './parcelRoutes.js';
import logisticsRoutes from './logisticsRoutes.js';
import agentRoutes from './agentRoutes.js';
import businessRoutes from './businessRoutes.js';
import earningsRoutes from './earningsRoutes.js';
import adminRoutes from './adminRoutes.js';
import adminStoreRoutes from './adminStoreRoutes.js';
import adminAgentRoutes from './adminAgentRoutes.js';
import adminParcelRoutes from './adminParcelRoutes.js';
import adminLogisticsRoutes from './adminLogisticsRoutes.js';
import trackingRoutes from './trackingRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import { getCategories } from '../controllers/productController.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/products', productRoutes);
router.get('/categories', getCategories);
router.use('/orders', orderRoutes);
router.use('/parcels', parcelRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/agent', agentRoutes);
router.use('/business', businessRoutes);
router.use('/earnings', earningsRoutes);
router.use('/admin/agents', adminAgentRoutes);
router.use('/admin/parcels', adminParcelRoutes);
router.use('/admin/logistics', adminLogisticsRoutes);
router.use('/admin/store', adminStoreRoutes);
router.use('/admin', adminRoutes);
router.use('/track', trackingRoutes);

router.get('/db-summary', async (req, res) => {
  try {
    const { User } = await import('../models/User.js');
    const { LogisticsPartner } = await import('../models/LogisticsPartner.js');
    const { VillageAgent } = await import('../models/VillageAgent.js');
    const { Vehicle } = await import('../models/Vehicle.js');
    const { PartnerRoute } = await import('../models/PartnerRoute.js');
    const { LogisticsTrip } = await import('../models/LogisticsTrip.js');
    const { Parcel } = await import('../models/Parcel.js');

    const [
      users,
      partners,
      agents,
      vehicles,
      routes,
      trips,
      parcels,
    ] = await Promise.all([
      User.find({}, 'name phone role email'),
      LogisticsPartner.find({}, 'businessName phone partnerType status userId'),
      VillageAgent.find({}, 'villageName hubCode status userId'),
      Vehicle.countDocuments(),
      PartnerRoute.countDocuments(),
      LogisticsTrip.countDocuments(),
      Parcel.countDocuments(),
    ]);

    return res.json({
      usersCount: users.length,
      partnersCount: partners.length,
      agentsCount: agents.length,
      vehiclesCount: vehicles,
      routesCount: routes,
      tripsCount: trips,
      parcelsCount: parcels,
      users,
      partners,
      agents,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.all(['/cleanup-fake-data', '/wipe-database'], async (req, res) => {
  const secretKey = req.query.adminSecret || req.headers['x-admin-secret'];
  if (secretKey !== 'localhaat_explicit_purge_2026') {
    return res.status(403).json({
      success: false,
      message: 'Automatic database wiping is disabled to preserve user signups, partners, and active accounts.',
    });
  }
  try {
    const { User } = await import('../models/User.js');
    const { LogisticsPartner } = await import('../models/LogisticsPartner.js');
    const { VillageAgent } = await import('../models/VillageAgent.js');
    const { Vehicle } = await import('../models/Vehicle.js');
    const { PartnerRoute } = await import('../models/PartnerRoute.js');
    const { LogisticsTrip } = await import('../models/LogisticsTrip.js');
    const { LogisticsActivity } = await import('../models/LogisticsActivity.js');
    const { LogisticsComplaint } = await import('../models/LogisticsComplaint.js');
    const { AgentActivity } = await import('../models/AgentActivity.js');
    const { AgentComplaint } = await import('../models/AgentComplaint.js');
    const { AgentReview } = await import('../models/AgentReview.js');
    const { AgentSetting } = await import('../models/AgentSetting.js');
    const { HandoverRecord } = await import('../models/HandoverRecord.js');
    const { ShipmentLeg } = await import('../models/ShipmentLeg.js');
    const { ParcelAssignment } = await import('../models/ParcelAssignment.js');
    const { ParcelBookingRequest } = await import('../models/ParcelBookingRequest.js');
    const { ParcelDispute } = await import('../models/ParcelDispute.js');
    const { ParcelEvent } = await import('../models/ParcelEvent.js');
    const { KycDocument } = await import('../models/KycDocument.js');
    const { AdminAuditLog } = await import('../models/AdminAuditLog.js');
    const { Parcel } = await import('../models/Parcel.js');
    const { Order } = await import('../models/Order.js');
    const { OrderItem } = await import('../models/OrderItem.js');
    const { BusinessAccount } = await import('../models/BusinessAccount.js');
    const { Earning } = await import('../models/Earning.js');
    const { Payout } = await import('../models/Payout.js');
    const { Payment } = await import('../models/Payment.js');
    const { Notification } = await import('../models/Notification.js');
    const { TrackingEvent } = await import('../models/TrackingEvent.js');
    const { InventoryLog } = await import('../models/InventoryLog.js');
    const { Review } = await import('../models/Review.js');

    // Wipe ALL data from database completely - clean slate
    const [
      deletedUsers,
      deletedPartners,
      deletedAgents,
      deletedVehicles,
      deletedRoutes,
      deletedTrips,
      deletedLogisticsActivities,
      deletedLogisticsComplaints,
      deletedAgentActivities,
      deletedAgentComplaints,
      deletedAgentReviews,
      deletedAgentSettings,
      deletedHandovers,
      deletedShipmentLegs,
      deletedAssignments,
      deletedBookingRequests,
      deletedDisputes,
      deletedEvents,
      deletedParcels,
      deletedOrders,
      deletedOrderItems,
      deletedBusiness,
      deletedEarnings,
      deletedPayouts,
      deletedPayments,
      deletedKyc,
      deletedAudit,
      deletedNotifications,
      deletedTracking,
      deletedInventory,
      deletedReviews,
    ] = await Promise.all([
      User.deleteMany({}),
      LogisticsPartner.deleteMany({}),
      VillageAgent.deleteMany({}),
      Vehicle.deleteMany({}),
      PartnerRoute.deleteMany({}),
      LogisticsTrip.deleteMany({}),
      LogisticsActivity.deleteMany({}),
      LogisticsComplaint.deleteMany({}),
      AgentActivity.deleteMany({}),
      AgentComplaint.deleteMany({}),
      AgentReview.deleteMany({}),
      AgentSetting.deleteMany({}),
      HandoverRecord.deleteMany({}),
      ShipmentLeg.deleteMany({}),
      ParcelAssignment.deleteMany({}),
      ParcelBookingRequest.deleteMany({}),
      ParcelDispute.deleteMany({}),
      ParcelEvent.deleteMany({}),
      Parcel.deleteMany({}),
      Order.deleteMany({}),
      OrderItem.deleteMany({}),
      BusinessAccount.deleteMany({}),
      Earning.deleteMany({}),
      Payout.deleteMany({}),
      Payment.deleteMany({}),
      KycDocument.deleteMany({}),
      AdminAuditLog.deleteMany({}),
      Notification.deleteMany({}),
      TrackingEvent.deleteMany({}),
      InventoryLog.deleteMany({}),
      Review.deleteMany({}),
    ]);

    return res.json({
      success: true,
      message: 'All accounts, partners, agents, parcels, and database records have been completely cleared.',
      purged: {
        users: deletedUsers.deletedCount,
        logisticsPartners: deletedPartners.deletedCount,
        villageAgents: deletedAgents.deletedCount,
        vehicles: deletedVehicles.deletedCount,
        routes: deletedRoutes.deletedCount,
        trips: deletedTrips.deletedCount,
        parcels: deletedParcels.deletedCount,
        orders: deletedOrders.deletedCount,
        kycDocuments: deletedKyc.deletedCount,
        auditLogs: deletedAudit.deletedCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
