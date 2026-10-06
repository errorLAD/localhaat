import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { Parcel } from '../models/Parcel.js';
import { ParcelEvent } from '../models/ParcelEvent.js';
import { ShipmentLeg } from '../models/ShipmentLeg.js';
import { HandoverRecord } from '../models/HandoverRecord.js';
import { LogisticsPartner } from '../models/LogisticsPartner.js';
import { Vehicle } from '../models/Vehicle.js';
import { VillageAgent } from '../models/VillageAgent.js';
import { User } from '../models/User.js';
import { Earning } from '../models/Earning.js';
import { Payment } from '../models/Payment.js';
import { ParcelDispute } from '../models/ParcelDispute.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { EarningsService } from '../services/earningsService.js';
import { HandoverVerificationService } from '../services/handoverVerificationService.js';
import { emitToAll, emitToParcel } from '../services/socketService.js';

// Status group helpers
const SEARCHING_STATUSES = ['SEARCHING_FOR_PARTNER', 'created', 'CREATED'];
const ACCEPTED_STATUSES = ['PARTNER_ACCEPTED'];
const PICKUP_PENDING_STATUSES = ['PICKUP_PENDING', 'ready_for_pickup'];
const PICKED_UP_STATUSES = ['PICKED_UP', 'picked_up'];
const IN_TRANSIT_STATUSES = ['IN_TRANSIT', 'in_transit'];
const AT_HUB_STATUSES = ['HANDOVER_PENDING', 'received_at_hub', 'AT_HUB'];
const AT_AGENT_STATUSES = ['RECEIVED_BY_AGENT', 'arrived_at_village_hub', 'AT_VILLAGE_AGENT'];
const OUT_FOR_DELIVERY_STATUSES = ['OUT_FOR_DELIVERY', 'out_for_delivery'];
const DELIVERED_STATUSES = ['DELIVERED', 'delivered'];
const FAILED_STATUSES = ['FAILED_DELIVERY', 'failed'];
const RETURNED_STATUSES = ['RETURNED', 'returned'];
const CANCELLED_STATUSES = ['CANCELLED', 'cancelled'];

/**
 * 1. GET PARCEL DASHBOARD STATS
 * Real-time operational aggregates & financials
 */
export const getParcelDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalParcels,
      createdToday,
      searchingCount,
      acceptedCount,
      pickupPendingCount,
      pickedUpCount,
      inTransitCount,
      atHubCount,
      atAgentCount,
      outForDeliveryCount,
      deliveredCount,
      deliveredToday,
      failedCount,
      returnedCount,
      cancelledCount,
      disputedCount,
      parcelsRevenueAgg,
      partnerEarningsAgg,
      agentEarningsAgg,
      disputesRefundAgg,
    ] = await Promise.all([
      Parcel.countDocuments(),
      Parcel.countDocuments({ createdAt: { $gte: today } }),
      Parcel.countDocuments({ status: { $in: SEARCHING_STATUSES } }),
      Parcel.countDocuments({ status: { $in: ACCEPTED_STATUSES } }),
      Parcel.countDocuments({ status: { $in: PICKUP_PENDING_STATUSES } }),
      Parcel.countDocuments({ status: { $in: PICKED_UP_STATUSES } }),
      Parcel.countDocuments({ status: { $in: IN_TRANSIT_STATUSES } }),
      Parcel.countDocuments({ status: { $in: AT_HUB_STATUSES } }),
      Parcel.countDocuments({ status: { $in: AT_AGENT_STATUSES } }),
      Parcel.countDocuments({ status: { $in: OUT_FOR_DELIVERY_STATUSES } }),
      Parcel.countDocuments({ status: { $in: DELIVERED_STATUSES } }),
      Parcel.countDocuments({
        status: { $in: DELIVERED_STATUSES },
        updatedAt: { $gte: today },
      }),
      Parcel.countDocuments({ status: { $in: FAILED_STATUSES } }),
      Parcel.countDocuments({ status: { $in: RETURNED_STATUSES } }),
      Parcel.countDocuments({ status: { $in: CANCELLED_STATUSES } }),
      ParcelDispute.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } }),

      // Total Parcel Revenue
      Parcel.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$customerOfferPrice' },
            avgOffer: { $avg: '$customerOfferPrice' },
          },
        },
      ]),

      // Partner Earnings
      Earning.aggregate([
        { $match: { actorType: 'PARTNER' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } },
      ]),

      // Agent Earnings
      Earning.aggregate([
        { $match: { actorType: 'AGENT' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } },
      ]),

      // Refunds in disputes
      ParcelDispute.aggregate([
        { $match: { status: 'RESOLVED', refundApprovedAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$refundApprovedAmount' } } },
      ]),
    ]);

    const totalRevenue = parcelsRevenueAgg[0]?.totalRevenue || 0;
    const realPartnerEarnings = partnerEarningsAgg[0]?.total || 0;
    const realAgentEarnings = agentEarningsAgg[0]?.total || 0;
    const totalRefunds = disputesRefundAgg[0]?.total || 0;

    // Derived operational financials
    const partnerEarnings = realPartnerEarnings > 0 ? realPartnerEarnings : Math.round(totalRevenue * 0.6);
    const agentEarnings = realAgentEarnings > 0 ? realAgentEarnings : Math.round(totalRevenue * 0.2);
    const platformRevenue = Math.max(0, totalRevenue - partnerEarnings - agentEarnings);
    const deliveryCharges = Math.round(totalRevenue * 0.85);

    // Alerts queries
    const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [unassignedAlerts, delayedPickupAlerts, overdueTransitAlerts, highValueInTransit] =
      await Promise.all([
        Parcel.countDocuments({
          status: { $in: SEARCHING_STATUSES },
          createdAt: { $lt: halfHourAgo },
        }),
        Parcel.countDocuments({
          status: { $in: PICKUP_PENDING_STATUSES },
          updatedAt: { $lt: twoHoursAgo },
        }),
        Parcel.countDocuments({
          status: { $in: IN_TRANSIT_STATUSES },
          updatedAt: { $lt: twentyFourHoursAgo },
        }),
        Parcel.countDocuments({
          status: { $in: [...PICKED_UP_STATUSES, ...IN_TRANSIT_STATUSES, ...OUT_FOR_DELIVERY_STATUSES] },
          approximateValue: { $gte: 5000 },
        }),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalParcels,
        createdToday,
        searchingCount,
        acceptedCount,
        pickupPendingCount,
        pickedUpCount,
        inTransitCount,
        atHubCount,
        atAgentCount,
        outForDeliveryCount,
        deliveredCount,
        deliveredToday,
        failedCount,
        returnedCount,
        cancelledCount,
        disputedCount,

        // Financials
        financials: {
          totalRevenue,
          deliveryCharges,
          partnerEarnings,
          agentEarnings,
          platformRevenue,
          pendingPayments: Math.round(totalRevenue * 0.15),
          totalRefunds,
        },

        // Operational Alerts
        alerts: {
          unassignedOver30Mins: unassignedAlerts,
          delayedPickupOver2Hrs: delayedPickupAlerts,
          overdueTransitOver24Hrs: overdueTransitAlerts,
          highValueInTransit,
          openDisputes: disputedCount,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. GET ALL PARCELS
 * Complete table listing with advanced query filters & pagination
 */
export const getAllParcels = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      status,
      category,
      logisticsType,
      partnerId,
      agentId,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query: any = {};

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      query.$or = [
        { parcelId: regex },
        { parcelTrackingNumber: regex },
        { senderName: regex },
        { senderMobile: regex },
        { receiverName: regex },
        { receiverMobile: regex },
        { pickupLocation: regex },
        { deliveryLocation: regex },
        { whatIsInside: regex },
      ];
    }

    // Status filter mapping
    if (status && status !== 'all' && status !== 'ALL') {
      const s = (status as string).toLowerCase();
      if (s === 'searching' || s === 'unbooked') {
        query.status = { $in: SEARCHING_STATUSES };
      } else if (s === 'accepted' || s === 'partner_accepted') {
        query.status = { $in: ACCEPTED_STATUSES };
      } else if (s === 'pickup_pending' || s === 'pickup-pending' || s === 'ready_for_pickup') {
        query.status = { $in: PICKUP_PENDING_STATUSES };
      } else if (s === 'picked_up' || s === 'picked-up') {
        query.status = { $in: PICKED_UP_STATUSES };
      } else if (s === 'in_transit' || s === 'in-transit') {
        query.status = { $in: IN_TRANSIT_STATUSES };
      } else if (s === 'at_hub' || s === 'at-hub') {
        query.status = { $in: AT_HUB_STATUSES };
      } else if (s === 'at_agent' || s === 'at-agent') {
        query.status = { $in: AT_AGENT_STATUSES };
      } else if (s === 'out_for_delivery' || s === 'out-for-delivery') {
        query.status = { $in: OUT_FOR_DELIVERY_STATUSES };
      } else if (s === 'delivered') {
        query.status = { $in: DELIVERED_STATUSES };
      } else if (s === 'failed') {
        query.status = { $in: FAILED_STATUSES };
      } else if (s === 'returned') {
        query.status = { $in: RETURNED_STATUSES };
      } else if (s === 'cancelled') {
        query.status = { $in: CANCELLED_STATUSES };
      } else {
        query.status = status;
      }
    }

    // Category filter
    if (category && category !== 'all') {
      query.parcelCategory = new RegExp(category as string, 'i');
    }

    // Logistics Type
    if (logisticsType && logisticsType !== 'all') {
      query.preferredLogisticsType = new RegExp(logisticsType as string, 'i');
    }

    // Partner/Agent filters
    if (partnerId) query.currentPartnerId = partnerId;
    if (agentId) query.currentAgentId = agentId;

    // Date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.customerOfferPrice = {};
      if (minPrice) query.customerOfferPrice.$gte = Number(minPrice);
      if (maxPrice) query.customerOfferPrice.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    sortOption[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [total, parcels] = await Promise.all([
      Parcel.countDocuments(query),
      Parcel.find(query)
        .populate('senderUserId', 'name phone email')
        .populate({
          path: 'currentPartnerId',
          populate: { path: 'userId', select: 'name phone email' },
        })
        .populate({
          path: 'currentAgentId',
          populate: { path: 'userId', select: 'name phone email' },
        })
        .populate('currentVehicleId')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.status(200).json({
      success: true,
      parcels,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. GET PARCEL BY ID - 360° Operations Dossier
 */
export const getParcelById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const parcel = isMongoId
      ? await Parcel.findById(id)
          .populate('senderUserId', 'name phone email avatar address defaultLocation')
          .populate({
            path: 'currentPartnerId',
            populate: { path: 'userId', select: 'name phone email avatar' },
          })
          .populate({
            path: 'currentAgentId',
            populate: { path: 'userId', select: 'name phone email avatar' },
          })
          .populate('currentVehicleId')
      : await Parcel.findOne({
          $or: [{ parcelId: id }, { parcelTrackingNumber: id }],
        })
          .populate('senderUserId', 'name phone email avatar address defaultLocation')
          .populate({
            path: 'currentPartnerId',
            populate: { path: 'userId', select: 'name phone email avatar' },
          })
          .populate({
            path: 'currentAgentId',
            populate: { path: 'userId', select: 'name phone email avatar' },
          })
          .populate('currentVehicleId');

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    // Parallel load of all related operational data
    const [events, legs, handovers, earnings, payments, disputes, auditLogs] = await Promise.all([
      ParcelEvent.find({ parcelId: parcel._id }).sort({ timestamp: -1 }),
      ShipmentLeg.find({ parcelId: parcel._id })
        .populate('assignedToUserId', 'name phone role')
        .sort({ sequence: 1 }),
      HandoverRecord.find({ parcelId: parcel._id })
        .populate('fromActorId', 'name phone role')
        .populate('toActorId', 'name phone role')
        .sort({ verifiedAt: -1 }),
      Earning.find({
        referenceId: { $in: [parcel._id.toString(), parcel.parcelId, parcel.parcelTrackingNumber] },
      }).populate('actorId', 'name phone role'),
      Payment.find({
        $or: [
          { orderId: parcel.orderId },
          { 'metadata.parcelId': parcel.parcelId },
          { 'metadata.parcelTrackingNumber': parcel.parcelTrackingNumber },
        ],
      }),
      ParcelDispute.find({ parcelId: parcel._id })
        .populate('raisedByUserId', 'name phone email')
        .populate('resolvedByUserId', 'name phone email')
        .sort({ createdAt: -1 }),
      AdminAuditLog.find({
        targetId: { $in: [parcel._id.toString(), parcel.parcelId] },
        targetType: 'PARCEL',
      })
        .populate('adminId', 'name email phone')
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      parcel,
      events,
      legs,
      handovers,
      earnings,
      payments,
      disputes,
      auditLogs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. AUTOMATED PARTNER MATCHING ALGORITHM
 * Evaluates active partners by location, vehicle capacity, transport type, and route
 */
export const findMatchingPartnersForParcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const parcelWeight = parcel.weightKg || 1;
    const preferredType = (parcel.preferredLogisticsType || 'Bike').toLowerCase();
    const pickupLoc = (parcel.pickupLocation || '').toLowerCase();
    const pickupDistrict = (parcel.senderLocation?.district || '').toLowerCase();

    // Query active verified partners
    const partners = await LogisticsPartner.find({ isActive: true })
      .populate('userId', 'name phone email avatar rating')
      .populate('vehicleIds');

    const rankedMatches = [];

    for (const partner of partners) {
      const vehicles: any[] = partner.vehicleIds || [];
      // Pick best vehicle or any vehicle
      let bestVehicle = vehicles.find((v) => (v.maxCapacityKg || 0) >= parcelWeight) || vehicles[0];

      let matchScore = 50; // Base score
      const matchReasons: string[] = [];

      // 1. Online status bonus
      if (partner.isOnline) {
        matchScore += 15;
        matchReasons.push('Partner is Online');
      }

      // 2. Verified bonus
      if (partner.isVerified) {
        matchScore += 10;
        matchReasons.push('Verified Transporter');
      }

      // 3. Service Area / District matching
      const serviceAreas = (partner.serviceAreas || []).map((a) => a.toLowerCase());
      const areaMatch =
        serviceAreas.some((a) => pickupLoc.includes(a) || a.includes(pickupLoc)) ||
        (pickupDistrict && serviceAreas.some((a) => pickupDistrict.includes(a) || a.includes(pickupDistrict)));

      if (areaMatch) {
        matchScore += 15;
        matchReasons.push('Service Area matches Pickup location');
      }

      // 4. Vehicle Capacity & Type
      if (bestVehicle) {
        if (bestVehicle.maxCapacityKg >= parcelWeight) {
          matchScore += 10;
          matchReasons.push(`Vehicle capacity (${bestVehicle.maxCapacityKg}kg) sufficient`);
        }
        if (bestVehicle.vehicleType && bestVehicle.vehicleType.toLowerCase().includes(preferredType)) {
          matchScore += 10;
          matchReasons.push(`Matches requested vehicle type (${bestVehicle.vehicleType})`);
        }
      }

      // 5. Rating bonus
      if (partner.rating >= 4.5) {
        matchScore += 5;
      }

      // Cap at 99%
      matchScore = Math.min(99, Math.max(30, matchScore));

      rankedMatches.push({
        partnerId: partner._id,
        businessName: partner.businessName,
        partnerType: partner.partnerType,
        rating: partner.rating || 4.8,
        totalTrips: partner.totalTrips || 0,
        user: partner.userId,
        vehicle: bestVehicle
          ? {
              _id: bestVehicle._id,
              vehicleType: bestVehicle.vehicleType,
              modelName: bestVehicle.modelName,
              registrationNumber: bestVehicle.registrationNumber,
              maxCapacityKg: bestVehicle.maxCapacityKg,
            }
          : null,
        isOnline: partner.isOnline,
        isVerified: partner.isVerified,
        matchScore,
        matchReasons,
        estimatedArrivalMins: Math.floor(15 + Math.random() * 25),
      });
    }

    // Sort descending by match score
    rankedMatches.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      parcelId: parcel.parcelId,
      weightKg: parcel.weightKg,
      preferredLogisticsType: parcel.preferredLogisticsType,
      matches: rankedMatches,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. ASSIGN OR REASSIGN PARTNER
 */
export const assignPartnerToParcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { partnerId, vehicleId, note } = req.body;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: 'Partner ID is required.' });
    }

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const partner = await LogisticsPartner.findById(partnerId).populate('userId', 'name phone');
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Logistics Partner not found.' });
    }

    const previousPartnerId = parcel.currentPartnerId;
    parcel.currentPartnerId = partner._id as any;
    if (vehicleId) {
      parcel.currentVehicleId = vehicleId;
    } else if (partner.vehicleIds && partner.vehicleIds.length > 0) {
      parcel.currentVehicleId = partner.vehicleIds[0] as any;
    }

    // Update status to PARTNER_ACCEPTED / PICKUP_PENDING
    parcel.status = 'PARTNER_ACCEPTED';
    await parcel.save();

    // Update first shipment leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, sequence: 1 },
      {
        assignedToUserId: (partner.userId as any)?._id || (partner.userId as any),
        status: 'in_progress',
        notes: note || `Partner ${partner.businessName} manually assigned by Admin`,
      }
    );

    // Create tracking event
    const event = await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'READY_FOR_PICKUP',
      locationName: parcel.pickupLocation,
      description: `Partner "${partner.businessName}" (${(partner.userId as any)?.phone || ''}) assigned by Admin. Ready for pickup.`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    // Record Admin Audit Log
    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: previousPartnerId ? 'REASSIGN_PARTNER' : 'ASSIGN_PARTNER',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: note || 'Partner assigned via admin operations console',
      details: {
        partnerId: partner._id,
        partnerName: partner.businessName,
        previousPartnerId,
        vehicleId: parcel.currentVehicleId,
      },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });
    emitToParcel(parcel.parcelTrackingNumber, 'partner_assigned', { type: 'PARTNER_ASSIGNED', partnerName: partner.businessName });

    return res.status(200).json({
      success: true,
      message: `Partner ${partner.businessName} assigned successfully.`,
      parcel,
      event,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. ASSIGN OR REASSIGN VILLAGE AGENT
 */
export const assignAgentToParcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId, note } = req.body;

    if (!agentId) {
      return res.status(400).json({ success: false, message: 'Agent ID is required.' });
    }

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const agent = await VillageAgent.findById(agentId).populate('userId', 'name phone');
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Village Agent not found.' });
    }

    const previousAgentId = parcel.currentAgentId;
    parcel.currentAgentId = agent._id as any;
    parcel.agentId = agent._id as any;
    parcel.agentSelected = true;
    if (!parcel.agentCode || parcel.agentCode.length < 4) {
      parcel.agentCode = Math.floor(1000 + Math.random() * 9000).toString();
      parcel.handoverCode = parcel.agentCode;
    }
    if (!parcel.verificationCodes) {
      parcel.verificationCodes = {
        pickup: { code: parcel.pickupCode || '1234', status: 'PENDING' },
        agentHandover: { code: parcel.agentCode, status: 'PENDING' },
        agent: { code: parcel.agentCode, status: 'PENDING' },
        delivery: { code: parcel.deliveryPin || '5678', status: 'PENDING' },
      };
    } else {
      if (!parcel.verificationCodes.agentHandover) {
        parcel.verificationCodes.agentHandover = { code: parcel.agentCode, status: 'PENDING' };
      } else {
        parcel.verificationCodes.agentHandover.code = parcel.agentCode;
      }
      if (!parcel.verificationCodes.agent) {
        parcel.verificationCodes.agent = { code: parcel.agentCode, status: 'PENDING' };
      } else {
        parcel.verificationCodes.agent.code = parcel.agentCode;
      }
    }
    await parcel.save();

    // Update last-mile shipment leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, legType: 'LAST_MILE_VILLAGE_DELIVERY' },
      {
        assignedToUserId: (agent.userId as any)?._id || (agent.userId as any),
        notes: note || `Assigned to Village Agent Hub: ${agent.villageName}`,
      }
    );

    // Create tracking event
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'ARRIVED_AT_VILLAGE_HUB',
      locationName: agent.villageName,
      description: `Assigned to Village Agent "${agent.villageName}" (${agent.hubCode}) by Admin.`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    // Record Audit Log
    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: previousAgentId ? 'REASSIGN_AGENT' : 'ASSIGN_AGENT',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: note || 'Village Agent assigned via admin console',
      details: {
        agentId: agent._id,
        hubCode: agent.hubCode,
        villageName: agent.villageName,
        previousAgentId,
      },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, agentId: agent._id });
    emitToAll('parcel:new_request', { parcel });

    return res.status(200).json({
      success: true,
      message: `Village Agent ${agent.villageName} (${agent.hubCode}) assigned successfully.`,
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. ADMIN VERIFY PICKUP (Bypass or Code Confirmation)
 */
export const adminVerifyPickup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { bypassCode, codeEntered, notes } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (!bypassCode && codeEntered && codeEntered !== parcel.pickupCode) {
      return res.status(400).json({ success: false, message: 'Invalid pickup verification code.' });
    }

    parcel.status = 'IN_TRANSIT';
    parcel.currentLegIndex = 1;
    await parcel.save();

    // Complete first leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, sequence: 1 },
      { status: 'completed', completedAt: new Date() }
    );
    // Start mid-mile leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, sequence: 2 },
      { status: 'in_progress', startedAt: new Date() }
    );

    // Event & Audit Log
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'PICKED_UP',
      locationName: parcel.pickupLocation,
      description: `Pickup verified by Admin (${req.user?.name || 'Admin'}). Parcel is now In Transit.`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'ADMIN_VERIFY_PICKUP',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: notes || 'Admin verified pickup',
      details: { bypassCode: !!bypassCode },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });

    return res.status(200).json({
      success: true,
      message: 'Pickup verified successfully. Parcel transitioned to In Transit.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. ADMIN VERIFY HANDOVER (Partner to Agent or Hub)
 */
export const adminVerifyHandover = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { bypassCode, codeEntered, notes } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (!bypassCode && codeEntered && codeEntered !== parcel.handoverCode) {
      return res.status(400).json({ success: false, message: 'Invalid handover verification code.' });
    }

    parcel.status = 'RECEIVED_BY_AGENT';
    parcel.currentLegIndex = 2;
    await parcel.save();

    // Complete mid-mile leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, sequence: 2 },
      { status: 'completed', completedAt: new Date() }
    );
    // Start last-mile leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, sequence: 3 },
      { status: 'in_progress', startedAt: new Date() }
    );

    // Record Handover
    await HandoverRecord.create({
      parcelId: parcel._id,
      fromActorType: 'PARTNER',
      fromActorId: req.user?._id,
      toActorType: 'AGENT',
      toActorId: req.user?._id,
      handoverCodeUsed: parcel.handoverCode,
      verifiedAt: new Date(),
      locationName: parcel.deliveryLocation,
      notes: notes || 'Admin confirmed handover to Village Hub',
    });

    // Tracking Event
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'ARRIVED_AT_VILLAGE_HUB',
      locationName: parcel.deliveryLocation,
      description: `Handover verified by Admin. Parcel received at Village Agent Hub.`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    // Audit Log
    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'ADMIN_VERIFY_HANDOVER',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: notes || 'Handover verified by admin',
      details: { bypassCode: !!bypassCode },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });

    return res.status(200).json({
      success: true,
      message: 'Handover verified successfully. Parcel received by Village Agent.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. ADMIN VERIFY FINAL DELIVERY
 */
export const adminVerifyDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { bypassPin, pinEntered, notes } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (!bypassPin && pinEntered && pinEntered !== parcel.deliveryPin) {
      return res.status(400).json({ success: false, message: 'Invalid delivery PIN.' });
    }

    parcel.status = 'DELIVERED';
    await parcel.save();

    // Complete all legs
    await ShipmentLeg.updateMany({ parcelId: parcel._id }, { status: 'completed', completedAt: new Date() });

    // Credit Partner Earnings if partner assigned
    if (parcel.currentPartnerId) {
      const partner = await LogisticsPartner.findById(parcel.currentPartnerId);
      if (partner?.userId) {
        await EarningsService.creditPartnerEarnings(
          partner.userId.toString(),
          parcel.parcelId,
          15,
          40,
          12
        ).catch(() => null);
      }
    }

    // Credit Agent Earnings if agent assigned
    if (parcel.currentAgentId) {
      const agent = await VillageAgent.findById(parcel.currentAgentId);
      if (agent?.userId) {
        await EarningsService.creditAgentEarnings(
          agent.userId.toString(),
          parcel.parcelId,
          agent.commissionPerDelivery || 30
        ).catch(() => null);
      }
    }

    // Event & Audit Log
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'DELIVERED',
      locationName: parcel.deliveryLocation,
      description: `Delivery verified by Admin (${req.user?.name || 'Admin'}). Final delivery completed.`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'ADMIN_VERIFY_DELIVERY',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: notes || 'Admin verified final delivery',
      details: { bypassPin: !!bypassPin },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });

    return res.status(200).json({
      success: true,
      message: 'Delivery verified successfully. Earnings distributed.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. ADMIN LOG FAILED DELIVERY
 */
export const adminFailDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes, rescheduleDate } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    parcel.status = 'FAILED_DELIVERY';
    await parcel.save();

    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'EXCEPTION',
      locationName: parcel.deliveryLocation,
      description: `Delivery attempt failed: ${reason || 'Customer unavailable'}. ${notes || ''}`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'MARK_DELIVERY_FAILED',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: reason || 'Delivery failed',
      details: { notes, rescheduleDate },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });

    return res.status(200).json({
      success: true,
      message: 'Parcel marked as delivery failed.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 11. INITIATE RETURN TO SENDER
 */
export const adminInitiateReturn = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { returnReason, returnPartnerId, notes } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    parcel.status = 'RETURNED';
    if (returnPartnerId) {
      parcel.currentPartnerId = returnPartnerId;
    }
    await parcel.save();

    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'EXCEPTION',
      locationName: parcel.deliveryLocation,
      description: `Return initiated to sender (${parcel.senderName}). Reason: ${returnReason || 'Customer rejected'}. ${notes || ''}`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'INITIATE_RETURN',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: returnReason || 'Return initiated',
      details: { returnPartnerId, notes },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });

    return res.status(200).json({
      success: true,
      message: 'Parcel return initiated successfully.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 12. ADMIN CANCEL PARCEL & PROCESS REFUND
 */
export const adminCancelParcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, processRefund, refundAmount } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    parcel.status = 'CANCELLED';
    await parcel.save();

    // Cancel remaining legs
    await ShipmentLeg.updateMany({ parcelId: parcel._id, status: 'pending' }, { status: 'failed' });

    // Tracking Event
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'EXCEPTION',
      locationName: parcel.pickupLocation,
      description: `Parcel cancelled by Admin. Reason: ${reason || 'Cancelled by admin request'}. Refund: ${processRefund ? `₹${refundAmount || parcel.customerOfferPrice}` : 'None'}`,
      actorRole: 'Platform Admin',
      actorId: req.user?._id,
    });

    // Record Audit Log
    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'CANCEL_PARCEL',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: reason || 'Parcel cancelled by admin',
      details: { processRefund: !!processRefund, refundAmount: refundAmount || parcel.customerOfferPrice },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, status: parcel.status });

    return res.status(200).json({
      success: true,
      message: 'Parcel cancelled successfully.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 13. UPDATE PARCEL DETAILS / PRICE OVERRIDE
 */
export const updateParcelDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerOfferPrice,
      preferredLogisticsType,
      senderName,
      senderMobile,
      pickupAddress,
      receiverName,
      receiverMobile,
      deliveryAddress,
      weightKg,
      whatIsInside,
      specialInstructions,
    } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const previousPrice = parcel.customerOfferPrice;

    if (customerOfferPrice !== undefined) parcel.customerOfferPrice = Number(customerOfferPrice);
    if (preferredLogisticsType) parcel.preferredLogisticsType = preferredLogisticsType;
    if (senderName) parcel.senderName = senderName;
    if (senderMobile) parcel.senderMobile = senderMobile;
    if (pickupAddress) parcel.pickupAddress = pickupAddress;
    if (receiverName) parcel.receiverName = receiverName;
    if (receiverMobile) parcel.receiverMobile = receiverMobile;
    if (deliveryAddress) parcel.deliveryAddress = deliveryAddress;
    if (weightKg !== undefined) parcel.weightKg = Number(weightKg);
    if (whatIsInside) parcel.whatIsInside = whatIsInside;
    if (specialInstructions !== undefined) parcel.specialInstructions = specialInstructions;

    await parcel.save();

    // Recalculate estimated leg earnings if price changed
    if (customerOfferPrice !== undefined && Number(customerOfferPrice) !== previousPrice) {
      const newOffer = Number(customerOfferPrice);
      await ShipmentLeg.findOneAndUpdate(
        { parcelId: parcel._id, sequence: 1 },
        { estimatedEarnings: Math.round(newOffer * 0.4) }
      );
      await ShipmentLeg.findOneAndUpdate(
        { parcelId: parcel._id, sequence: 2 },
        { estimatedEarnings: Math.round(newOffer * 0.45) }
      );
      await ShipmentLeg.findOneAndUpdate(
        { parcelId: parcel._id, sequence: 3 },
        { estimatedEarnings: Math.max(30, Math.round(newOffer * 0.15)) }
      );
    }

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'UPDATE_PARCEL_DETAILS',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: 'Admin updated parcel specifications or price',
      details: { previousPrice, newPrice: parcel.customerOfferPrice, updates: req.body },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, updated: true });

    return res.status(200).json({
      success: true,
      message: 'Parcel details updated successfully.',
      parcel,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 14. ADMIN DISPUTE MANAGEMENT
 */
export const createOrUpdateDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      disputeId,
      reason,
      description,
      status,
      claimAmount,
      refundApprovedAmount,
      resolutionNotes,
    } = req.body;

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    let dispute;

    if (disputeId) {
      dispute = await ParcelDispute.findById(disputeId);
      if (!dispute) {
        return res.status(404).json({ success: false, message: 'Dispute record not found.' });
      }
      if (status) dispute.status = status;
      if (refundApprovedAmount !== undefined) dispute.refundApprovedAmount = Number(refundApprovedAmount);
      if (resolutionNotes) dispute.resolutionNotes = resolutionNotes;
      if (status === 'RESOLVED' || status === 'REJECTED') {
        dispute.resolvedAt = new Date();
        dispute.resolvedByUserId = req.user?._id as any;
      }
      await dispute.save();
    } else {
      const disputeNumber = 'LH-DSP-' + Math.floor(100000 + Math.random() * 900000);
      dispute = await ParcelDispute.create({
        parcelId: parcel._id,
        disputeNumber,
        raisedByRole: 'ADMIN',
        raisedByUserId: req.user?._id,
        reason: reason || 'OTHER',
        description: description || 'Dispute logged by Platform Admin',
        claimAmount: Number(claimAmount) || parcel.customerOfferPrice,
        status: status || 'OPEN',
      });
    }

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: disputeId ? 'UPDATE_DISPUTE' : 'CREATE_DISPUTE',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: resolutionNotes || description || 'Admin dispute update',
      details: { disputeNumber: dispute.disputeNumber, status: dispute.status },
    });

    return res.status(200).json({
      success: true,
      message: disputeId ? 'Dispute updated successfully.' : 'Dispute logged successfully.',
      dispute,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 15. ADD ADMIN OPERATIONAL AUDIT NOTE
 */
export const addParcelAuditNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Audit note content is required.' });
    }

    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const auditLog = await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'OPERATIONAL_NOTE',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: note.trim(),
      details: { note: note.trim() },
    });

    return res.status(201).json({
      success: true,
      message: 'Operational note added to parcel audit trail.',
      auditLog,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 16. BULK ACTIONS (Assign Partner, Cancel, Export)
 */
export const bulkParcelActions = async (req: AuthRequest, res: Response) => {
  try {
    const { parcelIds, action, partnerId, reason } = req.body;

    if (!parcelIds || !Array.isArray(parcelIds) || parcelIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No parcels selected for bulk action.' });
    }

    const parcels = await Parcel.find({
      $or: [{ _id: { $in: parcelIds } }, { parcelId: { $in: parcelIds } }],
    });

    if (action === 'CANCEL') {
      await Parcel.updateMany(
        { _id: { $in: parcels.map((p) => p._id) } },
        { status: 'CANCELLED' }
      );

      for (const p of parcels) {
        await AdminAuditLog.create({
          adminId: req.user?._id,
          adminName: req.user?.name,
          action: 'BULK_CANCEL',
          targetType: 'PARCEL',
          targetId: p._id.toString(),
          reason: reason || 'Bulk cancellation from admin console',
        });
      }

      emitToAll('admin:parcel_update', { count: parcels.length, action: 'BULK_CANCEL' });

      return res.status(200).json({
        success: true,
        message: `${parcels.length} parcels cancelled successfully.`,
      });
    }

    if (action === 'ASSIGN_PARTNER') {
      if (!partnerId) {
        return res.status(400).json({ success: false, message: 'Partner ID is required for bulk assignment.' });
      }

      const partner = await LogisticsPartner.findById(partnerId);
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Logistics Partner not found.' });
      }

      await Parcel.updateMany(
        { _id: { $in: parcels.map((p) => p._id) } },
        {
          currentPartnerId: partner._id,
          status: 'PARTNER_ACCEPTED',
          currentVehicleId: partner.vehicleIds?.[0] || undefined,
        }
      );

      emitToAll('admin:parcel_update', { count: parcels.length, action: 'BULK_ASSIGN' });

      return res.status(200).json({
        success: true,
        message: `${parcels.length} parcels assigned to ${partner.businessName}.`,
      });
    }

    if (action === 'DELETE') {
      const ids = parcels.map((p) => p._id);
      await Promise.all([
        Parcel.deleteMany({ _id: { $in: ids } }),
        ParcelEvent.deleteMany({ parcelId: { $in: ids } }),
        ShipmentLeg.deleteMany({ parcelId: { $in: ids } }),
        HandoverRecord.deleteMany({ parcelId: { $in: ids } }),
        ParcelDispute.deleteMany({ parcelId: { $in: ids } }),
      ]);

      for (const p of parcels) {
        await AdminAuditLog.create({
          adminId: req.user?._id,
          adminName: req.user?.name,
          action: 'BULK_DELETE_PARCELS',
          targetType: 'PARCEL',
          targetId: p._id.toString(),
          reason: reason || 'Bulk deletion from admin console',
        });
      }

      emitToAll('admin:parcel_update', { count: parcels.length, action: 'BULK_DELETE' });

      return res.status(200).json({
        success: true,
        message: `${parcels.length} parcels deleted successfully.`,
      });
    }

    return res.status(400).json({ success: false, message: `Unknown bulk action: ${action}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 16b. DELETE SINGLE PARCEL BY ID
 */
export const deleteParcelById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parcel = mongoose.Types.ObjectId.isValid(id)
      ? await Parcel.findById(id)
      : await Parcel.findOne({ parcelId: id });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const parcelMongoId = parcel._id;
    await Promise.all([
      Parcel.findByIdAndDelete(parcelMongoId),
      ParcelEvent.deleteMany({ parcelId: parcelMongoId }),
      ShipmentLeg.deleteMany({ parcelId: parcelMongoId }),
      HandoverRecord.deleteMany({ parcelId: parcelMongoId }),
      ParcelDispute.deleteMany({ parcelId: parcelMongoId }),
    ]);

    await AdminAuditLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'DELETE_PARCEL',
      targetType: 'PARCEL',
      targetId: parcelMongoId.toString(),
      reason: req.body?.reason || 'Parcel deleted via admin operations console',
      details: { parcelId: parcel.parcelId },
    });

    emitToAll('admin:parcel_update', { parcelId: parcel.parcelId, action: 'DELETE' });

    return res.status(200).json({
      success: true,
      message: `Parcel ${parcel.parcelId} deleted successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 16c. BULK DELETE PARCELS
 */
export const bulkDeleteParcels = async (req: AuthRequest, res: Response) => {
  try {
    const { parcelIds, reason } = req.body;
    if (!parcelIds || !Array.isArray(parcelIds) || parcelIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No parcels selected for bulk deletion.' });
    }

    const parcels = await Parcel.find({
      $or: [{ _id: { $in: parcelIds } }, { parcelId: { $in: parcelIds } }],
    });

    const ids = parcels.map((p) => p._id);
    await Promise.all([
      Parcel.deleteMany({ _id: { $in: ids } }),
      ParcelEvent.deleteMany({ parcelId: { $in: ids } }),
      ShipmentLeg.deleteMany({ parcelId: { $in: ids } }),
      HandoverRecord.deleteMany({ parcelId: { $in: ids } }),
      ParcelDispute.deleteMany({ parcelId: { $in: ids } }),
    ]);

    for (const p of parcels) {
      await AdminAuditLog.create({
        adminId: req.user?._id,
        adminName: req.user?.name,
        action: 'BULK_DELETE_PARCELS',
        targetType: 'PARCEL',
        targetId: p._id.toString(),
        reason: reason || 'Bulk deletion from admin console',
      });
    }

    emitToAll('admin:parcel_update', { count: parcels.length, action: 'BULK_DELETE' });

    return res.status(200).json({
      success: true,
      message: `${parcels.length} parcels permanently deleted.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 17. EXPORT PARCELS TO CSV
 */
export const exportParcelsCsv = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { parcelId: regex },
        { parcelTrackingNumber: regex },
        { senderName: regex },
        { receiverName: regex },
      ];
    }

    const parcels = await Parcel.find(query)
      .populate('currentPartnerId', 'businessName')
      .populate('currentAgentId', 'villageName hubCode')
      .sort({ createdAt: -1 })
      .limit(2000);

    const headers = [
      'Parcel ID',
      'Tracking Number',
      'Sender Name',
      'Sender Mobile',
      'Pickup Location',
      'Receiver Name',
      'Receiver Mobile',
      'Delivery Location',
      'Category',
      'What Is Inside',
      'Weight (KG)',
      'Customer Offer (INR)',
      'Status',
      'Logistics Partner',
      'Village Agent',
      'Pickup Code',
      'Delivery PIN',
      'Created Date',
    ];

    const escapeCsv = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;

    const rows = parcels.map((p: any) => [
      escapeCsv(p.parcelId),
      escapeCsv(p.parcelTrackingNumber),
      escapeCsv(p.senderName),
      escapeCsv(p.senderMobile),
      escapeCsv(p.pickupLocation),
      escapeCsv(p.receiverName),
      escapeCsv(p.receiverMobile),
      escapeCsv(p.deliveryLocation),
      escapeCsv(p.parcelCategory),
      escapeCsv(p.whatIsInside),
      p.weightKg || 1,
      p.customerOfferPrice || 0,
      escapeCsv(p.status),
      escapeCsv(p.currentPartnerId?.businessName || 'Unassigned'),
      escapeCsv(p.currentAgentId?.villageName ? `${p.currentAgentId.villageName} (${p.currentAgentId.hubCode})` : 'Unassigned'),
      escapeCsv(p.pickupCode),
      escapeCsv(p.deliveryPin),
      escapeCsv(new Date(p.createdAt).toISOString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=localhaat_parcels_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 18. PARCEL ANALYTICS & PERFORMANCE
 */
export const getParcelAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [statusBreakdown, dailyTrends, categoryBreakdown, topPartners] = await Promise.all([
      // Status breakdown
      Parcel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$customerOfferPrice' } } },
      ]),

      // Daily trends
      Parcel.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            parcelsCount: { $sum: 1 },
            volumeInr: { $sum: '$customerOfferPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Category breakdown
      Parcel.aggregate([
        { $group: { _id: '$parcelCategory', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Top logistics partners by parcel assignment
      Parcel.aggregate([
        { $match: { currentPartnerId: { $ne: null } } },
        { $group: { _id: '$currentPartnerId', assignedCount: { $sum: 1 } } },
        { $sort: { assignedCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'logisticspartners',
            localField: '_id',
            foreignField: '_id',
            as: 'partner',
          },
        },
        { $unwind: '$partner' },
        {
          $project: {
            businessName: '$partner.businessName',
            rating: '$partner.rating',
            assignedCount: 1,
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        statusBreakdown,
        dailyTrends,
        categoryBreakdown,
        topPartners,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
