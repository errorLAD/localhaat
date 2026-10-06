import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { LogisticsPartner } from '../models/LogisticsPartner.js';
import { PartnerRoute } from '../models/PartnerRoute.js';
import { LogisticsTrip } from '../models/LogisticsTrip.js';
import { Vehicle } from '../models/Vehicle.js';
import { ShipmentLeg } from '../models/ShipmentLeg.js';
import { Parcel } from '../models/Parcel.js';
import { Earning } from '../models/Earning.js';
import { Payout } from '../models/Payout.js';
import { PartnerLocation } from '../models/PartnerLocation.js';
import { PartnerShop } from '../models/PartnerShop.js';
import { PartnerDriver } from '../models/PartnerDriver.js';
import { KycDocument } from '../models/KycDocument.js';
import { User } from '../models/User.js';
import { RouteMatchingService, syncPartnerLocationCorridors, parseTimeToMinutes } from '../services/routeMatchingService.js';
import { getIO } from '../services/socketService.js';

export const getPartnerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let partner = await getOrCreatePartnerHelper(req.user);

    await syncPartnerLocationCorridors(partner._id);

    const vehicles = await Vehicle.find({ partnerId: partner._id });
    const routes = await PartnerRoute.find({ partnerId: partner._id });

    // Incoming requests searching for partners
    const incomingRequests = await Parcel.find({
      status: { $in: ['SEARCHING_FOR_PARTNER', 'created'] },
    }).sort({ createdAt: -1 });

    // Active parcels assigned to this partner
    const activeParcels = await Parcel.find({
      currentPartnerId: partner._id,
      status: {
        $in: [
          'PARTNER_ACCEPTED',
          'PICKUP_PENDING',
          'PICKED_UP',
          'IN_TRANSIT',
          'HANDOVER_PENDING',
          'ready_for_pickup',
          'in_transit',
        ],
      },
    }).sort({ updatedAt: -1 });

    const recentCompletedParcels = await Parcel.find({
      currentPartnerId: partner._id,
      status: { $in: ['RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'arrived_at_village_hub', 'delivered'] },
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    const totalEarningsDocs = await Earning.find({ actorId: req.user._id, actorType: 'PARTNER' });
    const totalEarnings = totalEarningsDocs.reduce((sum, e) => sum + e.netAmount, 0);

    return res.status(200).json({
      success: true,
      partner,
      stats: {
        totalEarnings,
        activeShipmentsCount: activeParcels.length,
        incomingRequestsCount: incomingRequests.length,
        completedTrips: recentCompletedParcels.length,
        totalVehicles: vehicles.length,
        registeredRoutes: routes.length,
      },
      incomingRequests,
      activeParcels,
      recentCompletedParcels,
      vehicles,
      routes,
      earnings: totalEarningsDocs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleOnline = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let partner = await LogisticsPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found. Please complete partner onboarding first.' });
    }

    partner.isOnline = !partner.isOnline;
    await partner.save();

    return res.status(200).json({
      success: true,
      isOnline: partner.isOnline,
      message: `Partner is now ${partner.isOnline ? 'Online' : 'Offline'}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Validate that stop times follow chronological route sequence:
 * Start Departure <= Stop 1 Arrival <= Stop 1 Departure <= Stop 2 Arrival <= Stop 2 Departure <= Final Arrival
 */
export function validateChronologicalRouteTimes(
  departureTime?: string,
  finalArrivalTime?: string,
  stops?: any[]
): { valid: boolean; error?: string } {
  const startMins = parseTimeToMinutes(departureTime);
  let lastMins = startMins;

  if (Array.isArray(stops)) {
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (stop.isActive === false) continue;

      const arrMins = parseTimeToMinutes(stop.expectedArrival);
      const depMins = parseTimeToMinutes(stop.expectedDeparture);

      if (lastMins !== null && arrMins !== null) {
        if (arrMins < lastMins) {
          return {
            valid: false,
            error: `Stop times must follow the route sequence. Stop "${stop.name || `Stop ${i + 1}`}" arrival (${stop.expectedArrival}) cannot be earlier than previous departure.`,
          };
        }
      }

      if (arrMins !== null && depMins !== null) {
        if (depMins < arrMins) {
          return {
            valid: false,
            error: `Stop times must follow the route sequence. Stop "${stop.name || `Stop ${i + 1}`}" departure (${stop.expectedDeparture}) cannot be earlier than its arrival (${stop.expectedArrival}).`,
          };
        }
      }

      lastMins = depMins ?? arrMins ?? lastMins;
    }
  }

  if (finalArrivalTime && lastMins !== null) {
    const finalMins = parseTimeToMinutes(finalArrivalTime);
    if (finalMins !== null && finalMins < lastMins) {
      return {
        valid: false,
        error: `Stop times must follow the route sequence. Final destination arrival (${finalArrivalTime}) cannot be earlier than prior stop departures.`,
      };
    }
  }

  return { valid: true };
}

export const getRoutes = async (req: AuthRequest, res: Response) => {
  try {
    const partner = await LogisticsPartner.findOne({ userId: req.user?._id });
    const filter: any = { isActive: { $ne: false } };
    if (partner) {
      filter.partnerId = partner._id;
    }
    const routes = await PartnerRoute.find(filter)
      .populate('partnerId', 'businessName rating partnerCategory partnerType')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: routes.length, routes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRouteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const route = await PartnerRoute.findById(id).populate('partnerId', 'businessName rating partnerCategory partnerType');
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    return res.status(200).json({ success: true, route });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoute = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let partner = await LogisticsPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found. Please complete partner onboarding first.' });
    }

    const {
      routeTitle,
      sourceLocation,
      destinationLocation,
      waypoints = [],
      stops = [],
      scheduledFrequency = 'daily',
      departureTime = '08:00 AM',
      finalArrivalTime = '11:00 AM',
      travelDate = 'Today',
      vehicleType = 'Bike',
      partnerType,
      totalDistanceKm = 40,
      capacityKg = 50,
      pricePerKg = 10,
    } = req.body;

    const rawSrc = sourceLocation || req.body.sourceCity || req.body.originCity || req.body.origin;
    const rawDst = destinationLocation || req.body.destCity || req.body.destinationCity || req.body.destination;

    if (!rawSrc || !rawDst) {
      return res.status(400).json({
        success: false,
        message: 'Origin and Destination locations are required to create a corridor route.',
      });
    }

    const srcLoc = typeof rawSrc === 'string'
      ? { villageOrCity: rawSrc.trim(), addressLine: rawSrc.trim(), district: 'Regional', state: 'Bihar', pincode: '846001' }
      : {
          villageOrCity: rawSrc.villageOrCity || rawSrc.village || rawSrc.name || 'Origin',
          addressLine: rawSrc.addressLine || rawSrc.address || rawSrc.villageOrCity || rawSrc.name || 'Origin',
          district: rawSrc.district || 'Regional',
          state: rawSrc.state || 'Bihar',
          pincode: rawSrc.pincode || rawSrc.pinCode || '846001',
          landmark: rawSrc.landmark,
        };

    const dstLoc = typeof rawDst === 'string'
      ? { villageOrCity: rawDst.trim(), addressLine: rawDst.trim(), district: 'Regional', state: 'Bihar', pincode: '846002' }
      : {
          villageOrCity: rawDst.villageOrCity || rawDst.village || rawDst.name || 'Destination',
          addressLine: rawDst.addressLine || rawDst.address || rawDst.villageOrCity || rawDst.name || 'Destination',
          district: rawDst.district || 'Regional',
          state: rawDst.state || 'Bihar',
          pincode: rawDst.pincode || rawDst.pinCode || '846002',
          landmark: rawDst.landmark,
        };

    // Format stops
    const rawStops = Array.isArray(stops) ? stops : [];
    const formattedStops = rawStops.map((s: any, idx: number) => ({
      stopId: s.stopId || `STOP-${idx + 1}`,
      stopOrder: typeof s.stopOrder === 'number' ? s.stopOrder : idx + 1,
      name: (s.name || s.village || `Stop ${idx + 1}`).trim(),
      address: s.address || s.district || '',
      village: s.village || s.name || '',
      district: s.district || 'Regional',
      state: s.state || 'Bihar',
      pinCode: s.pinCode || s.pincode || '',
      landmark: s.landmark || '',
      latitude: typeof s.latitude === 'number' ? s.latitude : undefined,
      longitude: typeof s.longitude === 'number' ? s.longitude : undefined,
      expectedArrival: s.expectedArrival || '09:00 AM',
      expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:10 AM',
      waitingMinutes: Number(s.waitingMinutes) || 10,
      isActive: s.isActive !== false,
    }));

    // Chronological route time sequence validation (Section 8)
    const timeVal = validateChronologicalRouteTimes(
      departureTime || '08:00 AM',
      finalArrivalTime || '11:00 AM',
      formattedStops
    );
    if (!timeVal.valid) {
      return res.status(400).json({
        success: false,
        message: timeVal.error || 'Stop times must follow the route sequence.',
      });
    }

    const route = await PartnerRoute.create({
      partnerId: partner._id,
      routeTitle: routeTitle || `${srcLoc.villageOrCity} ➔ ${dstLoc.villageOrCity} Corridor`,
      sourceLocation: srcLoc,
      destinationLocation: dstLoc,
      waypoints,
      stops: formattedStops,
      partnerType: partnerType || partner.partnerCategory || 'transporter',
      scheduledFrequency,
      departureTime: departureTime || '08:00 AM',
      finalArrivalTime: finalArrivalTime || '11:00 AM',
      travelDate,
      vehicleType,
      totalDistanceKm: Number(totalDistanceKm) || 35,
      capacityKg: Number(capacityKg) || 50,
      availableCapacityKg: Number(capacityKg) || 50,
      pricePerKg: Number(pricePerKg) || 10,
      status: 'active',
      isActive: true,
    });

    // Auto-create matching LogisticsTrip so the route is immediately bookable
    try {
      const tripCode = `TRIP-${route._id.toString().slice(-6).toUpperCase()}`;
      const fromLoc = srcLoc?.villageOrCity || 'Origin';
      const toLoc = dstLoc?.villageOrCity || 'Destination';
      const scheduledStops = formattedStops.filter((s) => s.isActive !== false).map((s, idx) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        stopOrder: s.stopOrder || idx + 2,
        name: s.name,
        villageOrCity: s.village || s.name,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        expectedArrival: s.expectedArrival,
        expectedDeparture: s.expectedDeparture,
        waitingMinutes: s.waitingMinutes,
        status: 'UPCOMING' as const,
      }));

      await LogisticsTrip.create({
        tripId: tripCode,
        partnerId: partner._id,
        partnerName: partner.businessName || req.user.name,
        partnerMobile: partner.phone || req.user.phone || '9999900003',
        partnerType: partner.partnerCategory || 'PROFESSIONAL',
        transportType: vehicleType || partner.primaryTransportType || 'Bike',
        routeId: route._id,
        routeTitle: route.routeTitle,
        travelDate: travelDate && travelDate !== 'Daily Morning Commute' ? travelDate : 'Today',
        fromLocation: srcLoc,
        toLocation: dstLoc,
        startLocation: {
          name: fromLoc,
          villageOrCity: fromLoc,
          address: srcLoc?.addressLine || fromLoc,
          departureTime: departureTime || '08:00 AM',
          status: 'PENDING',
        },
        finalDestination: {
          name: toLoc,
          villageOrCity: toLoc,
          address: dstLoc?.addressLine || toLoc,
          expectedArrival: finalArrivalTime || '11:00 AM',
          status: 'UPCOMING',
        },
        waypoints: waypoints || [],
        stops: scheduledStops,
        departureTime: departureTime || '08:00 AM',
        expectedArrival: finalArrivalTime || '11:00 AM',
        tripStatus: 'SCHEDULED',
        totalCapacityKg: Number(capacityKg) || 50,
        availableCapacityKg: Number(capacityKg) || 50,
        pricePerKg: Number(pricePerKg) || 10,
        parcelIds: [],
        activeParcelCount: 0,
        notes: `Published from partner portal: ${route.routeTitle}`,
      });
    } catch (tripErr) {
      console.warn('Auto-create trip for partner route error (non-fatal):', tripErr);
    }

    const io = getIO();
    io?.emit('route:updated', { routeId: route._id, partnerId: partner._id });

    return res.status(201).json({ success: true, route });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoute = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const partner = await LogisticsPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found.' });
    }

    const route = await PartnerRoute.findOne({ _id: id, partnerId: partner._id });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    const {
      routeTitle,
      sourceLocation,
      destinationLocation,
      waypoints,
      stops,
      scheduledFrequency,
      departureTime,
      finalArrivalTime,
      travelDate,
      vehicleType,
      partnerType,
      totalDistanceKm,
      capacityKg,
      pricePerKg,
      status,
    } = req.body;

    if (sourceLocation || req.body.sourceCity) {
      const rawSrc = sourceLocation || req.body.sourceCity;
      route.sourceLocation = typeof rawSrc === 'string'
        ? { villageOrCity: rawSrc.trim(), addressLine: rawSrc.trim(), district: 'Regional', state: 'Bihar', pincode: '846001' }
        : {
            villageOrCity: rawSrc.villageOrCity || rawSrc.village || rawSrc.name || route.sourceLocation.villageOrCity,
            addressLine: rawSrc.addressLine || rawSrc.address || route.sourceLocation.addressLine,
            district: rawSrc.district || route.sourceLocation.district,
            state: rawSrc.state || route.sourceLocation.state || 'Bihar',
            pincode: rawSrc.pincode || rawSrc.pinCode || route.sourceLocation.pincode,
            landmark: rawSrc.landmark || route.sourceLocation.landmark,
          };
    }

    if (destinationLocation || req.body.destCity) {
      const rawDst = destinationLocation || req.body.destCity;
      route.destinationLocation = typeof rawDst === 'string'
        ? { villageOrCity: rawDst.trim(), addressLine: rawDst.trim(), district: 'Regional', state: 'Bihar', pincode: '846002' }
        : {
            villageOrCity: rawDst.villageOrCity || rawDst.village || rawDst.name || route.destinationLocation.villageOrCity,
            addressLine: rawDst.addressLine || rawDst.address || route.destinationLocation.addressLine,
            district: rawDst.district || route.destinationLocation.district,
            state: rawDst.state || route.destinationLocation.state || 'Bihar',
            pincode: rawDst.pincode || rawDst.pinCode || route.destinationLocation.pincode,
            landmark: rawDst.landmark || route.destinationLocation.landmark,
          };
    }

    if (departureTime !== undefined) route.departureTime = departureTime;
    if (finalArrivalTime !== undefined) route.finalArrivalTime = finalArrivalTime;
    if (travelDate !== undefined) route.travelDate = travelDate;
    if (vehicleType !== undefined) route.vehicleType = vehicleType;
    if (partnerType !== undefined) route.partnerType = partnerType;
    if (totalDistanceKm !== undefined) route.totalDistanceKm = Number(totalDistanceKm);
    if (capacityKg !== undefined) {
      route.capacityKg = Number(capacityKg);
      route.availableCapacityKg = Number(capacityKg);
    }
    if (pricePerKg !== undefined) route.pricePerKg = Number(pricePerKg);
    if (scheduledFrequency !== undefined) route.scheduledFrequency = scheduledFrequency;
    if (status !== undefined) route.status = status;
    if (waypoints !== undefined) route.waypoints = waypoints;

    // Process stops if provided
    if (Array.isArray(stops)) {
      const formattedStops = stops.map((s: any, idx: number) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        stopOrder: typeof s.stopOrder === 'number' ? s.stopOrder : idx + 1,
        name: (s.name || s.village || `Stop ${idx + 1}`).trim(),
        address: s.address || s.district || '',
        village: s.village || s.name || '',
        district: s.district || 'Regional',
        state: s.state || 'Bihar',
        pinCode: s.pinCode || s.pincode || '',
        landmark: s.landmark || '',
        latitude: typeof s.latitude === 'number' ? s.latitude : undefined,
        longitude: typeof s.longitude === 'number' ? s.longitude : undefined,
        expectedArrival: s.expectedArrival || '09:00 AM',
        expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:10 AM',
        waitingMinutes: Number(s.waitingMinutes) || 10,
        isActive: s.isActive !== false,
      }));

      // Validate chronological times
      const timeVal = validateChronologicalRouteTimes(
        route.departureTime,
        route.finalArrivalTime,
        formattedStops
      );
      if (!timeVal.valid) {
        return res.status(400).json({
          success: false,
          message: timeVal.error || 'Stop times must follow the route sequence.',
        });
      }

      route.stops = formattedStops as any;
    }

    if (routeTitle) {
      route.routeTitle = routeTitle;
    } else {
      route.routeTitle = `${route.sourceLocation.villageOrCity} ➔ ${route.destinationLocation.villageOrCity} Corridor`;
    }

    await route.save();

    // Synchronize corresponding scheduled trip
    try {
      const scheduledStops = (route.stops || []).filter((s: any) => s.isActive !== false).map((s: any, idx: number) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        stopOrder: s.stopOrder || idx + 2,
        name: s.name,
        villageOrCity: s.village || s.name,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        expectedArrival: s.expectedArrival,
        expectedDeparture: s.expectedDeparture,
        waitingMinutes: s.waitingMinutes,
        status: 'UPCOMING' as const,
      }));

      const trip = await LogisticsTrip.findOne({
        $or: [
          { routeId: route._id },
          { partnerId: partner._id, routeTitle: route.routeTitle },
        ],
        tripStatus: { $in: ['SCHEDULED', 'READY', 'MOVING'] },
      });

      if (trip) {
        trip.routeTitle = route.routeTitle;
        trip.departureTime = route.departureTime;
        trip.expectedArrival = route.finalArrivalTime || '11:00 AM';
        trip.fromLocation = route.sourceLocation;
        trip.toLocation = route.destinationLocation;
        trip.startLocation = {
          name: route.sourceLocation.villageOrCity,
          villageOrCity: route.sourceLocation.villageOrCity,
          address: route.sourceLocation.addressLine || route.sourceLocation.villageOrCity,
          departureTime: route.departureTime,
          status: trip.startLocation?.status || 'PENDING',
        };
        trip.finalDestination = {
          name: route.destinationLocation.villageOrCity,
          villageOrCity: route.destinationLocation.villageOrCity,
          address: route.destinationLocation.addressLine || route.destinationLocation.villageOrCity,
          expectedArrival: route.finalArrivalTime || '11:00 AM',
          status: trip.finalDestination?.status || 'UPCOMING',
        };
        trip.stops = scheduledStops as any;
        trip.totalCapacityKg = route.capacityKg;
        trip.availableCapacityKg = route.availableCapacityKg;
        trip.pricePerKg = route.pricePerKg;
        trip.transportType = (route.vehicleType as any) || trip.transportType;
        await trip.save();
      }
    } catch (tripSyncErr) {
      console.warn('Trip sync error after route update (non-fatal):', tripSyncErr);
    }

    const io = getIO();
    io?.emit('route:updated', { routeId: route._id, partnerId: partner._id });

    return res.status(200).json({ success: true, route });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoute = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const partner = await LogisticsPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found.' });
    }

    const route = await PartnerRoute.findOne({ _id: id, partnerId: partner._id });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    // Section 7 Requirement: Mark inactive for future trips instead of permanently deleting
    route.isActive = false;
    route.status = 'inactive';
    await route.save();

    await LogisticsTrip.updateMany(
      { routeId: route._id, tripStatus: 'SCHEDULED' },
      { $set: { tripStatus: 'CANCELLED' } }
    );

    const io = getIO();
    io?.emit('route:updated', { routeId: route._id, partnerId: partner._id });

    return res.status(200).json({ success: true, message: 'Route deactivated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const matchRoutes = async (req: AuthRequest, res: Response) => {
  try {
    const { origin, destination, weightKg } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'Origin and destination are required.' });
    }

    const matches = await RouteMatchingService.findMatchingRoutes(origin, destination, weightKg ? Number(weightKg) : 1);
    return res.status(200).json({ success: true, matchesCount: matches.length, matches });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLiveLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { latitude, longitude, trackingNumber } = req.body;

    await LogisticsPartner.findOneAndUpdate(
      { userId: req.user._id },
      {
        currentLocation: {
          latitude,
          longitude,
          lastUpdated: new Date(),
        },
      }
    );

    const io = getIO();
    if (io) {
      if (trackingNumber) {
        io.to(`parcel:${trackingNumber}`).emit('parcel:location', {
          latitude,
          longitude,
          partnerName: req.user.name,
          updatedAt: new Date(),
        });
      }
      io.emit('partner:global_location', {
        partnerId: req.user._id,
        partnerName: req.user.name,
        latitude,
        longitude,
      });
    }

    return res.status(200).json({ success: true, message: 'Location updated.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let partner = await LogisticsPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found. Please complete partner onboarding first.' });
    }

    const { vehicleType, registrationNumber, model, modelName, maxCapacityKg } = req.body;
    const vehicle = await Vehicle.create({
      partnerId: partner._id,
      vehicleType: vehicleType || 'Bike',
      registrationNumber: registrationNumber || `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      modelName: modelName || model || 'Hero Splendor / Standard Bike',
      maxCapacityKg: maxCapacityKg || 25,
    });

    partner.vehicleIds.push(vehicle._id as any);
    await partner.save();

    return res.status(201).json({ success: true, vehicle });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to ensure partner profile exists for authenticated user
 */
export const getOrCreatePartnerHelper = async (user: any) => {
  let partner = await LogisticsPartner.findOne({ userId: user._id });
  if (!partner && user.logisticsPartnerId) {
    partner = await LogisticsPartner.findById(user.logisticsPartnerId);
  }
  if (!partner) {
    const count = await LogisticsPartner.countDocuments();
    const partnerCode = `LP-${1000 + count + 1}`;
    partner = await LogisticsPartner.create({
      userId: user._id,
      partnerCode,
      businessName: user.name || 'LocalHaat Logistics Partner',
      phone: user.phone,
      email: user.email,
      partnerCategory: 'PROFESSIONAL',
      partnerType: 'transporter',
      partnerStatus: 'ONLINE',
      verificationStatus: 'VERIFIED',
      isActive: true,
      isOnline: true,
      isVerified: true,
      serviceAreas: ['Darbhanga', 'Madhubani', 'Samastipur', 'Muzaffarpur'],
      vehicleIds: [],
      rating: 5.0,
      totalTrips: 0,
      totalParcelsDelivered: 0,
      commissionRatePerKm: 1.5,
      baseDeliveryFee: 15,
      walletBalance: 0,
      totalEarnings: 0,
    });
    user.logisticsPartnerId = partner._id;
    await user.save();
  }
  return partner;
};

/**
 * Get Full Partner Profile with all sub-entities
 */
export const getPartnerFullProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const partner = await getOrCreatePartnerHelper(req.user);

    const [locations, shops, vehicles, drivers, routes, trips, documents, earnings, payouts] =
      await Promise.all([
        PartnerLocation.find({ partnerId: partner._id, isActive: true }).sort({ createdAt: -1 }),
        PartnerShop.find({ partnerId: partner._id, isActive: true }).sort({ createdAt: -1 }),
        Vehicle.find({ partnerId: partner._id, isActive: { $ne: false } }).sort({ createdAt: -1 }),
        PartnerDriver.find({ partnerId: partner._id, isActive: true }).sort({ createdAt: -1 }),
        PartnerRoute.find({ partnerId: partner._id, isActive: { $ne: false } }).sort({ createdAt: -1 }),
        LogisticsTrip.find({ partnerId: partner._id }).sort({ createdAt: -1 }).limit(20),
        KycDocument.find({ userId: req.user._id }).sort({ createdAt: -1 }),
        Earning.find({ actorId: req.user._id, actorType: 'PARTNER' }).sort({ createdAt: -1 }).limit(20),
        Payout.find({ partnerId: partner._id }).sort({ createdAt: -1 }).limit(20),
      ]);

    const totalEarnings = earnings.reduce((sum, e) => sum + (e.netAmount || 0), 0);

    return res.status(200).json({
      success: true,
      partner,
      user: {
        _id: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
        kycStatus: req.user.kycStatus,
      },
      locations,
      shops,
      vehicles,
      drivers,
      routes,
      trips,
      documents,
      earnings,
      payouts,
      stats: {
        totalEarnings,
        walletBalance: partner.walletBalance || 0,
        totalLocations: locations.length,
        totalShops: shops.length,
        totalVehicles: vehicles.length,
        totalDrivers: drivers.length,
        totalRoutes: routes.length,
        totalTrips: trips.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Partner Basic Profile Information
 */
export const updatePartnerProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const partner = await getOrCreatePartnerHelper(req.user);
    const {
      name,
      businessName,
      phone,
      email,
      address,
      primaryTransportType,
      partnerCategory,
      profilePhotoUrl,
      bankDetails,
    } = req.body;

    if (businessName) partner.businessName = businessName;
    if (phone) partner.phone = phone;
    if (email) partner.email = email;
    if (address) partner.address = address;
    if (primaryTransportType) partner.primaryTransportType = primaryTransportType;
    if (partnerCategory) partner.partnerCategory = partnerCategory;
    if (profilePhotoUrl) partner.profilePhotoUrl = profilePhotoUrl;
    if (bankDetails) partner.bankDetails = bankDetails;

    await partner.save();

    // Also update User record if name / email changed
    const user = await User.findById(req.user._id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (profilePhotoUrl) user.avatar = profilePhotoUrl;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      partner,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 1. PICKUP & DROP LOCATIONS CONTROLLERS
 * =========================================================================
 */

export const getPartnerLocations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const { type, includeInactive } = req.query;
    const filter: any = { partnerId: partner._id };

    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (type === 'pickup') {
      filter.isPickup = true;
    } else if (type === 'drop') {
      filter.isDrop = true;
    }

    const locations = await PartnerLocation.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: locations.length, locations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPartnerLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const {
      name,
      locationType,
      isPickup = true,
      isDrop = true,
      address,
      village,
      area,
      block,
      district,
      state = 'Bihar',
      pinCode,
      landmark,
      latitude,
      longitude,
      contactName,
      contactMobile,
    } = req.body;

    if (!name || !address || !district || !pinCode) {
      return res.status(400).json({
        success: false,
        message: 'Location Name, Address, District, and PIN code are required.',
      });
    }

    const location = await PartnerLocation.create({
      partnerId: partner._id,
      name: name.trim(),
      locationType: locationType || 'Pickup Point',
      isPickup: Boolean(isPickup),
      isDrop: Boolean(isDrop),
      address: address.trim(),
      village: village?.trim(),
      area: area?.trim(),
      block: block?.trim(),
      district: district.trim(),
      state: state.trim() || 'Bihar',
      pinCode: pinCode.trim(),
      landmark: landmark?.trim(),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      contactName: contactName?.trim(),
      contactMobile: contactMobile?.trim(),
      isActive: true,
    });

    await syncPartnerLocationCorridors(partner._id);

    return res.status(201).json({
      success: true,
      message: 'Location added successfully.',
      location,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartnerLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const location = await PartnerLocation.findOne({ _id: id, partnerId: partner._id });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const updatableFields = [
      'name',
      'locationType',
      'isPickup',
      'isDrop',
      'address',
      'village',
      'area',
      'block',
      'district',
      'state',
      'pinCode',
      'landmark',
      'latitude',
      'longitude',
      'contactName',
      'contactMobile',
      'isActive',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (location as any)[field] = req.body[field];
      }
    });

    await location.save();
    await syncPartnerLocationCorridors(partner._id);

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully.',
      location,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivatePartnerLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const location = await PartnerLocation.findOne({ _id: id, partnerId: partner._id });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    // Preserve historical logistics records: Soft delete
    location.isActive = false;
    await location.save();
    await syncPartnerLocationCorridors(partner._id);

    return res.status(200).json({
      success: true,
      message: 'Location deactivated successfully. Historical records preserved.',
      locationId: id,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 2. SHOPS / BUSINESS LOCATIONS CONTROLLERS
 * =========================================================================
 */

export const getPartnerShops = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const { includeInactive } = req.query;
    const filter: any = { partnerId: partner._id };
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    const shops = await PartnerShop.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: shops.length, shops });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPartnerShop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const {
      name,
      photo,
      ownerName,
      mobile,
      email,
      address,
      village,
      area,
      block,
      district,
      state = 'Bihar',
      pinCode,
      landmark,
      shopType = 'Logistics Point',
      openingTime = '08:00 AM',
      closingTime = '08:00 PM',
      availableDays,
      pickupAvailable = true,
      dropAvailable = true,
      parcelHoldingAvailable = true,
      holdingCapacity = '100 Parcels / 500 kg',
      latitude,
      longitude,
    } = req.body;

    if (!name || !ownerName || !mobile || !address || !village || !district || !pinCode) {
      return res.status(400).json({
        success: false,
        message: 'Shop Name, Owner Name, Mobile, Address, Village, District, and PIN code are required.',
      });
    }

    const shop = await PartnerShop.create({
      partnerId: partner._id,
      name: name.trim(),
      photo,
      ownerName: ownerName.trim(),
      mobile: mobile.trim(),
      email: email?.trim(),
      address: address.trim(),
      village: village.trim(),
      area: area?.trim(),
      block: block?.trim(),
      district: district.trim(),
      state: state.trim() || 'Bihar',
      pinCode: pinCode.trim(),
      landmark: landmark?.trim(),
      shopType,
      openingTime,
      closingTime,
      availableDays: Array.isArray(availableDays) ? availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      pickupAvailable: Boolean(pickupAvailable),
      dropAvailable: Boolean(dropAvailable),
      parcelHoldingAvailable: Boolean(parcelHoldingAvailable),
      holdingCapacity,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Shop / Business Location added successfully.',
      shop,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartnerShop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const shop = await PartnerShop.findOne({ _id: id, partnerId: partner._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    const updatableFields = [
      'name',
      'photo',
      'ownerName',
      'mobile',
      'email',
      'address',
      'village',
      'area',
      'block',
      'district',
      'state',
      'pinCode',
      'landmark',
      'shopType',
      'openingTime',
      'closingTime',
      'availableDays',
      'pickupAvailable',
      'dropAvailable',
      'parcelHoldingAvailable',
      'holdingCapacity',
      'latitude',
      'longitude',
      'isActive',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (shop as any)[field] = req.body[field];
      }
    });

    await shop.save();

    return res.status(200).json({
      success: true,
      message: 'Shop updated successfully.',
      shop,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivatePartnerShop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const shop = await PartnerShop.findOne({ _id: id, partnerId: partner._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    shop.isActive = false;
    await shop.save();

    return res.status(200).json({
      success: true,
      message: 'Shop deactivated successfully. Historical records preserved.',
      shopId: id,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 3. VEHICLES CONTROLLERS
 * =========================================================================
 */

export const getPartnerVehicles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const vehicles = await Vehicle.find({
      partnerId: partner._id,
      isActive: { $ne: false },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPartnerVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const {
      vehicleType,
      registrationNumber,
      modelName,
      maxCapacityKg,
      photoUrl,
      numberPlatePhotoUrl,
      rcDocUrl,
      driverId,
      driverName,
    } = req.body;

    if (!registrationNumber || !modelName) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle Registration Number and Model Name are required.',
      });
    }

    const reg = registrationNumber.trim().toUpperCase();

    // Check duplicate
    const existing = await Vehicle.findOne({ registrationNumber: reg });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with registration number ${reg} already exists.`,
      });
    }

    const vehicle = await Vehicle.create({
      partnerId: partner._id,
      vehicleType: vehicleType || 'Bike',
      registrationNumber: reg,
      modelName: modelName.trim(),
      maxCapacityKg: Number(maxCapacityKg) || 50,
      photoUrl,
      numberPlatePhotoUrl,
      rcDocUrl,
      driverId,
      driverName,
      isActive: true,
      currentStatus: 'available',
    });

    partner.vehicleIds.push(vehicle._id as any);
    await partner.save();

    // Also create KYC Document for Vehicle RC if uploaded
    if (rcDocUrl) {
      await KycDocument.create({
        userId: req.user._id,
        documentType: 'VEHICLE_RC',
        documentNumber: reg,
        documentUrl: rcDocUrl,
        verificationStatus: 'PENDING',
      });
    }

    if (photoUrl) {
      await KycDocument.create({
        userId: req.user._id,
        documentType: 'VEHICLE_PHOTO',
        documentNumber: reg,
        documentUrl: photoUrl,
        verificationStatus: 'PENDING',
      });
    }

    if (numberPlatePhotoUrl) {
      await KycDocument.create({
        userId: req.user._id,
        documentType: 'NUMBER_PLATE',
        documentNumber: reg,
        documentUrl: numberPlatePhotoUrl,
        verificationStatus: 'PENDING',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      vehicle,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartnerVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({ _id: id, partnerId: partner._id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const fields = [
      'vehicleType',
      'registrationNumber',
      'modelName',
      'maxCapacityKg',
      'photoUrl',
      'numberPlatePhotoUrl',
      'rcDocUrl',
      'driverId',
      'driverName',
      'currentStatus',
      'isActive',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (vehicle as any)[f] = req.body[f];
      }
    });

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      vehicle,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivatePartnerVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({ _id: id, partnerId: partner._id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    vehicle.isActive = false;
    vehicle.currentStatus = 'inactive';
    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle deactivated successfully. Historical transport records preserved.',
      vehicleId: id,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 4. DRIVERS CONTROLLERS
 * =========================================================================
 */

export const getPartnerDrivers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const drivers = await PartnerDriver.find({
      partnerId: partner._id,
      isActive: true,
    })
      .populate('assignedVehicleId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: drivers.length, drivers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPartnerDriver = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const {
      name,
      phone,
      aadhaarNumber,
      aadhaarDocUrl,
      licenseNumber,
      licenseDocUrl,
      photoUrl,
      assignedVehicleId,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Driver Name and Phone Number are required.',
      });
    }

    let assignedVehicleNumber = '';
    if (assignedVehicleId) {
      const v = await Vehicle.findById(assignedVehicleId);
      if (v) assignedVehicleNumber = v.registrationNumber;
    }

    const driver = await PartnerDriver.create({
      partnerId: partner._id,
      name: name.trim(),
      phone: phone.trim(),
      aadhaarNumber: aadhaarNumber?.trim(),
      aadhaarDocUrl,
      licenseNumber: licenseNumber?.trim(),
      licenseDocUrl,
      photoUrl,
      assignedVehicleId: assignedVehicleId || undefined,
      assignedVehicleNumber,
      status: 'active',
      isActive: true,
    });

    // If driver documents uploaded, store in KycDocument for auditing
    if (aadhaarDocUrl && aadhaarNumber) {
      await KycDocument.create({
        userId: req.user._id,
        documentType: 'DRIVER_AADHAAR',
        documentNumber: aadhaarNumber,
        documentUrl: aadhaarDocUrl,
        verificationStatus: 'PENDING',
      });
    }

    if (licenseDocUrl && licenseNumber) {
      await KycDocument.create({
        userId: req.user._id,
        documentType: 'DRIVER_DRIVING_LICENSE',
        documentNumber: licenseNumber,
        documentUrl: licenseDocUrl,
        verificationStatus: 'PENDING',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Driver added successfully.',
      driver,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartnerDriver = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const driver = await PartnerDriver.findOne({ _id: id, partnerId: partner._id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    const fields = [
      'name',
      'phone',
      'aadhaarNumber',
      'aadhaarDocUrl',
      'licenseNumber',
      'licenseDocUrl',
      'photoUrl',
      'assignedVehicleId',
      'status',
      'isActive',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (driver as any)[f] = req.body[f];
      }
    });

    if (req.body.assignedVehicleId) {
      const v = await Vehicle.findById(req.body.assignedVehicleId);
      if (v) driver.assignedVehicleNumber = v.registrationNumber;
    }

    await driver.save();

    return res.status(200).json({
      success: true,
      message: 'Driver updated successfully.',
      driver,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivatePartnerDriver = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;

    const driver = await PartnerDriver.findOne({ _id: id, partnerId: partner._id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    driver.isActive = false;
    driver.status = 'inactive';
    await driver.save();

    return res.status(200).json({
      success: true,
      message: 'Driver deactivated successfully. Historical assignments preserved.',
      driverId: id,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 5. TRIPS CONTROLLERS (Stop-by-Stop Route Connection)
 * =========================================================================
 */

export const getPartnerTrips = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const { status } = req.query;
    const filter: any = { partnerId: partner._id };

    if (status === 'active') {
      filter.tripStatus = { $in: ['MOVING', 'ARRIVED', 'READY'] };
    } else if (status === 'scheduled') {
      filter.tripStatus = 'SCHEDULED';
    } else if (status === 'completed') {
      filter.tripStatus = { $in: ['COMPLETED', 'CANCELLED'] };
    }

    const trips = await LogisticsTrip.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: trips.length, trips });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPartnerTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const {
      routeTitle,
      transportType,
      vehicleId,
      vehicleNumber,
      travelDate,
      departureTime,
      expectedArrival,
      startLocation,
      stops = [],
      finalDestination,
      totalCapacityKg,
      pricePerKg,
      notes,
    } = req.body;

    const tripCode = `LH-TRP-${Math.floor(10000 + Math.random() * 90000)}`;

    const fromLocName = startLocation?.name || startLocation?.villageOrCity || 'Origin';
    const toLocName = finalDestination?.name || finalDestination?.villageOrCity || 'Destination';

    const trip = await LogisticsTrip.create({
      tripId: tripCode,
      partnerId: partner._id,
      partnerName: partner.businessName || req.user.name,
      partnerMobile: partner.phone || req.user.phone,
      partnerType: partner.partnerCategory || 'PROFESSIONAL',
      transportType: transportType || partner.primaryTransportType || 'Bike',
      vehicleId,
      vehicleType: transportType || 'Bike',
      vehicleNumber,
      routeId: req.body.routeId,
      routeTitle: routeTitle || `${fromLocName} ➔ ${toLocName} Corridor Trip`,
      travelDate: travelDate || 'Today',
      startLocation: {
        name: fromLocName,
        villageOrCity: startLocation?.villageOrCity || fromLocName,
        address: startLocation?.address || fromLocName,
        district: startLocation?.district,
        latitude: startLocation?.latitude,
        longitude: startLocation?.longitude,
        departureTime: departureTime || '08:30 AM',
        status: 'PENDING',
      },
      finalDestination: {
        name: toLocName,
        villageOrCity: finalDestination?.villageOrCity || toLocName,
        address: finalDestination?.address || toLocName,
        district: finalDestination?.district,
        latitude: finalDestination?.latitude,
        longitude: finalDestination?.longitude,
        expectedArrival: expectedArrival || '12:00 PM',
        status: 'UPCOMING',
      },
      stops: stops.map((s: any, idx: number) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        stopOrder: idx + 1,
        name: s.name,
        villageOrCity: s.villageOrCity || s.name,
        address: s.address || s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        expectedArrival: s.expectedArrival || '10:00 AM',
        expectedDeparture: s.expectedDeparture || '10:15 AM',
        status: 'UPCOMING',
      })),
      fromLocation: {
        villageOrCity: fromLocName,
        addressLine: startLocation?.address,
      },
      toLocation: {
        villageOrCity: toLocName,
        addressLine: finalDestination?.address,
      },
      waypoints: [],
      departureTime: departureTime || '08:30 AM',
      expectedArrival: expectedArrival || '12:00 PM',
      tripStatus: 'SCHEDULED',
      totalCapacityKg: Number(totalCapacityKg) || 100,
      usedCapacityKg: 0,
      availableCapacityKg: Number(totalCapacityKg) || 100,
      parcelIds: [],
      activeParcelCount: 0,
      currentOperationalLocation: fromLocName,
      routeProgress: 0,
      estimatedEarnings: 0,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Trip created and scheduled successfully.',
      trip,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartnerTripStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);
    const { id } = req.params;
    const { tripStatus, currentOperationalLocation, routeProgress } = req.body;

    const trip = await LogisticsTrip.findOne({ _id: id, partnerId: partner._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (tripStatus) trip.tripStatus = tripStatus;
    if (currentOperationalLocation) trip.currentOperationalLocation = currentOperationalLocation;
    if (routeProgress !== undefined) trip.routeProgress = routeProgress;

    await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Trip status updated.',
      trip,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 6. DOCUMENTS & PAYOUTS CONTROLLERS
 * =========================================================================
 */

export const getPartnerDocuments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const documents = await KycDocument.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: documents.length, documents });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPartnerDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { documentType, documentNumber, documentUrl } = req.body;
    if (!documentType || !documentNumber || !documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'documentType, documentNumber, and documentUrl are required.',
      });
    }

    const doc = await KycDocument.create({
      userId: req.user._id,
      documentType,
      documentNumber,
      documentUrl,
      verificationStatus: 'PENDING',
    });

    return res.status(201).json({ success: true, message: 'Document submitted for verification.', document: doc });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPartnerPayout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const partner = await getOrCreatePartnerHelper(req.user);

    const { amount, paymentMode = 'BANK_TRANSFER' } = req.body;
    const reqAmount = Number(amount);

    if (!reqAmount || reqAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payout amount is required.' });
    }

    if (reqAmount > (partner.walletBalance || 0)) {
      return res.status(400).json({
        success: false,
        message: `Requested amount ₹${reqAmount} exceeds available balance ₹${partner.walletBalance || 0}`,
      });
    }

    partner.walletBalance -= reqAmount;
    partner.pendingPayouts = (partner.pendingPayouts || 0) + reqAmount;
    await partner.save();

    const payout = await Payout.create({
      partnerId: partner._id,
      userId: req.user._id,
      amount: reqAmount,
      status: 'PENDING',
      paymentMode,
      bankDetails: partner.bankDetails,
    });

    return res.status(201).json({
      success: true,
      message: `Payout request of ₹${reqAmount} submitted successfully.`,
      payout,
      remainingBalance: partner.walletBalance,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

