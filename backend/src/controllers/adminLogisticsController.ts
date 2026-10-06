import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import {
  LogisticsPartner,
  Vehicle,
  PartnerRoute,
  LogisticsTrip,
  LogisticsComplaint,
  LogisticsActivity,
  Parcel,
  ParcelEvent,
  ShipmentLeg,
  HandoverRecord,
  User,
  Earning,
  Payout,
  AdminAuditLog,
  ParcelAssignment,
} from '../models/index.js';
import { emitToAll } from '../services/socketService.js';

/**
 * Helper to record immutable admin audit log
 */
const recordAdminAudit = async (
  adminUser: any,
  action: string,
  targetId: string,
  targetName: string,
  details: string,
  metadata?: any
) => {
  try {
    await AdminAuditLog.create({
      adminId: adminUser._id,
      adminName: adminUser.name || 'Admin Operator',
      adminPhone: adminUser.phone || '9999900001',
      targetType: 'LOGISTICS',
      targetId: new mongoose.Types.ObjectId(targetId),
      targetName,
      action,
      details,
      metadata: metadata || {},
    });
  } catch (err) {
    console.error('[AdminAuditLog] Failed to record logistics audit:', err);
  }
};

/**
 * Helper to parse time string like "08:00 AM", "8:50 AM", "14:30", "2:00 PM" into minutes from 00:00.
 */
export const parseTimeToMinutes = (timeStr?: string): number | null => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

/**
 * Validate trip stops and timings according to Section 19:
 * 1. Start location exists
 * 2. Final destination exists
 * 3. Stop order is unique & sequential
 * 4. Stop times logically ordered
 * 5. Departure cannot be before arrival at any stop
 * 6. Later stop cannot have earlier arrival time
 * 7. Final arrival must be after previous stop
 * 8. Travel date must be valid
 */
export const validateTripStops = (tripData: {
  travelDate?: string;
  startLocation?: any;
  finalDestination?: any;
  stops?: any[];
}): { isValid: boolean; error?: string } => {
  if (!tripData.travelDate || !tripData.travelDate.trim()) {
    return { isValid: false, error: 'Travel Date is required for the scheduled trip.' };
  }

  const startName = tripData.startLocation?.name || tripData.startLocation?.villageOrCity;
  const startTime = tripData.startLocation?.departureTime;
  if (!startName || !startName.trim()) {
    return { isValid: false, error: 'Start Location is required.' };
  }
  if (!startTime || !startTime.trim()) {
    return { isValid: false, error: 'Start Departure Time is required.' };
  }

  const finalName = tripData.finalDestination?.name || tripData.finalDestination?.villageOrCity;
  const finalTime = tripData.finalDestination?.expectedArrival;
  if (!finalName || !finalName.trim()) {
    return { isValid: false, error: 'Final Destination is required.' };
  }
  if (!finalTime || !finalTime.trim()) {
    return { isValid: false, error: 'Expected Final Arrival Time is required.' };
  }

  const startMins = parseTimeToMinutes(startTime);
  const finalMins = parseTimeToMinutes(finalTime);

  if (startMins !== null && finalMins !== null && finalMins <= startMins) {
    return {
      isValid: false,
      error: `Final arrival time (${finalTime}) cannot be earlier than or equal to start departure time (${startTime}).`,
    };
  }

  const stops = tripData.stops || [];
  let prevDepartureMins = startMins;
  let prevStopName = startName;
  const seenOrders = new Set<number>();

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const stopName = stop.name || stop.villageOrCity;
    if (!stopName || !stopName.trim()) {
      return { isValid: false, error: `Stop #${i + 1} is missing a stop name.` };
    }

    if (!stop.expectedArrival || !stop.expectedArrival.trim()) {
      return { isValid: false, error: `Stop "${stopName}" requires an Expected Arrival time.` };
    }
    if (!stop.expectedDeparture || !stop.expectedDeparture.trim()) {
      return { isValid: false, error: `Stop "${stopName}" requires an Expected Departure time.` };
    }

    const arrMins = parseTimeToMinutes(stop.expectedArrival);
    const depMins = parseTimeToMinutes(stop.expectedDeparture);

    if (arrMins === null || depMins === null) {
      return { isValid: false, error: `Invalid time format for stop "${stopName}". Please use HH:MM AM/PM format.` };
    }

    if (depMins < arrMins) {
      return {
        isValid: false,
        error: `Invalid timing at stop "${stopName}": Expected Departure (${stop.expectedDeparture}) cannot be before Expected Arrival (${stop.expectedArrival}).`,
      };
    }

    if (prevDepartureMins !== null && arrMins < prevDepartureMins) {
      return {
        isValid: false,
        error: `Chronological ordering violation: Stop "${stopName}" arrival (${stop.expectedArrival}) cannot be earlier than previous stop "${prevStopName}" departure (${stops[i - 1]?.expectedDeparture || startTime}).`,
      };
    }

    const order = stop.stopOrder || i + 1;
    if (seenOrders.has(order)) {
      return { isValid: false, error: `Duplicate stop order ${order} detected for stop "${stopName}".` };
    }
    seenOrders.add(order);

    prevDepartureMins = depMins;
    prevStopName = stopName;
  }

  if (stops.length > 0 && prevDepartureMins !== null && finalMins !== null && finalMins < prevDepartureMins) {
    return {
      isValid: false,
      error: `Final arrival time (${finalTime}) must be after the last stop "${prevStopName}" departure (${stops[stops.length - 1].expectedDeparture}).`,
    };
  }

  return { isValid: true };
};

export const normalizeLocStr = (s?: string): string => {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
};

export const isLocationMatch = (loc1?: string, loc2?: string): boolean => {
  if (!loc1 || !loc2) return false;
  const n1 = normalizeLocStr(loc1);
  const n2 = normalizeLocStr(loc2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const words1 = n1.split(' ').filter((w) => w.length > 2 && !['near', 'chowk', 'market', 'road', 'village', 'depot', 'hub', 'point'].includes(w));
  const words2 = n2.split(' ').filter((w) => w.length > 2 && !['near', 'chowk', 'market', 'road', 'village', 'depot', 'hub', 'point'].includes(w));
  return words1.some((w) => words2.includes(w));
};

/**
 * 1. LOGISTICS DASHBOARD OVERVIEW & STATISTICS
 * Returns real database statistics for partners, parcels, and financials.
 */
export const getLogisticsDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Top Partner Statistics
    const [
      totalPartners,
      verifiedPartners,
      pendingVerification,
      onlinePartners,
      currentlyMoving,
      availablePartners,
      onDelivery,
      offlinePartners,
      suspendedPartners,
      blockedPartners,
    ] = await Promise.all([
      LogisticsPartner.countDocuments(),
      LogisticsPartner.countDocuments({ verificationStatus: 'VERIFIED' }),
      LogisticsPartner.countDocuments({ verificationStatus: 'PENDING' }),
      LogisticsPartner.countDocuments({ isOnline: true, isActive: true }),
      LogisticsPartner.countDocuments({ partnerStatus: 'MOVING' }),
      LogisticsPartner.countDocuments({ partnerStatus: 'AVAILABLE' }),
      LogisticsPartner.countDocuments({ partnerStatus: 'ON_DELIVERY' }),
      LogisticsPartner.countDocuments({ isOnline: false }),
      LogisticsPartner.countDocuments({ verificationStatus: 'SUSPENDED' }),
      LogisticsPartner.countDocuments({ verificationStatus: 'BLOCKED' }),
    ]);

    // 2. Live Parcel Statistics
    const [
      parcelsSearching,
      parcelsAssigned,
      parcelsPickupPending,
      parcelsPickedUp,
      parcelsMoving,
      parcelsAtHub,
      parcelsAwaitingHandover,
      parcelsWithAgent,
      parcelsOutForDelivery,
      parcelsDelivered,
      parcelsFailed,
      parcelsReturned,
    ] = await Promise.all([
      Parcel.countDocuments({ status: { $in: ['SEARCHING_FOR_PARTNER', 'CREATED', 'created'] } }),
      Parcel.countDocuments({ status: 'PARTNER_ACCEPTED' }),
      Parcel.countDocuments({ status: { $in: ['PICKUP_PENDING', 'ready_for_pickup'] } }),
      Parcel.countDocuments({ status: { $in: ['PICKED_UP', 'picked_up'] } }),
      Parcel.countDocuments({ status: { $in: ['IN_TRANSIT', 'in_transit'] } }),
      Parcel.countDocuments({ status: { $in: ['AT_HUB', 'arrived_at_village_hub'] } }),
      Parcel.countDocuments({ status: 'HANDOVER_PENDING' }),
      Parcel.countDocuments({ status: 'RECEIVED_BY_AGENT' }),
      Parcel.countDocuments({ status: { $in: ['OUT_FOR_DELIVERY', 'out_for_delivery'] } }),
      Parcel.countDocuments({ status: { $in: ['DELIVERED', 'delivered'] } }),
      Parcel.countDocuments({ status: { $in: ['FAILED', 'FAILED_DELIVERY'] } }),
      Parcel.countDocuments({ status: { $in: ['RETURNED', 'returned'] } }),
    ]);

    // 3. Financial Statistics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [earningsTodayDocs, earningsWeekDocs, earningsMonthDocs, allEarningsDocs] = await Promise.all([
      Earning.find({ actorType: 'PARTNER', createdAt: { $gte: startOfToday } }),
      Earning.find({ actorType: 'PARTNER', createdAt: { $gte: startOfWeek } }),
      Earning.find({ actorType: 'PARTNER', createdAt: { $gte: startOfMonth } }),
      Earning.find({ actorType: 'PARTNER' }),
    ]);

    const partnerEarningsToday = earningsTodayDocs.reduce((acc, cur) => acc + (cur.netAmount || 0), 0);
    const partnerEarningsThisWeek = earningsWeekDocs.reduce((acc, cur) => acc + (cur.netAmount || 0), 0);
    const partnerEarningsThisMonth = earningsMonthDocs.reduce((acc, cur) => acc + (cur.netAmount || 0), 0);
    const totalPartnerEarnings = allEarningsDocs.reduce((acc, cur) => acc + (cur.netAmount || 0), 0);
    const totalPlatformRevenue = allEarningsDocs.reduce((acc, cur) => acc + (cur.deduction || 0), 0);
    const totalLogisticsRevenue = totalPartnerEarnings + totalPlatformRevenue;

    const [pendingPayoutsDocs, completedPayoutsDocs] = await Promise.all([
      Payout.find({ status: 'pending' }),
      Payout.find({ status: { $in: ['approved', 'processed'] } }),
    ]);

    const pendingPartnerPayouts = pendingPayoutsDocs.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const completedPartnerPayouts = completedPayoutsDocs.reduce((acc, cur) => acc + (cur.amount || 0), 0);

    return res.status(200).json({
      success: true,
      topStats: {
        totalPartners,
        verifiedPartners,
        pendingVerification,
        onlinePartners,
        currentlyMoving,
        availablePartners,
        onDelivery,
        offlinePartners,
        suspendedPartners,
        blockedPartners,
      },
      parcelStats: {
        parcelsSearching,
        parcelsAssigned,
        parcelsPickupPending,
        parcelsPickedUp,
        parcelsMoving,
        parcelsAtHub,
        parcelsAwaitingHandover,
        parcelsWithAgent,
        parcelsOutForDelivery,
        parcelsDelivered,
        parcelsFailed,
        parcelsReturned,
      },
      financialStats: {
        partnerEarningsToday,
        partnerEarningsThisWeek,
        partnerEarningsThisMonth,
        pendingPartnerPayouts,
        completedPartnerPayouts,
        totalLogisticsRevenue,
        platformLogisticsRevenue: totalPlatformRevenue,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. LIVE VEHICLES / MOVING NOW
 * Returns currently active moving vehicles, trips, and carried parcels.
 */
export const getLiveMovingVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const { status, transport } = req.query;

    let query: any = {};
    if (status && status !== 'ALL') {
      query.tripStatus = status;
    } else {
      query.tripStatus = { $in: ['MOVING', 'SCHEDULED', 'READY', 'DELAYED'] };
    }

    if (transport && transport !== 'ALL') {
      query.transportType = transport;
    }

    const trips = await LogisticsTrip.find(query)
      .populate('partnerId')
      .populate('vehicleId')
      .populate({
        path: 'parcelIds',
        select:
          'parcelId parcelTrackingNumber senderName receiverName pickupLocation deliveryLocation whatIsInside weightKg status customerOfferPrice destinationStopId destinationStopName destinationStopOrder expectedPickupTime expectedDeliveryTime createdAt',
      })
      .sort({ tripStatus: 1, updatedAt: -1 });

    // Moving Partners
    const movingPartners = await LogisticsPartner.find({
      partnerStatus: { $in: ['MOVING', 'ON_DELIVERY', 'AT_PICKUP'] },
    }).populate('userId');

    // Moving Parcels directly
    const movingParcels = await Parcel.find({
      status: { $in: ['IN_TRANSIT', 'PICKED_UP', 'PARTNER_ACCEPTED'] },
    })
      .populate('currentPartnerId')
      .populate('currentVehicleId')
      .sort({ updatedAt: -1 });

    const enhancedTrips = trips.map((t) => {
      const breakdown = buildTripStopBreakdown(t, t.parcelIds as any);
      const tObj = t.toObject ? t.toObject() : t;
      return {
        ...tObj,
        stopsList: breakdown.stopsList,
        currentStop: breakdown.currentStop?.name || 'Start',
        nextStop: breakdown.nextStop?.name || 'Destination',
        finalDestination: breakdown.stopsList[breakdown.stopsList.length - 1]?.name || 'Destination',
        parcelsForCurrentStop: breakdown.parcelsForCurrentStop,
        parcelsForNextStop: breakdown.parcelsForNextStop,
        parcelsForFinalDestination: breakdown.parcelsForFinalDestination,
        parcelsPerStopBreakdown: Object.entries(breakdown.parcelsByStop).map(([k, v]) => ({
          stopName: k,
          count: v.length,
        })),
        parcelsByStopCounts: Object.fromEntries(
          Object.entries(breakdown.parcelsByStop).map(([k, v]) => [k, v.length])
        ),
      };
    });

    return res.status(200).json({
      success: true,
      count: enhancedTrips.length,
      trips: enhancedTrips,
      movingPartnersCount: movingPartners.length,
      movingParcelsCount: movingParcels.length,
      movingParcels,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to compute itinerary and parcel stop groups for a trip
 */
export function buildTripStopBreakdown(trip: any, parcels: any[] = []) {
  const stopsList = [
    {
      stopId: 'START',
      stopOrder: 1,
      name: trip.startLocation?.name || trip.fromLocation?.villageOrCity || 'Start',
      villageOrCity: trip.startLocation?.villageOrCity || trip.fromLocation?.villageOrCity,
      address: trip.startLocation?.address || trip.fromLocation?.addressLine,
      expectedArrival: trip.startLocation?.departureTime || trip.departureTime || '08:00 AM',
      expectedDeparture: trip.startLocation?.departureTime || trip.departureTime || '08:00 AM',
      actualArrival: trip.actualDeparture,
      actualDeparture: trip.actualDeparture,
      status: trip.startLocation?.status || (trip.tripStatus === 'MOVING' || trip.tripStatus === 'COMPLETED' ? 'DEPARTED' : 'PENDING'),
      isStart: true,
    },
    ...(trip.stops && trip.stops.length > 0
      ? trip.stops.map((s: any, idx: number) => {
          const sObj = s.toObject ? s.toObject() : s;
          let delayMinutes = 0;
          if (sObj.actualArrival && sObj.expectedArrival) {
            const plannedMins = parseTimeToMinutes(sObj.expectedArrival);
            const actualDate = new Date(sObj.actualArrival);
            const actualMins = actualDate.getHours() * 60 + actualDate.getMinutes();
            if (plannedMins !== null) delayMinutes = actualMins - plannedMins;
          }
          return {
            ...sObj,
            stopId: sObj.stopId || `STOP-${idx + 1}`,
            stopOrder: sObj.stopOrder || idx + 2,
            delayMinutes,
          };
        })
      : (trip.waypoints || []).map((w: any, idx: number) => ({
          stopId: `STOP-${idx + 1}`,
          stopOrder: w.order || idx + 2,
          name: w.villageOrCity,
          villageOrCity: w.villageOrCity,
          address: w.district,
          expectedArrival: '09:00 AM',
          expectedDeparture: '09:10 AM',
          status: w.status === 'REACHED' ? 'DEPARTED' : 'UPCOMING',
          actualArrival: w.reachedAt,
          actualDeparture: w.reachedAt,
          delayMinutes: 0,
        }))),
    {
      stopId: 'FINAL',
      stopOrder: (trip.stops?.length || trip.waypoints?.length || 0) + 2,
      name: trip.finalDestination?.name || trip.toLocation?.villageOrCity || 'Final Destination',
      villageOrCity: trip.finalDestination?.villageOrCity || trip.toLocation?.villageOrCity,
      address: trip.finalDestination?.address || trip.toLocation?.addressLine,
      expectedArrival: trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM',
      expectedDeparture: trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM',
      actualArrival: trip.actualArrival,
      actualDeparture: trip.actualArrival,
      status: trip.finalDestination?.status || (trip.tripStatus === 'COMPLETED' ? 'ARRIVED' : 'UPCOMING'),
      isFinal: true,
    },
  ];

  // Group parcels by destination stop (Section 24)
  const parcelsByStop: Record<string, any[]> = {};
  for (const s of stopsList) {
    parcelsByStop[s.name] = [];
  }

  for (const p of parcels) {
    const destName = p.destinationStopName || p.deliveryLocation || stopsList[stopsList.length - 1].name;
    const matchedStop = stopsList.find((s) => isLocationMatch(s.name, destName));
    const key = matchedStop ? matchedStop.name : destName;
    if (!parcelsByStop[key]) parcelsByStop[key] = [];
    parcelsByStop[key].push(p);
  }

  // Determine current stop and next stop (Section 23)
  let currentStop = stopsList[0];
  let nextStop = stopsList[stopsList.length - 1];

  for (let i = 0; i < stopsList.length; i++) {
    const s = stopsList[i];
    if (s.status === 'ARRIVED') {
      currentStop = s;
      nextStop = stopsList[i + 1] || stopsList[stopsList.length - 1];
      break;
    } else if (s.status === 'DEPARTED') {
      currentStop = s;
      nextStop = stopsList[i + 1] || stopsList[stopsList.length - 1];
    }
  }

  const parcelsForCurrentStop = parcelsByStop[currentStop.name] ? parcelsByStop[currentStop.name].length : 0;
  const parcelsForNextStop = parcelsByStop[nextStop.name] ? parcelsByStop[nextStop.name].length : 0;
  const finalDestName = stopsList[stopsList.length - 1].name;
  const parcelsForFinalDestination = parcelsByStop[finalDestName] ? parcelsByStop[finalDestName].length : 0;

  return {
    stopsList,
    parcelsByStop,
    currentStop,
    nextStop,
    parcelsForCurrentStop,
    parcelsForNextStop,
    parcelsForFinalDestination,
  };
}

/**
 * 3. GET TRIP BY ID / DOSSIER (/admin/logistics/trips/:tripId)
 */
export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let trip = await LogisticsTrip.findOne({
      $or: [{ tripId: id }, ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])],
    })
      .populate('partnerId')
      .populate('vehicleId')
      .populate('routeId')
      .populate({
        path: 'parcelIds',
        populate: [
          { path: 'currentAgentId', select: 'villageName hubCode contactPhone' },
          { path: 'senderUserId', select: 'name phone' },
        ],
      });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Logistics Trip not found.' });
    }

    const carriedParcels = trip.parcelIds || [];
    const breakdown = buildTripStopBreakdown(trip, carriedParcels as any);

    // Carried parcel IDs
    const parcelMongoIds = carriedParcels.map((p: any) => p._id);

    // Fetch related legs and handovers for parcels in this trip
    const [legs, handovers, activities] = await Promise.all([
      ShipmentLeg.find({ parcelId: { $in: parcelMongoIds } }).sort({ sequence: 1 }),
      HandoverRecord.find({ parcelId: { $in: parcelMongoIds } }).sort({ verifiedAt: -1 }),
      LogisticsActivity.find({ tripId: trip._id }).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      trip: {
        ...(trip.toObject ? trip.toObject() : trip),
        stopsList: breakdown.stopsList,
        currentStop: breakdown.currentStop,
        nextStop: breakdown.nextStop,
        parcelsForCurrentStop: breakdown.parcelsForCurrentStop,
        parcelsForNextStop: breakdown.parcelsForNextStop,
        parcelsForFinalDestination: breakdown.parcelsForFinalDestination,
      },
      parcels: trip.parcelIds,
      parcelsByStop: breakdown.parcelsByStop,
      legs,
      handovers,
      activities,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. UPDATE TRIP STATUS / OPERATIONAL LOCATION
 */
export const updateTripStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tripStatus, currentOperationalLocation, routeProgress, notes, waypointIndex } = req.body;

    const trip = await LogisticsTrip.findOne({
      $or: [{ tripId: id }, ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])],
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (tripStatus) {
      trip.tripStatus = tripStatus;
      if (tripStatus === 'MOVING' && !trip.actualDeparture) {
        trip.actualDeparture = new Date();
      }
      if (tripStatus === 'COMPLETED') {
        trip.actualArrival = new Date();
        trip.routeProgress = 100;
      }
    }

    if (currentOperationalLocation) {
      trip.currentOperationalLocation = currentOperationalLocation;
    }

    if (typeof routeProgress === 'number') {
      trip.routeProgress = Math.min(100, Math.max(0, routeProgress));
    }

    if (notes) {
      trip.notes = notes;
    }

    // Update specific waypoint if provided
    if (typeof waypointIndex === 'number' && trip.waypoints[waypointIndex]) {
      trip.waypoints[waypointIndex].status = 'REACHED';
      trip.waypoints[waypointIndex].reachedAt = new Date();
      trip.currentOperationalLocation = trip.waypoints[waypointIndex].villageOrCity;
    }

    await trip.save();

    // Log activity
    await LogisticsActivity.create({
      tripId: trip._id,
      partnerId: trip.partnerId,
      actionType: 'TRIP_STATUS_UPDATED',
      title: `Trip ${trip.tripId} status updated to ${trip.tripStatus}`,
      description: `Current location: ${trip.currentOperationalLocation}, Progress: ${trip.routeProgress}%`,
      actorType: 'ADMIN',
      actorId: req.user?._id,
    });

    emitToAll('logistics:trip_update', {
      tripId: trip.tripId,
      tripStatus: trip.tripStatus,
      location: trip.currentOperationalLocation,
    });

    return res.status(200).json({
      success: true,
      message: `Trip ${trip.tripId} updated successfully.`,
      trip,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4B. GET ALL SCHEDULED TRIPS (/admin/logistics/trips)
 */
export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, transport, partnerId, search } = req.query;

    let query: any = {};
    if (status && status !== 'ALL') query.tripStatus = status;
    if (transport && transport !== 'ALL') query.transportType = transport;
    if (partnerId) query.partnerId = partnerId;
    if (date && date !== 'ALL') {
      query.$or = [{ travelDate: date }, { travelDate: new RegExp(date as string, 'i') }];
    }
    if (search) {
      const s = search as string;
      query.$or = [
        { tripId: { $regex: s, $options: 'i' } },
        { partnerName: { $regex: s, $options: 'i' } },
        { routeTitle: { $regex: s, $options: 'i' } },
        { vehicleNumber: { $regex: s, $options: 'i' } },
        { 'fromLocation.villageOrCity': { $regex: s, $options: 'i' } },
        { 'toLocation.villageOrCity': { $regex: s, $options: 'i' } },
      ];
    }

    const trips = await LogisticsTrip.find(query)
      .populate('partnerId', 'businessName partnerCode phone rating primaryTransportType')
      .populate('vehicleId')
      .populate({
        path: 'parcelIds',
        select:
          'parcelId parcelTrackingNumber whatIsInside weightKg status destinationStopName deliveryLocation customerOfferPrice',
      })
      .sort({ createdAt: -1 });

    const movingCount = trips.filter((t) => t.tripStatus === 'MOVING').length;

    const enhancedTrips = trips.map((t) => {
      const breakdown = buildTripStopBreakdown(t, t.parcelIds as any);
      const tObj = t.toObject ? t.toObject() : t;
      return {
        ...tObj,
        stopsList: breakdown.stopsList,
        currentStop: breakdown.currentStop,
        nextStop: breakdown.nextStop,
        finalDestinationName: breakdown.stopsList[breakdown.stopsList.length - 1]?.name,
        parcelsForCurrentStop: breakdown.parcelsForCurrentStop,
        parcelsForNextStop: breakdown.parcelsForNextStop,
        parcelsForFinalDestination: breakdown.parcelsForFinalDestination,
        parcelsByStopCounts: Object.fromEntries(
          Object.entries(breakdown.parcelsByStop).map(([k, v]) => [k, v.length])
        ),
      };
    });

    return res.status(200).json({
      success: true,
      count: enhancedTrips.length,
      movingCount,
      trips: enhancedTrips,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4C. CREATE SCHEDULED TRIP WITH ROUTE STOPS & TIMING (Sections 1, 2, 3, 4, 5, 6, 18, 19)
 */
export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const {
      partnerId,
      travelDate,
      startLocation,
      finalDestination,
      stops = [],
      transportType,
      vehicleId,
      vehicleNumber,
      totalCapacityKg = 25,
      notes,
      routeTitle,
    } = req.body;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: 'Logistics Partner ID is required.' });
    }

    const partner = await LogisticsPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Logistics Partner not found.' });
    }

    // 1. Validate stops and timings according to Section 19
    const validation = validateTripStops({
      travelDate,
      startLocation,
      finalDestination,
      stops,
    });
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // 2. Prepare formatted stops
    const formattedStops = stops.map((s: any, idx: number) => ({
      stopId: s.stopId || `STOP-${idx + 1}`,
      stopOrder: s.stopOrder || idx + 1,
      name: s.name || s.villageOrCity,
      villageOrCity: s.villageOrCity || s.name,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      expectedArrival: s.expectedArrival,
      expectedDeparture: s.expectedDeparture,
      waitingMinutes: Number(s.waitingMinutes) || 10,
      status: s.status || 'UPCOMING',
    }));

    // 3. Compute route title
    const stopNames = formattedStops.map((s: any) => s.name);
    const computedTitle =
      routeTitle ||
      `${startLocation.name}${stopNames.length ? ' ➔ ' + stopNames.join(' ➔ ') : ''} ➔ ${finalDestination.name}`;

    const tripId = `TRIP-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
    const capKg = Number(totalCapacityKg) || partner.capacityKg || 25;

    const trip = await LogisticsTrip.create({
      tripId,
      partnerId: partner._id,
      partnerName: partner.businessName,
      partnerMobile: partner.phone,
      partnerType: partner.partnerCategory || 'PROFESSIONAL',
      transportType: transportType || partner.primaryTransportType || 'Bike',
      vehicleId: vehicleId || (partner.vehicleIds && partner.vehicleIds[0]),
      vehicleType: transportType || partner.primaryTransportType || 'Bike',
      vehicleNumber: vehicleNumber || partner.vehicleNumber,
      routeTitle: computedTitle,
      travelDate: travelDate || 'Today',
      startLocation: {
        name: startLocation.name,
        villageOrCity: startLocation.villageOrCity || startLocation.name,
        address: startLocation.address,
        district: startLocation.district,
        departureTime: startLocation.departureTime,
        status: 'PENDING',
      },
      finalDestination: {
        name: finalDestination.name,
        villageOrCity: finalDestination.villageOrCity || finalDestination.name,
        address: finalDestination.address,
        district: finalDestination.district,
        expectedArrival: finalDestination.expectedArrival,
        status: 'UPCOMING',
      },
      stops: formattedStops,
      fromLocation: {
        villageOrCity: startLocation.villageOrCity || startLocation.name,
        addressLine: startLocation.address,
        district: startLocation.district,
      },
      toLocation: {
        villageOrCity: finalDestination.villageOrCity || finalDestination.name,
        addressLine: finalDestination.address,
        district: finalDestination.district,
      },
      waypoints: formattedStops.map((s: any) => ({
        villageOrCity: s.name,
        district: s.address,
        order: s.stopOrder,
        status: 'PENDING',
      })),
      departureTime: startLocation.departureTime,
      expectedArrival: finalDestination.expectedArrival,
      tripStatus: 'READY',
      totalCapacityKg: capKg,
      usedCapacityKg: 0,
      availableCapacityKg: capKg,
      parcelIds: [],
      activeParcelCount: 0,
      currentOperationalLocation: startLocation.name,
      routeProgress: 0,
      notes: notes || 'Scheduled corridor transit trip with intermediate stops.',
    });

    // Log Activity & Audit
    await LogisticsActivity.create({
      tripId: trip._id,
      partnerId: partner._id,
      actionType: 'TRIP_CREATED',
      title: `Scheduled Trip ${trip.tripId} Created`,
      description: `New trip for date ${travelDate}: ${computedTitle} with ${formattedStops.length} stops.`,
      actorType: 'ADMIN',
      actorId: req.user?._id,
    });

    if (req.user) {
      await recordAdminAudit(
        req.user,
        'CREATE_LOGISTICS_TRIP',
        (trip._id as any).toString(),
        trip.tripId,
        `Created trip ${trip.tripId} (${computedTitle}) on ${travelDate}`
      );
    }

    emitToAll('logistics:trip_update', {
      tripId: trip.tripId,
      action: 'CREATED',
    });

    return res.status(201).json({
      success: true,
      message: `Trip ${trip.tripId} created successfully with ${formattedStops.length} intermediate stops.`,
      trip,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4D. UPDATE SPECIFIC STOP STATUS (Section 20 & 21)
 * Updates UPCOMING -> ARRIVED -> DEPARTED -> SKIPPED
 */
export const updateTripStopStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id, stopId } = req.params;
    const { status, actualArrival, actualDeparture, notes } = req.body;

    const trip = await LogisticsTrip.findOne({
      $or: [{ tripId: id }, ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])],
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    // Find stop in trip.stops
    const stopIndex = trip.stops.findIndex(
      (s: any) =>
        s.stopId === stopId ||
        s.name?.toLowerCase() === stopId?.toLowerCase() ||
        String(s.stopOrder) === String(stopId)
    );

    if (stopIndex === -1 && stopId !== 'START' && stopId !== 'FINAL') {
      return res.status(404).json({ success: false, message: `Stop ${stopId} not found on trip.` });
    }

    if (stopIndex !== -1) {
      const stop = trip.stops[stopIndex];
      if (status) stop.status = status;
      if (status === 'ARRIVED') {
        stop.actualArrival = actualArrival ? new Date(actualArrival) : new Date();
        trip.currentOperationalLocation = stop.name;
        if (trip.tripStatus === 'READY' || trip.tripStatus === 'SCHEDULED') {
          trip.tripStatus = 'MOVING';
          if (!trip.actualDeparture) trip.actualDeparture = new Date();
        }
      }
      if (status === 'DEPARTED') {
        stop.actualDeparture = actualDeparture ? new Date(actualDeparture) : new Date();
      }
    } else if (stopId === 'START' && status === 'DEPARTED') {
      if (trip.startLocation) trip.startLocation.status = 'DEPARTED';
      trip.tripStatus = 'MOVING';
      trip.actualDeparture = actualDeparture ? new Date(actualDeparture) : new Date();
    } else if (stopId === 'FINAL' && status === 'ARRIVED') {
      if (trip.finalDestination) trip.finalDestination.status = 'ARRIVED';
      trip.tripStatus = 'COMPLETED';
      trip.actualArrival = actualArrival ? new Date(actualArrival) : new Date();
      trip.routeProgress = 100;
    }

    // Recalculate progress
    const totalPoints = trip.stops.length + 2;
    let completedPoints = 0;
    if (trip.tripStatus === 'MOVING' || trip.startLocation?.status === 'DEPARTED') completedPoints++;
    trip.stops.forEach((s: any) => {
      if (s.status === 'DEPARTED') completedPoints++;
      else if (s.status === 'ARRIVED') completedPoints += 0.5;
    });
    if (trip.tripStatus === 'COMPLETED' || trip.finalDestination?.status === 'ARRIVED') completedPoints++;
    trip.routeProgress = Math.min(100, Math.round((completedPoints / totalPoints) * 100));

    await trip.save();

    // Log Activity
    await LogisticsActivity.create({
      tripId: trip._id,
      partnerId: trip.partnerId,
      actionType: 'STOP_STATUS_UPDATED',
      title: `Trip ${trip.tripId} Stop ${stopId} Updated`,
      description: `Stop ${stopId} status changed to ${status}. Current operational location: ${trip.currentOperationalLocation}`,
      actorType: 'ADMIN',
      actorId: req.user?._id,
    });

    emitToAll('logistics:trip_update', {
      tripId: trip.tripId,
      action: 'STOP_UPDATED',
      stopId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: `Stop ${stopId} status updated to ${status}.`,
      trip,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. GET ALL LOGISTICS PARTNERS
 * With full search, status, verification, transport filters, and pagination.
 */
export const getAllPartners = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '15',
      search = '',
      status = 'ALL',
      verification = 'ALL',
      category = 'ALL',
      transport = 'ALL',
    } = req.query;

    const p = Math.max(1, parseInt(page as string, 10));
    const lim = Math.max(1, parseInt(limit as string, 10));
    const skip = (p - 1) * lim;

    let query: any = {};

    if (status && status !== 'ALL') {
      query.partnerStatus = status;
    }

    if (verification && verification !== 'ALL') {
      query.verificationStatus = verification;
    }

    if (category && category !== 'ALL') {
      query.partnerCategory = category;
    }

    if (transport && transport !== 'ALL') {
      query.primaryTransportType = transport;
    }

    if (search && (search as string).trim()) {
      const term = (search as string).trim();
      const regex = new RegExp(term, 'i');
      query.$or = [
        { businessName: regex },
        { partnerCode: regex },
        { phone: regex },
        { email: regex },
        { vehicleNumber: regex },
        { 'address.village': regex },
        { 'address.district': regex },
        { serviceAreas: { $in: [regex] } },
      ];
    }

    const [total, partners] = await Promise.all([
      LogisticsPartner.countDocuments(query),
      LogisticsPartner.find(query)
        .populate('userId', 'name phone email isActive role defaultLocation')
        .populate('vehicleIds')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim),
    ]);

    // Augment partners with real-time active parcel count and trips count from DB
    const augmentedPartners = await Promise.all(
      partners.map(async (partner) => {
        const activeParcels = await Parcel.countDocuments({
          currentPartnerId: partner._id,
          status: { $in: ['PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT'] },
        });
        const completedParcels = await Parcel.countDocuments({
          currentPartnerId: partner._id,
          status: { $in: ['DELIVERED', 'delivered', 'RECEIVED_BY_AGENT'] },
        });

        const pObj = partner.toObject();
        pObj.activeParcelsCount = activeParcels;
        pObj.totalParcelsDelivered = Math.max(pObj.totalParcelsDelivered || 0, completedParcels);
        return pObj;
      })
    );

    return res.status(200).json({
      success: true,
      total,
      page: p,
      limit: lim,
      totalPages: Math.ceil(total / lim),
      partners: augmentedPartners,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. GET PARTNER BY ID (360° Partner Dossier)
 */
export const getPartnerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await LogisticsPartner.findById(id)
      .populate('userId')
      .populate('vehicleIds');

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Logistics Partner not found.' });
    }

    // Related collections
    const [vehicles, routes, trips, activeParcels, parcelHistory, earnings, payouts, complaints, activities] =
      await Promise.all([
        Vehicle.find({ partnerId: partner._id }),
        PartnerRoute.find({ partnerId: partner._id }),
        LogisticsTrip.find({ partnerId: partner._id }).sort({ createdAt: -1 }),
        Parcel.find({
          currentPartnerId: partner._id,
          status: { $in: ['PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'HANDOVER_PENDING'] },
        }).sort({ updatedAt: -1 }),
        Parcel.find({
          currentPartnerId: partner._id,
          status: { $in: ['RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'] },
        })
          .sort({ updatedAt: -1 })
          .limit(20),
        Earning.find({ actorId: partner.userId, actorType: 'PARTNER' }).sort({ createdAt: -1 }),
        Payout.find({ actorId: partner.userId }).sort({ createdAt: -1 }),
        LogisticsComplaint.find({ partnerId: partner._id }).sort({ createdAt: -1 }),
        LogisticsActivity.find({ partnerId: partner._id }).sort({ createdAt: -1 }).limit(30),
      ]);

    return res.status(200).json({
      success: true,
      partner,
      vehicles,
      routes,
      trips,
      activeParcels,
      parcelHistory,
      earnings,
      payouts,
      complaints,
      activities,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. CREATE NEW LOGISTICS PARTNER (Admin creates with user login & transport)
 */
export const createPartner = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      partnerCategory = 'PROFESSIONAL',
      partnerType = 'transporter',
      businessName,
      addressLine,
      village,
      district,
      state = 'Bihar',
      pincode,
      primaryTransportType = 'Bike',
      vehicleNumber,
      vehicleModel,
      capacityKg = 25,
      startingPoint,
      destination,
      departureTime,
      serviceAreas = [],
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile number, and password are required.' });
    }

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ success: false, message: `User with phone ${phone} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      phone,
      email: email || `${phone}@localhaat.in`,
      password: hashedPassword,
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: addressLine || 'Local Haat Depot',
        villageOrCity: village || district || 'Local Town',
        district: district || 'Darbhanga',
        state: state || 'Bihar',
        pincode: pincode || '846001',
      },
    });

    const partnerCode = 'LP-' + Math.floor(1000 + Math.random() * 9000);

    const partner = await LogisticsPartner.create({
      userId: user._id,
      partnerCode,
      businessName: businessName || `${name}'s Transport Fleet`,
      partnerType,
      partnerCategory,
      partnerStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      phone,
      email: user.email,
      address: {
        addressLine: addressLine || 'Hub Point',
        village: village || 'Local Village',
        district: district || 'Darbhanga',
        state: state || 'Bihar',
        pincode: pincode || '846001',
      },
      primaryTransportType,
      vehicleNumber: vehicleNumber || (partnerCategory === 'PROFESSIONAL' ? `BR-07-TR-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      capacityKg: Number(capacityKg) || 25,
      serviceAreas: serviceAreas.length ? serviceAreas : [district || 'Darbhanga', village || 'Local Areas'],
      rating: 5.0,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 26.15,
        longitude: 85.89,
        locationName: village || district || 'Depot',
        lastUpdated: new Date(),
      },
    });

    // Create Vehicle if applicable
    if (vehicleNumber || primaryTransportType) {
      const vehicle = await Vehicle.create({
        partnerId: partner._id,
        vehicleType: primaryTransportType,
        registrationNumber: vehicleNumber || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
        modelName: vehicleModel || `${primaryTransportType} Standard Cargo`,
        maxCapacityKg: Number(capacityKg) || 25,
        currentStatus: 'available',
      });
      partner.vehicleIds.push(vehicle._id as any);
      await partner.save();
    }

    // Create Route if travelling or route provided
    if (startingPoint && destination) {
      await PartnerRoute.create({
        partnerId: partner._id,
        routeTitle: `${startingPoint} -> ${destination} Route`,
        sourceLocation: {
          addressLine: startingPoint,
          villageOrCity: startingPoint,
          district: district || 'Darbhanga',
          state: state || 'Bihar',
          pincode: pincode || '846001',
        },
        destinationLocation: {
          addressLine: destination,
          villageOrCity: destination,
          district: district || 'Darbhanga',
          state: state || 'Bihar',
          pincode: pincode || '846001',
        },
        departureTime: departureTime || '09:00 AM',
        travelDate: 'Today',
        vehicleType: primaryTransportType,
        capacityKg: Number(capacityKg) || 25,
        availableCapacityKg: Number(capacityKg) || 25,
        pricePerKg: 10,
        status: 'active',
      });
    }

    // Audit Log
    if (req.user) {
      await recordAdminAudit(
        req.user,
        'CREATE_LOGISTICS_PARTNER',
        (partner._id as any).toString(),
        partner.businessName,
        `Created partner ${name} (${phone}) with ${primaryTransportType} and code ${partnerCode}`
      );
    }

    return res.status(201).json({
      success: true,
      message: `Logistics Partner ${name} created successfully with Partner Code ${partnerCode}.`,
      partner,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. UPDATE PARTNER STATUS (Verify, Reject, Suspend, Block, Reactivate)
 */
export const updatePartnerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason, partnerStatus } = req.body;

    const partner = await LogisticsPartner.findById(id).populate('userId');
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    const previousStatus = partner.verificationStatus;

    switch (action) {
      case 'VERIFY':
        partner.verificationStatus = 'VERIFIED';
        partner.isVerified = true;
        partner.isActive = true;
        partner.partnerStatus = 'AVAILABLE';
        break;
      case 'REJECT':
        partner.verificationStatus = 'REJECTED';
        partner.isVerified = false;
        partner.rejectionReason = reason || 'Documents did not meet criteria';
        break;
      case 'SUSPEND':
        partner.verificationStatus = 'SUSPENDED';
        partner.partnerStatus = 'SUSPENDED';
        partner.isActive = false;
        partner.suspensionReason = reason || 'Suspended by admin review';
        break;
      case 'BLOCK':
        partner.verificationStatus = 'BLOCKED';
        partner.partnerStatus = 'BLOCKED';
        partner.isActive = false;
        partner.suspensionReason = reason || 'Permanently blocked by admin';
        break;
      case 'REACTIVATE':
        partner.verificationStatus = 'VERIFIED';
        partner.partnerStatus = 'AVAILABLE';
        partner.isActive = true;
        partner.isVerified = true;
        break;
      default:
        if (partnerStatus) {
          partner.partnerStatus = partnerStatus;
        }
        break;
    }

    await partner.save();

    // Log Activity & Audit
    if (req.user) {
      await recordAdminAudit(
        req.user,
        `PARTNER_${action || 'STATUS_UPDATE'}`,
        (partner._id as any).toString(),
        partner.businessName,
        `Changed verification from ${previousStatus} to ${partner.verificationStatus}. Reason: ${reason || 'N/A'}`
      );
    }

    await LogisticsActivity.create({
      partnerId: partner._id,
      actionType: `PARTNER_${action || 'UPDATED'}`,
      title: `Partner ${action || 'Status Updated'}`,
      description: `Partner status changed to ${partner.partnerStatus} / ${partner.verificationStatus}. Reason: ${reason || 'Admin action'}`,
      actorType: 'ADMIN',
      actorId: req.user?._id,
    });

    emitToAll('logistics:partner_update', {
      partnerId: partner._id,
      partnerCode: partner.partnerCode,
      status: partner.partnerStatus,
      verificationStatus: partner.verificationStatus,
    });

    return res.status(200).json({
      success: true,
      message: `Partner status updated to ${partner.verificationStatus}.`,
      partner,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. GET ALL ROUTES & TRIPS
 */
export const getAllRoutes = async (req: AuthRequest, res: Response) => {
  try {
    const routes = await PartnerRoute.find()
      .populate('partnerId', 'businessName partnerCode rating phone primaryTransportType')
      .sort({ updatedAt: -1 });

    const trips = await LogisticsTrip.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      routesCount: routes.length,
      tripsCount: trips.length,
      routes,
      trips,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. CREATE ROUTE
 */
export const createRoute = async (req: AuthRequest, res: Response) => {
  try {
    const {
      partnerId,
      routeTitle,
      sourceLocation,
      destinationLocation,
      waypoints = [],
      departureTime = '08:00 AM',
      travelDate = 'Today',
      vehicleType = 'Bike',
      capacityKg = 25,
      pricePerKg = 10,
    } = req.body;

    if (!partnerId || !sourceLocation || !destinationLocation) {
      return res.status(400).json({ success: false, message: 'Partner ID, origin, and destination are required.' });
    }

    const srcLoc = typeof sourceLocation === 'string'
      ? { addressLine: sourceLocation, villageOrCity: sourceLocation, district: 'Darbhanga', state: 'Bihar', pincode: '846001' }
      : { addressLine: 'Origin Depot', district: 'Darbhanga', state: 'Bihar', pincode: '846001', ...sourceLocation };
    const dstLoc = typeof destinationLocation === 'string'
      ? { addressLine: destinationLocation, villageOrCity: destinationLocation, district: 'Madhubani', state: 'Bihar', pincode: '847232' }
      : { addressLine: 'Destination Point', district: 'Madhubani', state: 'Bihar', pincode: '847232', ...destinationLocation };

    const route = await PartnerRoute.create({
      partnerId,
      routeTitle: routeTitle || `${srcLoc.villageOrCity} -> ${dstLoc.villageOrCity} Haul`,
      sourceLocation: srcLoc,
      destinationLocation: dstLoc,
      waypoints,
      departureTime,
      travelDate,
      vehicleType,
      capacityKg: Number(capacityKg) || 25,
      availableCapacityKg: Number(capacityKg) || 25,
      pricePerKg: Number(pricePerKg) || 10,
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Logistics route created successfully.',
      route,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 11. SCHEDULED ROUTE STOPS & TIMING MATCHING ENGINE FOR PARCELS
 * Evaluates all stops along each route, stop sequence order, travel date, time, and capacity.
 * (Sections 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 28, 29, 30, 31, 32, 33)
 */
export const getMatchingPartnersForParcel = async (req: AuthRequest, res: Response) => {
  try {
    const { parcelId } = req.params;

    const parcel = await Parcel.findOne({
      $or: [{ parcelId }, ...(mongoose.Types.ObjectId.isValid(parcelId) ? [{ _id: parcelId }] : [])],
    });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const parcelWeight = parcel.weightKg || 1;
    const origin = (parcel.pickupLocation || '').trim();
    const destination = (parcel.deliveryLocation || '').trim();
    const travelDateFilter = (parcel.preferredDeliveryDate || '').trim();

    // 1. Fetch active scheduled trips
    const trips = await LogisticsTrip.find({
      tripStatus: { $in: ['READY', 'SCHEDULED', 'MOVING'] },
    })
      .populate('partnerId')
      .populate('vehicleId');

    const tripMatches: any[] = [];

    for (const trip of trips) {
      const partner = trip.partnerId as any;
      if (!partner || partner.verificationStatus !== 'VERIFIED' || !partner.isActive) continue;

      // Build complete ordered itinerary of all stops
      const itinerary = [
        {
          stopId: 'START',
          order: 1,
          name: trip.startLocation?.name || trip.fromLocation?.villageOrCity || 'Start',
          villageOrCity: trip.startLocation?.villageOrCity || trip.fromLocation?.villageOrCity,
          address: trip.startLocation?.address || trip.fromLocation?.addressLine,
          expectedArrival: trip.startLocation?.departureTime || trip.departureTime || '08:00 AM',
          expectedDeparture: trip.startLocation?.departureTime || trip.departureTime || '08:00 AM',
          status: trip.startLocation?.status || (trip.tripStatus === 'MOVING' ? 'DEPARTED' : 'PENDING'),
        },
        ...(trip.stops && trip.stops.length > 0
          ? trip.stops.map((s: any, idx: number) => ({
              stopId: s.stopId || `STOP-${idx + 1}`,
              order: s.stopOrder || idx + 2,
              name: s.name,
              villageOrCity: s.villageOrCity || s.name,
              address: s.address,
              expectedArrival: s.expectedArrival,
              expectedDeparture: s.expectedDeparture,
              status: s.status || 'UPCOMING',
            }))
          : (trip.waypoints || []).map((w: any, idx: number) => ({
              stopId: `STOP-${idx + 1}`,
              order: w.order || idx + 2,
              name: w.villageOrCity,
              villageOrCity: w.villageOrCity,
              address: w.district,
              expectedArrival: '09:00 AM',
              expectedDeparture: '09:10 AM',
              status: w.status === 'REACHED' ? 'DEPARTED' : 'UPCOMING',
            }))),
        {
          stopId: 'FINAL',
          order: (trip.stops?.length || trip.waypoints?.length || 0) + 2,
          name: trip.finalDestination?.name || trip.toLocation?.villageOrCity || 'Final Destination',
          villageOrCity: trip.finalDestination?.villageOrCity || trip.toLocation?.villageOrCity,
          address: trip.finalDestination?.address || trip.toLocation?.addressLine,
          expectedArrival: trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM',
          expectedDeparture: trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM',
          status: trip.finalDestination?.status || (trip.tripStatus === 'COMPLETED' ? 'ARRIVED' : 'UPCOMING'),
        },
      ];

      // Find matching pickup stop index
      let pickupIdx = -1;
      let dropIdx = -1;

      for (let i = 0; i < itinerary.length; i++) {
        const pt = itinerary[i];
        if (
          isLocationMatch(pt.name, origin) ||
          isLocationMatch(pt.villageOrCity, origin) ||
          isLocationMatch(pt.address, origin)
        ) {
          pickupIdx = i;
          break;
        }
      }

      for (let i = 0; i < itinerary.length; i++) {
        const pt = itinerary[i];
        if (
          isLocationMatch(pt.name, destination) ||
          isLocationMatch(pt.villageOrCity, destination) ||
          isLocationMatch(pt.address, destination)
        ) {
          dropIdx = i;
          if (pickupIdx !== -1 && i > pickupIdx) {
            break;
          }
        }
      }

      // Must match both pickup and drop along this route
      if (pickupIdx === -1 || dropIdx === -1) {
        continue;
      }

      // CRITICAL DIRECTIONALITY CHECK (Section 12 & 13):
      // Must be strictly forward order: pickupStop.order < destinationStop.order
      if (pickupIdx >= dropIdx) {
        // REVERSE DIRECTION DETECTED -> STRICTLY DO NOT MATCH!
        continue;
      }

      const pickupStop = itinerary[pickupIdx];
      const dropStop = itinerary[dropIdx];

      // Passed check: if trip is already MOVING, partner must not have passed the pickup stop
      if (trip.tripStatus === 'MOVING' && pickupStop.status === 'DEPARTED') {
        continue;
      }

      const hasCapacity = (trip.availableCapacityKg || 0) >= parcelWeight;

      // Scoring
      let score = 80;
      if (hasCapacity) score += 10;
      else score -= 30;

      // Date matching (Section 32)
      let dateMatches = true;
      if (travelDateFilter && travelDateFilter !== 'Today' && travelDateFilter !== 'ALL') {
        const tripDate = trip.travelDate || 'Today';
        if (normalizeLocStr(tripDate) === normalizeLocStr(travelDateFilter)) {
          score += 10;
        } else if (tripDate === 'Today') {
          score += 5;
        } else {
          score -= 15;
          dateMatches = false;
        }
      } else {
        score += 5;
      }

      // Transport compatibility
      if (
        parcel.preferredLogisticsType &&
        trip.transportType &&
        parcel.preferredLogisticsType.toLowerCase().includes(trip.transportType.toLowerCase())
      ) {
        score += 5;
      }

      score += Math.min(5, Math.round(partner.rating || 4.5));
      const finalScore = Math.min(99, Math.max(40, score));

      tripMatches.push({
        matchType: 'SCHEDULED_TRIP',
        isScheduledTripMatch: true,
        tripId: trip.tripId,
        tripMongoId: trip._id,
        partnerId: partner._id,
        partnerCode: partner.partnerCode,
        partnerName: partner.businessName,
        phone: trip.partnerMobile || partner.phone,
        partnerCategory: trip.partnerType || partner.partnerCategory,
        primaryTransportType: trip.transportType,
        vehicleNumber: trip.vehicleNumber || partner.vehicleNumber,
        travelDate: trip.travelDate || 'Today',
        routeTitle: trip.routeTitle,
        rating: partner.rating || 4.9,
        availableCapacityKg: trip.availableCapacityKg,
        totalCapacityKg: trip.totalCapacityKg,
        currentLocation: trip.currentOperationalLocation,
        tripStatus: trip.tripStatus,
        routeProgress: trip.routeProgress,
        // Detailed stop assignment info (Sections 15, 16, 17, 26, 37)
        pickupStop: {
          stopId: pickupStop.stopId,
          name: pickupStop.name,
          order: pickupStop.order,
          expectedTime: pickupStop.expectedDeparture || pickupStop.expectedArrival,
        },
        destinationStop: {
          stopId: dropStop.stopId,
          name: dropStop.name,
          order: dropStop.order,
          expectedArrival: dropStop.expectedArrival,
        },
        expectedDeliveryTime: dropStop.expectedArrival, // ETA of destination stop!
        finalTripDestination: itinerary[itinerary.length - 1].name,
        finalTripArrival: itinerary[itinerary.length - 1].expectedArrival,
        routeSequence: itinerary.map((pt) => pt.name),
        matchScore: finalScore,
        matchExplanation: `Valid route segment: ${pickupStop.name} (Stop ${pickupStop.order}) ➔ ${dropStop.name} (Stop ${dropStop.order}). Expected drop arrival: ${dropStop.expectedArrival}. Available capacity: ${trip.availableCapacityKg} KG. (Trip final destination: ${itinerary[itinerary.length - 1].name} at ${itinerary[itinerary.length - 1].expectedArrival})`,
        estimatedEarning: Math.round((parcel.customerOfferPrice || 200) * 0.85),
      });
    }

    // Sort trip matches descending by score
    tripMatches.sort((a, b) => b.matchScore - a.matchScore);

    // 2. Fallback general partner matches (for partners without a scheduled trip matching yet)
    const partners = await LogisticsPartner.find({
      verificationStatus: 'VERIFIED',
      isActive: true,
      partnerStatus: { $in: ['AVAILABLE', 'ONLINE', 'MOVING'] },
    }).populate('vehicleIds');

    const generalMatches = partners
      .filter((p) => !tripMatches.some((tm) => tm.partnerId.toString() === p._id.toString()))
      .map((partner) => {
        let score = 65;
        const partnerCapacity = partner.capacityKg || 25;
        if (partnerCapacity >= parcelWeight) score += 5;
        else score -= 30;

        const matchesArea = (partner.serviceAreas || []).some(
          (area) => isLocationMatch(area, origin) || isLocationMatch(area, destination)
        );
        if (matchesArea) score += 15;

        score += Math.round((partner.rating || 4.5) * 2);
        const finalScore = Math.min(85, Math.max(30, score));

        return {
          matchType: 'GENERAL_PARTNER',
          isScheduledTripMatch: false,
          partnerId: partner._id,
          partnerCode: partner.partnerCode,
          partnerName: partner.businessName,
          phone: partner.phone,
          partnerCategory: partner.partnerCategory,
          primaryTransportType: partner.primaryTransportType,
          vehicleNumber: partner.vehicleNumber,
          rating: partner.rating,
          totalParcelsDelivered: partner.totalParcelsDelivered,
          activeParcelsCount: partner.activeParcelsCount,
          capacityKg: partnerCapacity,
          availableCapacityKg: Math.max(0, partnerCapacity - (partner.activeParcelsCount || 0) * 2),
          currentLocation: partner.currentLocation?.locationName || partner.address?.village || 'Depot',
          matchScore: finalScore,
          matchExplanation: `Verified partner in service corridor area (${partner.serviceAreas?.join(', ') || 'Regional'}).`,
          estimatedEarning: Math.round((parcel.customerOfferPrice || 200) * 0.85),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    const allMatches = [...tripMatches, ...generalMatches];

    return res.status(200).json({
      success: true,
      parcel,
      count: allMatches.length,
      tripMatchesCount: tripMatches.length,
      matches: allMatches,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 12. ASSIGN PARTNER TO PARCEL WITH DESTINATION STOP DETAILS
 * (Sections 26 & 36)
 */
export const assignPartnerToParcel = async (req: AuthRequest, res: Response) => {
  try {
    const { parcelId } = req.params;
    const {
      partnerId,
      tripId,
      vehicleId,
      note,
      pickupStopId,
      pickupStopName,
      pickupStopOrder,
      destinationStopId,
      destinationStopName,
      destinationStopOrder,
      expectedPickupTime,
      expectedDeliveryTime,
    } = req.body;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: 'Partner ID is required.' });
    }

    const [parcel, partner] = await Promise.all([
      Parcel.findOne({
        $or: [{ parcelId }, ...(mongoose.Types.ObjectId.isValid(parcelId) ? [{ _id: parcelId }] : [])],
      }),
      LogisticsPartner.findById(partnerId),
    ]);

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    // Security Check: Must be verified and not suspended/blocked
    if (partner.verificationStatus !== 'VERIFIED' || !partner.isActive) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign partner ${partner.businessName} because their status is ${partner.verificationStatus}. Only verified active partners can receive assignments.`,
      });
    }

    parcel.currentPartnerId = partner._id as any;
    if (vehicleId) parcel.currentVehicleId = vehicleId as any;
    parcel.status = 'PARTNER_ACCEPTED';

    // Stop-level tracking fields (Section 26 & 36)
    let trip: any = null;
    if (tripId) {
      trip = await LogisticsTrip.findOne({
        $or: [{ tripId }, ...(mongoose.Types.ObjectId.isValid(tripId) ? [{ _id: tripId }] : [])],
      });

      if (trip) {
        parcel.assignedTripId = trip._id as any;
        parcel.assignedTripCode = trip.tripId;

        // Auto-resolve stops if not explicitly passed
        let finalPickupName = pickupStopName;
        let finalDestName = destinationStopName;
        let finalDropEta = expectedDeliveryTime;

        if (!finalDestName) {
          // Find matching stop on trip
          const matchedStop = (trip.stops || []).find((s: any) =>
            isLocationMatch(s.name, parcel.deliveryLocation)
          );
          if (matchedStop) {
            finalDestName = matchedStop.name;
            finalDropEta = matchedStop.expectedArrival;
            parcel.destinationStopId = matchedStop.stopId;
            parcel.destinationStopOrder = matchedStop.stopOrder;
          } else if (isLocationMatch(trip.finalDestination?.name, parcel.deliveryLocation)) {
            finalDestName = trip.finalDestination?.name;
            finalDropEta = trip.finalDestination?.expectedArrival;
            parcel.destinationStopId = 'FINAL';
            parcel.destinationStopOrder = (trip.stops?.length || 0) + 2;
          } else {
            finalDestName = parcel.deliveryLocation;
            finalDropEta = trip.expectedArrival;
          }
        } else {
          parcel.destinationStopId = destinationStopId;
          parcel.destinationStopOrder = destinationStopOrder;
        }

        if (!finalPickupName) {
          finalPickupName = isLocationMatch(trip.startLocation?.name, parcel.pickupLocation)
            ? trip.startLocation?.name
            : parcel.pickupLocation;
        }

        parcel.pickupStopId = pickupStopId || 'START';
        parcel.pickupStopName = finalPickupName;
        parcel.pickupStopOrder = pickupStopOrder || 1;
        parcel.destinationStopName = finalDestName;
        parcel.expectedPickupTime = expectedPickupTime || trip.departureTime;
        parcel.expectedDeliveryTime = finalDropEta; // Parcel inherits ETA of destination stop!
        parcel.assignedAt = new Date();
        parcel.acceptedAt = new Date();

        // Attach parcel to trip & update capacity
        if (!trip.parcelIds.some((pid: any) => pid.toString() === (parcel._id as any).toString())) {
          trip.parcelIds.push(parcel._id as any);
          trip.activeParcelCount = trip.parcelIds.length;
          trip.usedCapacityKg += parcel.weightKg || 1;
          trip.availableCapacityKg = Math.max(0, trip.totalCapacityKg - trip.usedCapacityKg);
          await trip.save();
        }
      }
    }

    await parcel.save();

    // Increment partner active parcel count
    partner.activeParcelsCount = (partner.activeParcelsCount || 0) + 1;
    await partner.save();

    // Create or update ParcelAssignment record
    try {
      const assignmentId = 'ASN-' + Math.floor(100000 + Math.random() * 900000);
      await ParcelAssignment.create({
        assignmentId,
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber || parcel.parcelId,
        tripId: trip ? trip._id : new mongoose.Types.ObjectId(),
        tripCode: trip ? trip.tripId : 'DIRECT',
        partnerId: partner._id,
        partnerName: partner.businessName,
        partnerType: trip?.partnerType || partner.partnerCategory || 'PROFESSIONAL',
        transportType: trip?.transportType || partner.primaryTransportType || 'Bike',
        pickupStopId: parcel.pickupStopId || 'START',
        pickupStopName: parcel.pickupStopName || parcel.pickupLocation,
        pickupStopOrder: parcel.pickupStopOrder || 1,
        destinationStopId: parcel.destinationStopId || 'FINAL',
        destinationStopName: parcel.destinationStopName || parcel.deliveryLocation,
        destinationStopOrder: parcel.destinationStopOrder || 2,
        expectedPickupTime: parcel.expectedPickupTime || 'Flexible',
        expectedDeliveryTime: parcel.expectedDeliveryTime || 'Flexible',
        weightKg: parcel.weightKg || 1,
        agreedPrice: parcel.customerOfferPrice || 150,
        assignedAt: new Date(),
        status: 'ASSIGNED',
        assignedByRole: 'ADMIN',
        assignedByUserId: req.user?._id,
        notes: note || 'Assigned via Admin Logistics Console',
      });
    } catch (asnErr) {
      console.error('Error creating ParcelAssignment:', asnErr);
    }

    // Tracking event
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber || parcel.parcelId,
      eventType: 'PARTNER_ASSIGNED' as any,
      locationName: parcel.pickupLocation || 'Central Depot',
      actorRole: 'ADMIN',
      description: `Assigned to Partner ${partner.businessName} (${partner.primaryTransportType}) on route to ${parcel.destinationStopName || parcel.deliveryLocation}. Expected ETA: ${parcel.expectedDeliveryTime || 'As scheduled'}. Note: ${note || 'Scheduled Route Matching'}`,
      actorId: req.user?._id,
    });

    // Admin Audit
    if (req.user) {
      await recordAdminAudit(
        req.user,
        'ASSIGN_LOGISTICS_PARTNER',
        (parcel._id as any).toString(),
        parcel.parcelId,
        `Assigned partner ${partner.businessName} to parcel ${parcel.parcelId} with destination stop ${parcel.destinationStopName || parcel.deliveryLocation}`
      );
    }

    emitToAll('parcel:update', {
      parcelId: parcel.parcelId,
      status: parcel.status,
      partnerName: partner.businessName,
      destinationStopName: parcel.destinationStopName,
      expectedDeliveryTime: parcel.expectedDeliveryTime,
    });

    return res.status(200).json({
      success: true,
      message: `Partner ${partner.businessName} assigned to parcel ${parcel.parcelId} for destination stop "${parcel.destinationStopName || parcel.deliveryLocation}" successfully.`,
      parcel,
      partner,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 13. GET HANDOVERS & PICKUPS (Custody chain and multi-leg records)
 */
export const getHandoversAndPickups = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = '30' } = req.query;

    const [handovers, legs] = await Promise.all([
      HandoverRecord.find()
        .populate('parcelId', 'parcelId parcelTrackingNumber whatIsInside pickupLocation deliveryLocation')
        .populate('fromActorId', 'name phone role')
        .populate('toActorId', 'name phone role')
        .sort({ verifiedAt: -1 })
        .limit(parseInt(limit as string, 10)),
      ShipmentLeg.find()
        .populate('parcelId', 'parcelId parcelTrackingNumber status')
        .populate('assignedToUserId', 'name phone role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string, 10)),
    ]);

    return res.status(200).json({
      success: true,
      handoversCount: handovers.length,
      legsCount: legs.length,
      handovers,
      legs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 14. GET PARTNER EARNINGS LEDGER
 */
export const getPartnerEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId } = req.query;

    let filter: any = { actorType: 'PARTNER' };
    if (partnerId) {
      const partner = await LogisticsPartner.findById(partnerId);
      if (partner) {
        filter.actorId = partner.userId;
      }
    }

    const earnings = await Earning.find(filter)
      .populate('parcelId', 'parcelId parcelTrackingNumber whatIsInside pickupLocation deliveryLocation')
      .populate('actorId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(100);

    const totalGross = earnings.reduce((sum, e) => sum + (e.baseAmount || 0), 0);
    const totalPlatformFee = earnings.reduce((sum, e) => sum + (e.deduction || 0), 0);
    const totalNetPartner = earnings.reduce((sum, e) => sum + (e.netAmount || 0), 0);

    return res.status(200).json({
      success: true,
      count: earnings.length,
      totalGross,
      totalPlatformFee,
      totalNetPartner,
      earnings,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 15. GET & PROCESS PARTNER PAYOUTS
 */
export const getPartnerPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const payouts = await Payout.find()
      .populate('actorId', 'name phone email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payouts.length,
      payouts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processPartnerPayout = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, paymentReference, notes } = req.body;

    const payout = await Payout.findById(id).populate('actorId');
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found.' });
    }

    if (action === 'APPROVE' || action === 'PAY') {
      payout.status = 'processed';
      payout.processedAt = new Date();
      if (paymentReference) payout.transactionRef = paymentReference;
    } else if (action === 'REJECT') {
      payout.status = 'rejected';
    }

    await payout.save();

    if (req.user) {
      const actorName = (payout.actorId as any)?.name || 'Partner';
      await recordAdminAudit(
        req.user,
        `PAYOUT_${action}`,
        (payout._id as any).toString(),
        `Payout-${payout._id}`,
        `Processed payout of Rs. ${payout.amount} for ${actorName}. Status: ${payout.status}. Ref: ${paymentReference || 'N/A'}`
      );
    }

    return res.status(200).json({
      success: true,
      message: `Payout of Rs. ${payout.amount} has been marked as ${payout.status}.`,
      payout,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 16. LOGISTICS COMPLAINTS (List & Resolve)
 */
export const getLogisticsComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const complaints = await LogisticsComplaint.find(query)
      .populate('partnerId', 'businessName partnerCode phone primaryTransportType')
      .populate('parcelId', 'parcelId parcelTrackingNumber whatIsInside')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveLogisticsComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution } = req.body;

    const complaint = await LogisticsComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (status) complaint.status = status as any;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (resolution) complaint.resolution = resolution;
    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.user?._id as any;
    }

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 17. LOGISTICS ACTIVITY & AUDIT LOGS
 */
export const getLogisticsActivityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const [activities, auditLogs] = await Promise.all([
      LogisticsActivity.find()
        .populate('partnerId', 'businessName partnerCode')
        .populate('actorId', 'name role')
        .sort({ createdAt: -1 })
        .limit(50),
      AdminAuditLog.find({ targetType: 'LOGISTICS' })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    return res.status(200).json({
      success: true,
      activities,
      auditLogs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 18. LOGISTICS ANALYTICS (Real aggregations from MongoDB)
 */
export const getLogisticsAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Parcels by Transport Type
    const parcelsByTransport = await Parcel.aggregate([
      { $group: { _id: '$preferredLogisticsType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 2. Partners by Transport Type
    const partnersByTransport = await LogisticsPartner.aggregate([
      { $group: { _id: '$primaryTransportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Most Active Routes
    const mostActiveRoutes = await LogisticsTrip.aggregate([
      { $group: { _id: '$routeTitle', tripsCount: { $sum: 1 }, parcelsTotal: { $sum: '$activeParcelCount' } } },
      { $sort: { tripsCount: -1 } },
      { $limit: 8 },
    ]);

    // 4. Partner Leaderboard
    const topPartners = await LogisticsPartner.find({ verificationStatus: 'VERIFIED' })
      .select('businessName partnerCode rating totalTrips totalParcelsDelivered totalEarnings primaryTransportType')
      .sort({ totalTrips: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      parcelsByTransport,
      partnersByTransport,
      mostActiveRoutes,
      topPartners,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 19. DELETE PARTNER (Single & Bulk)
 */
export const deletePartnerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const partner = await LogisticsPartner.findById(id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    // Clean up vehicles and routes
    await Promise.all([
      Vehicle.deleteMany({ partnerId: partner._id }),
      PartnerRoute.deleteMany({ partnerId: partner._id }),
      LogisticsTrip.deleteMany({ partnerId: partner._id }),
      LogisticsPartner.findByIdAndDelete(id),
    ]);

    if (req.user) {
      await recordAdminAudit(
        req.user,
        'DELETE_LOGISTICS_PARTNER',
        id,
        partner.businessName,
        `Permanently deleted partner ${partner.businessName}. Reason: ${reason || 'Admin deletion'}`
      );
    }

    emitToAll('logistics:partner_update', { action: 'DELETE', partnerId: id });

    return res.status(200).json({
      success: true,
      message: `Partner ${partner.businessName} deleted successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkDeletePartners = async (req: AuthRequest, res: Response) => {
  try {
    const { partnerIds, reason } = req.body;
    if (!Array.isArray(partnerIds) || partnerIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No partners selected for deletion.' });
    }

    const objectIds = partnerIds.map((id: string) => new mongoose.Types.ObjectId(id));

    await Promise.all([
      Vehicle.deleteMany({ partnerId: { $in: objectIds } }),
      PartnerRoute.deleteMany({ partnerId: { $in: objectIds } }),
      LogisticsTrip.deleteMany({ partnerId: { $in: objectIds } }),
      LogisticsPartner.deleteMany({ _id: { $in: objectIds } }),
    ]);

    if (req.user) {
      await recordAdminAudit(
        req.user,
        'BULK_DELETE_LOGISTICS_PARTNERS',
        'BULK',
        `${partnerIds.length} Partners`,
        `Bulk deleted ${partnerIds.length} partners. Reason: ${reason || 'Admin bulk deletion'}`
      );
    }

    emitToAll('logistics:partner_update', { action: 'BULK_DELETE', partnerIds });

    return res.status(200).json({
      success: true,
      message: `${partnerIds.length} partners permanently deleted.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
