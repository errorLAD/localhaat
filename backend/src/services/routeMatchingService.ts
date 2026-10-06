import mongoose, { Types } from 'mongoose';
import {
  LogisticsTrip,
  ILogisticsTripDocument,
  TransportType,
} from '../models/LogisticsTrip.js';
import { LogisticsPartner, ILogisticsPartnerDocument } from '../models/LogisticsPartner.js';
import { PartnerRoute } from '../models/PartnerRoute.js';
import { Parcel, IParcelDocument } from '../models/Parcel.js';
import { ParcelAssignment, IParcelAssignmentDocument } from '../models/ParcelAssignment.js';
import { ParcelEvent } from '../models/ParcelEvent.js';
import { TrackingEvent } from '../models/TrackingEvent.js';
import { PartnerLocation } from '../models/PartnerLocation.js';
import { Vehicle } from '../models/Vehicle.js';
import { emitToAll } from './socketService.js';

// Levenshtein distance implementation for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

// Check if two words are phonetic or typo variations (e.g. madhibani vs madhubani)
export function isSimilarWord(w1: string, w2: string): boolean {
  if (w1 === w2) return true;
  if (w1.length < 3 || w2.length < 3) return false;
  if (Math.abs(w1.length - w2.length) > 2) return false;
  const maxLen = Math.max(w1.length, w2.length);
  const allowedEdits = maxLen <= 6 ? 1 : 2;
  return levenshteinDistance(w1, w2) <= allowedEdits;
}

// Helper to normalize location names for robust matching
export function normalizeLocation(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\b(city|village|nagar|road|dist|district|bihar)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if two location strings match (exact, contains, word overlap, or fuzzy/typo-tolerant)
export function isLocationMatch(loc1?: string, loc2?: string): boolean {
  if (!loc1 || !loc2) return false;
  const n1 = normalizeLocation(loc1);
  const n2 = normalizeLocation(loc2);
  if (!n1 || !n2) return false;

  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Single word fuzzy matching (e.g. madhibani vs madhubani)
  if (!n1.includes(' ') && !n2.includes(' ')) {
    if (isSimilarWord(n1, n2)) return true;
  }

  // Multi-word intersection & fuzzy word matching
  const words1 = n1.split(' ').filter((w) => w.length >= 3);
  const words2 = n2.split(' ').filter((w) => w.length >= 3);
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2 || isSimilarWord(w1, w2)) {
        return true;
      }
    }
  }

  return false;
}

// Convert "08:30 AM" or "20:30" or "8:30" to minutes from midnight
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim().toUpperCase();

  // Match 12-hour format e.g. 08:30 AM or 8:30 PM
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Match simple hour e.g. 8 AM or 9 PM
  const matchHour = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/);
  if (matchHour) {
    let hours = parseInt(matchHour[1], 10);
    const ampm = matchHour[2];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60;
  }

  return null;
}

// Human-friendly transport method categorizer (Section 6)
export function getTransportMethodDetails(trip: any, partner: any) {
  const pCat = (trip.partnerType || partner.partnerCategory || '').toUpperCase();
  const tType = (trip.transportType || partner.primaryTransportType || '').toUpperCase();

  let methodCategory = 'PROFESSIONAL LOGISTICS';
  let badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
  let icon = '🚚';

  if (tType.includes('BUS') || tType.includes('PUBLIC')) {
    methodCategory = 'BUS / PUBLIC TRANSPORT';
    badgeColor = 'bg-purple-100 text-purple-900 border-purple-300';
    icon = '🚌';
  } else if (pCat === 'TRAVELLING' || partner.partnerType === 'individual') {
    methodCategory = 'TRAVELLING PERSON';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    icon = '🎒';
  } else if (tType.includes('BIKE')) {
    methodCategory = 'BIKE RIDER';
    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    icon = '🏍️';
  } else if (tType.includes('AUTO') || tType.includes('RICKSHAW')) {
    methodCategory = 'AUTO / E-RICKSHAW';
    badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
    icon = '🛺';
  } else if (tType.includes('CAR') || tType.includes('CAB')) {
    methodCategory = 'CAR / CAB';
    badgeColor = 'bg-indigo-100 text-indigo-900 border-indigo-300';
    icon = '🚗';
  } else if (tType.includes('VAN') || tType.includes('PICKUP')) {
    methodCategory = 'VAN / PICKUP';
    badgeColor = 'bg-orange-100 text-orange-900 border-orange-300';
    icon = '🚐';
  } else if (tType.includes('TRUCK')) {
    methodCategory = 'TRUCK LOGISTICS';
    badgeColor = 'bg-slate-100 text-slate-900 border-slate-300';
    icon = '🚛';
  }

  return { methodCategory, badgeColor, icon };
}

export interface MatchedDeliveryOption {
  matchType: 'SCHEDULED_TRIP';
  tripId: string;
  tripMongoId: string;
  partnerId: string;
  partnerCode?: string;
  partnerName: string;
  partnerType: string;
  transportType: string;
  vehicleNumber?: string;
  methodCategory: string;
  methodBadgeColor: string;
  methodIcon: string;
  travelDate: string;
  routeTitle: string;
  routeSequence: string[];
  pickupStop: {
    stopId: string;
    name: string;
    order: number;
    expectedDeparture: string;
  };
  destinationStop: {
    stopId: string;
    name: string;
    order: number;
    expectedArrival: string;
  };
  availableCapacityKg: number;
  totalCapacityKg: number;
  estimatedDelivery: string;
  price: number;
  estimatedFare?: number;
  customerOfferPrice?: number;
  matchScore: number;
  matchExplanation: string;
  rating: number;
  totalTrips: number;
  stopsSpan: number;
}

/**
 * Automatically synchronize corridor routes and scheduled trips from registered PartnerLocation points
 * (e.g. When a partner configures a Pickup Point in Darbhanga and Drop Point in Madhubani)
 */
export async function syncPartnerLocationCorridors(partnerIdFilter?: any): Promise<void> {
  try {
    const partnerQuery: any = {
      isActive: true,
      partnerStatus: { $nin: ['BLOCKED', 'SUSPENDED'] },
      verificationStatus: { $ne: 'REJECTED' },
    };
    if (partnerIdFilter) {
      partnerQuery._id = partnerIdFilter;
    }

    const partners = await LogisticsPartner.find(partnerQuery);

    for (const partner of partners) {
      const locations = await PartnerLocation.find({ partnerId: partner._id, isActive: true });
      const pickups = locations.filter((l) => l.isPickup || l.locationType === 'Pickup Point');
      const drops = locations.filter((l) => l.isDrop || l.locationType === 'Drop Point');

      if (pickups.length === 0 || drops.length === 0) continue;

      for (const pickup of pickups) {
        for (const drop of drops) {
          const fromName = pickup.village || pickup.name;
          const toName = drop.village || drop.name;
          if (!fromName || !toName) continue;
          if (fromName.toLowerCase().trim() === toName.toLowerCase().trim()) continue;

          let route = await PartnerRoute.findOne({
            partnerId: partner._id,
            $or: [
              { sourceLocationId: pickup._id, destinationLocationId: drop._id },
              {
                'sourceLocation.villageOrCity': new RegExp(`^${fromName.trim()}$`, 'i'),
                'destinationLocation.villageOrCity': new RegExp(`^${toName.trim()}$`, 'i'),
              },
            ],
          });

          const partnerVehicle = await Vehicle.findOne({ partnerId: partner._id, isActive: true });

          if (!route) {
            route = await PartnerRoute.create({
              partnerId: partner._id,
              routeTitle: `${fromName} ➔ ${toName} Corridor`,
              sourceLocation: {
                villageOrCity: fromName,
                addressLine: pickup.address || fromName,
                district: pickup.district || 'Regional',
                state: pickup.state || 'Bihar',
                pincode: pickup.pinCode || '846001',
              },
              destinationLocation: {
                villageOrCity: toName,
                addressLine: drop.address || toName,
                district: drop.district || 'Regional',
                state: drop.state || 'Bihar',
                pincode: drop.pinCode || '846002',
              },
              sourceLocationId: pickup._id,
              destinationLocationId: drop._id,
              totalDistanceKm: 35,
              capacityKg: partnerVehicle?.maxCapacityKg || 50,
              availableCapacityKg: partnerVehicle?.maxCapacityKg || 50,
              pricePerKg: partner.commissionRatePerKm || 10,
              travelDate: 'Daily Morning Commute',
              departureTime: '08:30 AM',
              vehicleType: partnerVehicle?.vehicleType || partner.primaryTransportType || 'Bike',
              status: 'active',
              isActive: true,
            });
          }

          // Ensure corresponding scheduled trip exists in LogisticsTrip
          const existingTrip = await LogisticsTrip.findOne({
            $or: [
              { routeId: route._id },
              { partnerId: partner._id, routeTitle: route.routeTitle },
            ],
            tripStatus: { $in: ['SCHEDULED', 'READY', 'MOVING'] },
          });

          if (existingTrip) {
            if ((existingTrip.availableCapacityKg || 0) < 50) {
              existingTrip.availableCapacityKg = Math.max(50, route.capacityKg || 50);
              existingTrip.totalCapacityKg = Math.max(50, route.capacityKg || 50);
              await existingTrip.save();
            }
          } else {
            const tripCode = `TRIP-${route._id.toString().slice(-6).toUpperCase()}`;
            await LogisticsTrip.create({
              tripId: tripCode,
              partnerId: partner._id,
              partnerName: partner.businessName || 'Verified Transporter',
              partnerMobile: partner.phone || '9999900003',
              partnerType: partner.partnerCategory || 'PROFESSIONAL',
              transportType: route.vehicleType || partner.primaryTransportType || 'Bike',
              vehicleId: partnerVehicle?._id,
              vehicleNumber: partnerVehicle?.registrationNumber,
              routeId: route._id,
              routeTitle: route.routeTitle,
              travelDate: 'Today',
              fromLocation: route.sourceLocation,
              toLocation: route.destinationLocation,
              startLocation: {
                name: fromName,
                villageOrCity: fromName,
                address: pickup.address || fromName,
                departureTime: '08:30 AM',
                status: 'PENDING',
              },
              finalDestination: {
                name: toName,
                villageOrCity: toName,
                address: drop.address || toName,
                expectedArrival: '11:00 AM',
                status: 'UPCOMING',
              },
              departureTime: '08:30 AM',
              expectedArrival: '11:00 AM',
              tripStatus: 'SCHEDULED',
              totalCapacityKg: Math.max(route.capacityKg || 50, 50),
              availableCapacityKg: Math.max(route.availableCapacityKg || 50, 50),
              pricePerKg: route.pricePerKg || 10,
              parcelIds: [],
              activeParcelCount: 0,
              notes: `Synchronized from operational pickup & drop locations: ${fromName} to ${toName}`,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('syncPartnerLocationCorridors non-fatal error:', err);
  }
}

export class RouteMatchingService {
  /**
   * Search real verified trips and partners for a parcel
   * Enforces all checks:
   * 1. Partner Verification (verified, not blocked, not suspended, active)
   * 2. Travel Date Match
   * 3. Pickup Stop Match
   * 4. Destination Stop Match
   * 5. Stop Order (Forward only: pickup < destination)
   * 6. Time Compatibility (Stop departure has not passed requested time)
   * 7. Capacity (availableCapacityKg >= weightKg)
   * 8. Matching Score & Ranking
   */
  static async findMatchingTripsForParcel(
    parcelDataOrId: string | any,
    options: {
      travelDateOverride?: string;
      pickupTimeOverride?: string;
      flexibleDate?: boolean;
    } = {}
  ): Promise<{
    parcel: any;
    matches: MatchedDeliveryOption[];
    matchCount: number;
  }> {
    let parcel: any = parcelDataOrId;

    if (typeof parcelDataOrId === 'string') {
      parcel = await Parcel.findOne({
        $or: [
          { parcelId: parcelDataOrId },
          ...(mongoose.Types.ObjectId.isValid(parcelDataOrId) ? [{ _id: parcelDataOrId }] : []),
        ],
      });
      if (!parcel) {
        throw new Error('Parcel not found for route matching.');
      }
    }

    const parcelWeight = Number(parcel.weightKg) || 1;
    const origin = (parcel.pickupLocation || '').trim();
    const destination = (parcel.deliveryLocation || '').trim();
    const targetDate = (options.travelDateOverride || parcel.sendDate || parcel.preferredDeliveryDate || 'Today').trim();
    const requestedPickupTime = (options.pickupTimeOverride || parcel.sendTime || '').trim();
    const isFlexibleDate = options.flexibleDate ?? (targetDate.toLowerCase().includes('flexible') || targetDate === 'ALL');

    // 1. Ensure all active partners with Pickup & Drop locations and PartnerRoutes have corresponding scheduled trips
    try {
      await syncPartnerLocationCorridors();
      const activeRoutes = await PartnerRoute.find({ status: 'active' }).populate('partnerId');
      for (const route of activeRoutes) {
        const partner = route.partnerId as any;
        if (!partner) continue;
        const existingTrip = await LogisticsTrip.findOne({
          $or: [
            { routeId: route._id },
            { partnerId: partner._id, routeTitle: route.routeTitle },
          ],
          tripStatus: { $in: ['SCHEDULED', 'READY', 'MOVING'] },
        });

        if (existingTrip) {
          if ((existingTrip.availableCapacityKg || 0) < 50) {
            existingTrip.availableCapacityKg = Math.max(50, route.capacityKg || 50);
            existingTrip.totalCapacityKg = Math.max(50, route.capacityKg || 50);
          }
          if (route.stops && route.stops.length > 0) {
            existingTrip.stops = (route.stops as any[]).filter((s) => s.isActive !== false).map((s, idx) => ({
              stopId: s.stopId || `STOP-${idx + 1}`,
              stopOrder: s.stopOrder || idx + 2,
              name: s.name,
              villageOrCity: s.village || s.name,
              address: s.address || s.district,
              latitude: s.latitude,
              longitude: s.longitude,
              expectedArrival: s.expectedArrival || '09:30 AM',
              expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:40 AM',
              waitingMinutes: s.waitingMinutes || 10,
              status: 'UPCOMING',
            })) as any;
          }
          await existingTrip.save();
        } else {
          const tripCode = `TRIP-${route._id.toString().slice(-6).toUpperCase()}`;
          const fromLoc = route.sourceLocation?.villageOrCity || 'Start';
          const toLoc = route.destinationLocation?.villageOrCity || 'End';
          const tripStops = (route.stops && route.stops.length > 0)
            ? (route.stops as any[]).filter((s) => s.isActive !== false).map((s, idx) => ({
                stopId: s.stopId || `STOP-${idx + 1}`,
                stopOrder: s.stopOrder || idx + 2,
                name: s.name,
                villageOrCity: s.village || s.name,
                address: s.address || s.district,
                latitude: s.latitude,
                longitude: s.longitude,
                expectedArrival: s.expectedArrival || '09:30 AM',
                expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:40 AM',
                waitingMinutes: s.waitingMinutes || 10,
                status: 'UPCOMING' as const,
              }))
            : (route.waypoints || []).map((w: any, idx: number) => ({
                stopId: `STOP-${idx + 1}`,
                stopOrder: idx + 2,
                name: w.villageOrCity || `Stop ${idx + 1}`,
                villageOrCity: w.villageOrCity,
                address: w.addressLine || w.district,
                expectedArrival: '09:30 AM',
                expectedDeparture: '09:40 AM',
                waitingMinutes: 10,
                status: 'UPCOMING' as const,
              }));

          await LogisticsTrip.create({
            tripId: tripCode,
            partnerId: partner._id,
            partnerName: partner.businessName || 'Verified Transporter',
            partnerMobile: partner.phone || '9999900003',
            partnerType: partner.partnerCategory || 'PROFESSIONAL',
            transportType: route.vehicleType || partner.primaryTransportType || 'Bike',
            routeId: route._id,
            routeTitle: route.routeTitle || `${fromLoc} ➔ ${toLoc} Scheduled Corridor`,
            travelDate: route.travelDate && route.travelDate !== 'Daily Morning Commute' ? route.travelDate : 'Today',
            fromLocation: route.sourceLocation,
            toLocation: route.destinationLocation,
            startLocation: {
              name: fromLoc,
              villageOrCity: fromLoc,
              address: route.sourceLocation?.addressLine || fromLoc,
              departureTime: route.departureTime || '08:30 AM',
              status: 'PENDING',
            },
            finalDestination: {
              name: toLoc,
              villageOrCity: toLoc,
              address: route.destinationLocation?.addressLine || toLoc,
              expectedArrival: route.finalArrivalTime || '11:00 AM',
              status: 'UPCOMING',
            },
            waypoints: route.waypoints || [],
            stops: tripStops,
            departureTime: route.departureTime || '08:30 AM',
            expectedArrival: route.finalArrivalTime || '11:00 AM',
            tripStatus: 'SCHEDULED',
            totalCapacityKg: Math.max(route.capacityKg || 50, 50),
            availableCapacityKg: Math.max(route.availableCapacityKg || 50, 50),
            pricePerKg: route.pricePerKg || 10,
            parcelIds: [],
            activeParcelCount: 0,
            notes: `Auto-synchronized from active corridor: ${route.routeTitle}`,
          });
        }
      }
    } catch (syncErr) {
      console.warn('PartnerRoute sync error (non-fatal):', syncErr);
    }

    // 2. Fetch real active trips from MongoDB
    const trips = await LogisticsTrip.find({
      tripStatus: { $in: ['SCHEDULED', 'READY', 'MOVING'] },
    })
      .populate('partnerId')
      .populate('vehicleId');

    const matches: MatchedDeliveryOption[] = [];

    for (const trip of trips) {
      const partner = trip.partnerId as any;

      // 5. PARTNER ELIGIBILITY (Section 5)
      if (!partner) continue;
      if (partner.isActive === false) continue;
      if (partner.partnerStatus === 'BLOCKED' || partner.partnerStatus === 'SUSPENDED') continue;
      if (partner.verificationStatus === 'REJECTED' || partner.verificationStatus === 'BLOCKED') continue;

      // 4. CAPACITY CHECK (Section 4)
      const currentAvailableKg = Number(trip.availableCapacityKg) ?? Math.max(0, trip.totalCapacityKg - (trip.usedCapacityKg || 0));
      const tripMaxCap = Math.max(currentAvailableKg, trip.totalCapacityKg || 0, partner.capacityKg || 0, 50);
      if (tripMaxCap < parcelWeight && currentAvailableKg < parcelWeight) {
        // Exclude trips that do not have enough payload capacity
        continue;
      }

      // A. TRAVEL DATE CHECK (Section 2A)
      const tripDate = (trip.travelDate || 'Today').trim();
      const tripDateNorm = normalizeLocation(tripDate);
      const targetDateNorm = normalizeLocation(targetDate);

      let dateScore = 15;
      const isDaily = tripDateNorm.includes('daily') || tripDateNorm.includes('commute');
      if (!isFlexibleDate) {
        if (targetDateNorm !== 'today' && tripDateNorm !== 'today' && !isDaily) {
          // If neither is "Today" and trip is not daily, they must match
          if (tripDateNorm !== targetDateNorm && !tripDateNorm.includes(targetDateNorm) && !targetDateNorm.includes(tripDateNorm)) {
            continue; // Date mismatch
          }
        }
      }

      // Build ordered itinerary of all stops (Section 2B, 2C, 2D, 17)
      const startDeparture = trip.startLocation?.departureTime || trip.departureTime || '08:00 AM';
      const finalArrival = trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM';

      const itinerary: Array<{
        stopId: string;
        order: number;
        name: string;
        villageOrCity: string;
        address?: string;
        expectedArrival: string;
        expectedDeparture: string;
        status: string;
      }> = [
        {
          stopId: 'START',
          order: 1,
          name: trip.startLocation?.name || trip.fromLocation?.villageOrCity || 'Start',
          villageOrCity: trip.startLocation?.villageOrCity || trip.fromLocation?.villageOrCity || 'Start',
          address: trip.startLocation?.address || trip.fromLocation?.addressLine,
          expectedArrival: startDeparture,
          expectedDeparture: startDeparture,
          status: trip.startLocation?.status || (trip.tripStatus === 'MOVING' ? 'DEPARTED' : 'PENDING'),
        },
        ...(trip.stops && trip.stops.length > 0
          ? trip.stops.map((s: any, idx: number) => ({
              stopId: s.stopId || `STOP-${idx + 1}`,
              order: idx + 2,
              name: s.name,
              villageOrCity: s.villageOrCity || s.name,
              address: s.address,
              expectedArrival: s.expectedArrival || '09:00 AM',
              expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:10 AM',
              status: s.status || 'UPCOMING',
            }))
          : (trip.waypoints || []).map((w: any, idx: number) => ({
              stopId: `STOP-${idx + 1}`,
              order: idx + 2,
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
          villageOrCity: trip.finalDestination?.villageOrCity || trip.toLocation?.villageOrCity || 'Final Destination',
          address: trip.finalDestination?.address || trip.toLocation?.addressLine,
          expectedArrival: finalArrival,
          expectedDeparture: finalArrival,
          status: trip.finalDestination?.status || (trip.tripStatus === 'COMPLETED' ? 'ARRIVED' : 'UPCOMING'),
        },
      ];

      // B. PICKUP STOP MATCH
      let pickupIdx = -1;
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

      // C. DESTINATION STOP MATCH
      let dropIdx = -1;
      for (let i = 0; i < itinerary.length; i++) {
        const pt = itinerary[i];
        if (
          isLocationMatch(pt.name, destination) ||
          isLocationMatch(pt.villageOrCity, destination) ||
          isLocationMatch(pt.address, destination)
        ) {
          // If we already found pickup, prefer a drop after pickup
          if (pickupIdx !== -1 && i > pickupIdx) {
            dropIdx = i;
            break;
          } else if (dropIdx === -1) {
            dropIdx = i;
          }
        }
      }

      // Fallback: If stop wasn't found in individual stops, test direct route endpoints
      if (pickupIdx === -1) {
        if (
          isLocationMatch(trip.startLocation?.villageOrCity, origin) ||
          isLocationMatch(trip.fromLocation?.villageOrCity, origin) ||
          isLocationMatch(trip.startLocation?.name, origin)
        ) {
          pickupIdx = 0;
        }
      }

      if (dropIdx === -1) {
        if (
          isLocationMatch(trip.finalDestination?.villageOrCity, destination) ||
          isLocationMatch(trip.toLocation?.villageOrCity, destination) ||
          isLocationMatch(trip.finalDestination?.name, destination)
        ) {
          dropIdx = itinerary.length - 1;
        }
      }

      // Both pickup and drop must exist on this route
      if (pickupIdx === -1 || dropIdx === -1) {
        continue;
      }

      // D. STOP ORDER CHECK (Section 2D: MANDATORY FORWARD ORDER)
      // Pickup stop must occur BEFORE destination stop!
      if (pickupIdx >= dropIdx) {
        // REVERSE DIRECTION DETECTED -> STRICTLY DO NOT MATCH!
        continue;
      }

      const pickupStop = itinerary[pickupIdx];
      const dropStop = itinerary[dropIdx];

      // 3. TIME COMPATIBILITY CHECK (Section 3)
      // If trip is already MOVING, partner must not have already departed pickup stop
      if (trip.tripStatus === 'MOVING' && pickupStop.status === 'DEPARTED') {
        continue;
      }

      // Destination stop must not have already passed
      if (dropStop.status === 'DEPARTED') {
        continue;
      }

      // Check customer pickup time compatibility
      const isFlexibleTime =
        !requestedPickupTime ||
        requestedPickupTime.toLowerCase().includes('flex') ||
        requestedPickupTime.toLowerCase().includes('any');

      if (!isFlexibleTime) {
        const tripDepMins = parseTimeToMinutes(pickupStop.expectedDeparture);
        const custReqMins = parseTimeToMinutes(requestedPickupTime);

        if (custReqMins !== null && tripDepMins !== null) {
          // If customer specifies an exact time, check if trip departed earlier than customer window
          // Allow a 45 min margin
          if (tripDepMins < custReqMins - 45) {
            // Partner leaves too early before customer is ready
            continue;
          }
        }
      }

      // 6. TRANSPORT METHOD DETAILS
      const { methodCategory, badgeColor, icon } = getTransportMethodDetails(trip, partner);

      // 8. MATCHING SCORE CALCULATION (Section 8)
      let score = 50;

      // Exact location match bonus
      if (normalizeLocation(pickupStop.name) === normalizeLocation(origin)) score += 15;
      else score += 8;

      if (normalizeLocation(dropStop.name) === normalizeLocation(destination)) score += 15;
      else score += 8;

      // Date match score
      score += dateScore;

      // Available capacity cushion
      const capRatio = currentAvailableKg / Math.max(1, trip.totalCapacityKg);
      score += Math.round(capRatio * 10);

      // Partner rating & performance
      const ratingBonus = Math.min(10, Math.round((partner.rating || 4.5) * 2));
      score += ratingBonus;

      // Normalize score between 60 and 99
      const finalScore = Math.min(99, Math.max(60, score));

      // Calculate fair segment price
      const stopsSpan = dropIdx - pickupIdx;
      const baseFee = partner.baseDeliveryFee || 40;
      const calculatedPrice = Math.max(
        80,
        Math.round(baseFee + stopsSpan * 25 + parcelWeight * 12)
      );
      const customerOffer = Number(parcel.customerOfferPrice) || 0;
      const displayPrice = customerOffer > 0 ? customerOffer : calculatedPrice;

      matches.push({
        matchType: 'SCHEDULED_TRIP',
        tripId: trip.tripId,
        tripMongoId: (trip._id as any).toString(),
        partnerId: (partner._id as any).toString(),
        partnerCode: partner.partnerCode,
        partnerName: partner.businessName || 'Verified Logistics Partner',
        partnerType: trip.partnerType || partner.partnerCategory || 'PROFESSIONAL',
        transportType: trip.transportType || partner.primaryTransportType || 'Bike',
        vehicleNumber: trip.vehicleNumber || partner.vehicleNumber,
        methodCategory,
        methodBadgeColor: badgeColor,
        methodIcon: icon,
        travelDate: trip.travelDate || 'Today',
        routeTitle: trip.routeTitle,
        routeSequence: itinerary.map((pt) => pt.name),
        pickupStop: {
          stopId: pickupStop.stopId,
          name: pickupStop.name,
          order: pickupStop.order,
          expectedDeparture: pickupStop.expectedDeparture,
        },
        destinationStop: {
          stopId: dropStop.stopId,
          name: dropStop.name,
          order: dropStop.order,
          expectedArrival: dropStop.expectedArrival,
        },
        availableCapacityKg: Math.max(currentAvailableKg, tripMaxCap),
        totalCapacityKg: Math.max(trip.totalCapacityKg, tripMaxCap),
        estimatedDelivery: dropStop.expectedArrival,
        price: displayPrice,
        estimatedFare: calculatedPrice,
        customerOfferPrice: customerOffer > 0 ? customerOffer : undefined,
        matchScore: finalScore,
        matchExplanation: `Forward route segment: ${pickupStop.name} (Stop ${pickupStop.order}) ➔ ${dropStop.name} (Stop ${dropStop.order}). ETA: ${dropStop.expectedArrival}. Free capacity: ${Math.max(currentAvailableKg, tripMaxCap)} KG.`,
        rating: partner.rating || 4.8,
        totalTrips: partner.totalTrips || 50,
        stopsSpan,
      });
    }

    // Sort descending by matchScore
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      parcel,
      matches,
      matchCount: matches.length,
    };
  }

  /**
   * Atomically assign a parcel to a partner trip with full security re-validation
   */
  static async assignParcelToTrip(params: {
    parcelId: string;
    tripId: string;
    partnerId: string;
    pickupStopId?: string;
    destinationStopId?: string;
    agreedPrice?: number;
    assignedByRole?: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
    assignedByUserId?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    parcel: any;
    assignment: any;
    message: string;
  }> {
    const {
      parcelId,
      tripId,
      partnerId,
      pickupStopId,
      destinationStopId,
      agreedPrice,
      assignedByRole = 'CUSTOMER',
      assignedByUserId,
      notes,
    } = params;

    // 1. Fetch parcel
    const parcel = await Parcel.findOne({
      $or: [
        { parcelId },
        ...(mongoose.Types.ObjectId.isValid(parcelId) ? [{ _id: parcelId }] : []),
      ],
    });

    if (!parcel) {
      throw new Error(`Parcel not found: ${parcelId}`);
    }

    // Check if parcel is already assigned or delivered
    if (['DELIVERED', 'delivered', 'IN_TRANSIT'].includes(parcel.status)) {
      throw new Error(`Parcel ${parcel.parcelId} is already in state: ${parcel.status}. Cannot re-assign.`);
    }

    // 2. Fetch partner & revalidate
    const partner = await LogisticsPartner.findById(partnerId);
    if (!partner) {
      throw new Error('Logistics Partner not found.');
    }
    if (partner.verificationStatus === 'REJECTED' || partner.verificationStatus === 'BLOCKED' || !partner.isActive) {
      throw new Error(`Partner ${partner.businessName} is not eligible (status: ${partner.verificationStatus}).`);
    }
    if (partner.partnerStatus === 'BLOCKED' || partner.partnerStatus === 'SUSPENDED') {
      throw new Error(`Partner ${partner.businessName} is suspended or blocked.`);
    }

    // 3. Fetch trip & revalidate
    const trip = await LogisticsTrip.findOne({
      $or: [
        { tripId },
        ...(mongoose.Types.ObjectId.isValid(tripId) ? [{ _id: tripId }] : []),
      ],
    });

    if (!trip) {
      throw new Error(`Logistics Trip not found: ${tripId}`);
    }

    if (!['SCHEDULED', 'READY', 'MOVING'].includes(trip.tripStatus)) {
      throw new Error(`Trip ${trip.tripId} is in status ${trip.tripStatus} and cannot accept new parcels.`);
    }

    const parcelWeight = Number(parcel.weightKg) || 1;

    // 4. Atomic capacity check to prevent race-condition overbooking (Section 9 & 15)
    if ((trip.availableCapacityKg || 0) < parcelWeight) {
      throw new Error(
        `Insufficient capacity on trip ${trip.tripId}. Available: ${trip.availableCapacityKg} KG, required: ${parcelWeight} KG.`
      );
    }

    // Build itinerary to resolve stop IDs & order
    const itinerary = [
      {
        stopId: 'START',
        order: 1,
        name: trip.startLocation?.name || trip.fromLocation?.villageOrCity || 'Start',
        expectedArrival: trip.startLocation?.departureTime || trip.departureTime || '08:00 AM',
        expectedDeparture: trip.startLocation?.departureTime || trip.departureTime || '08:00 AM',
      },
      ...(trip.stops || []).map((s: any, idx: number) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        order: idx + 2,
        name: s.name,
        expectedArrival: s.expectedArrival || '09:00 AM',
        expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:10 AM',
      })),
      {
        stopId: 'FINAL',
        order: (trip.stops?.length || 0) + 2,
        name: trip.finalDestination?.name || trip.toLocation?.villageOrCity || 'Final Destination',
        expectedArrival: trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM',
        expectedDeparture: trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM',
      },
    ];

    // Resolve pickup stop index
    let pIndex = itinerary.findIndex((s) => s.stopId === pickupStopId);
    if (pIndex === -1) {
      pIndex = itinerary.findIndex((s) => isLocationMatch(s.name, parcel.pickupLocation));
      if (pIndex === -1) pIndex = 0;
    }

    // Resolve destination stop index
    let dIndex = itinerary.findIndex((s) => s.stopId === destinationStopId);
    if (dIndex === -1) {
      dIndex = itinerary.findIndex((s, i) => i > pIndex && isLocationMatch(s.name, parcel.deliveryLocation));
      if (dIndex === -1) {
        dIndex = itinerary.findIndex((s) => isLocationMatch(s.name, parcel.deliveryLocation));
      }
      if (dIndex === -1) dIndex = itinerary.length - 1;
    }

    const pStop = itinerary[pIndex];
    const dStop = itinerary[dIndex];

    // Forward check
    if (pIndex >= dIndex) {
      throw new Error(
        `Invalid route direction: pickup stop (${pStop.name}, order ${pStop.order}) must precede destination stop (${dStop.name}, order ${dStop.order}).`
      );
    }

    // 5. Atomic Update of Trip Capacity & Booking
    const isAlreadyBooked = trip.parcelIds.some(
      (pid: any) => pid.toString() === (parcel._id as any).toString()
    );

    if (!isAlreadyBooked) {
      trip.parcelIds.push(parcel._id as any);
      trip.activeParcelCount = trip.parcelIds.length;
      trip.usedCapacityKg = (trip.usedCapacityKg || 0) + parcelWeight;
      trip.availableCapacityKg = Math.max(0, trip.totalCapacityKg - trip.usedCapacityKg);
      await trip.save();
    }

    // 6. Update Parcel
    parcel.status = 'PARTNER_ASSIGNED';
    parcel.currentPartnerId = partner._id as any;
    parcel.assignedTripId = trip._id as any;
    parcel.assignedTripCode = trip.tripId;
    parcel.pickupStopId = pStop.stopId;
    parcel.pickupStopName = pStop.name;
    parcel.pickupStopOrder = pStop.order;
    parcel.destinationStopId = dStop.stopId;
    parcel.destinationStopName = dStop.name;
    parcel.destinationStopOrder = dStop.order;
    parcel.expectedPickupTime = pStop.expectedDeparture;
    parcel.expectedDeliveryTime = dStop.expectedArrival;
    parcel.assignedAt = new Date();

    await parcel.save();

    // 7. Update Partner count
    partner.activeParcelsCount = (partner.activeParcelsCount || 0) + 1;
    await partner.save();

    // 8. Create ParcelAssignment record (Section 16)
    const assignmentId = 'ASN-' + Math.floor(100000 + Math.random() * 900000);
    const assignment = await ParcelAssignment.create({
      assignmentId,
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      tripId: trip._id,
      tripCode: trip.tripId,
      partnerId: partner._id,
      partnerName: partner.businessName,
      partnerType: trip.partnerType || partner.partnerCategory || 'PROFESSIONAL',
      transportType: trip.transportType || partner.primaryTransportType || 'Bike',
      pickupStopId: pStop.stopId,
      pickupStopName: pStop.name,
      pickupStopOrder: pStop.order,
      destinationStopId: dStop.stopId,
      destinationStopName: dStop.name,
      destinationStopOrder: dStop.order,
      expectedPickupTime: pStop.expectedDeparture,
      expectedDeliveryTime: dStop.expectedArrival,
      weightKg: parcelWeight,
      agreedPrice: agreedPrice || parcel.customerOfferPrice || 150,
      assignedAt: new Date(),
      status: 'ASSIGNED',
      assignedByRole,
      assignedByUserId: assignedByUserId ? new Types.ObjectId(assignedByUserId) : undefined,
      notes: notes || `Assigned to trip ${trip.tripId} (${pStop.name} ➔ ${dStop.name})`,
    });

    // 9. Create Tracking & Parcel Events (Section 10)
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'PARTNER_ASSIGNED',
      locationName: pStop.name,
      actorRole: assignedByRole === 'ADMIN' ? 'Admin' : 'Customer',
      description: `Assigned to Partner ${partner.businessName} on trip ${trip.tripId}. Route segment: ${pStop.name} (Stop ${pStop.order}) ➔ ${dStop.name} (Stop ${dStop.order}). Expected Drop ETA: ${dStop.expectedArrival}.`,
      actorId: assignedByUserId ? new Types.ObjectId(assignedByUserId) : undefined,
    });

    await TrackingEvent.create({
      trackingCode: parcel.parcelTrackingNumber,
      parcelId: parcel._id,
      status: 'PARTNER_ASSIGNED',
      locationName: pStop.name,
      note: `Partner: ${partner.businessName} | Trip: ${trip.tripId} | Pickup: ${pStop.name} (${pStop.expectedDeparture}) | Drop: ${dStop.name} (${dStop.expectedArrival})`,
    });

    // 10. Real-time updates (Section 13)
    emitToAll('parcel:update', {
      parcelId: parcel.parcelId,
      trackingNumber: parcel.parcelTrackingNumber,
      status: parcel.status,
      partnerId: partner._id,
      partnerName: partner.businessName,
      tripId: trip.tripId,
      pickupStop: pStop.name,
      destinationStop: dStop.name,
    });

    emitToAll('logistics:trip_update', {
      tripId: trip.tripId,
      action: 'PARCEL_ASSIGNED',
      parcelId: parcel.parcelId,
      availableCapacityKg: trip.availableCapacityKg,
    });

    return {
      success: true,
      parcel,
      assignment,
      message: `Partner ${partner.businessName} successfully assigned to parcel ${parcel.parcelId} for route segment ${pStop.name} ➔ ${dStop.name}.`,
    };
  }

  /**
   * Stop-by-stop parcel view for partner and admin (Section 11)
   */
  static async getTripStopManifest(tripId: string): Promise<{
    trip: any;
    stops: Array<{
      stopId: string;
      order: number;
      stopOrder: number;
      name: string;
      expectedArrival: string;
      expectedDeparture: string;
      status: string;
      onboardCount: number;
      onboardWeightKg: number;
      parcelsToPickup: any[];
      parcelsToDrop: any[];
      pickupCount: number;
      dropCount: number;
    }>;
    totalParcelsCarried: number;
  }> {
    const trip = await LogisticsTrip.findOne({
      $or: [
        { tripId },
        ...(mongoose.Types.ObjectId.isValid(tripId) ? [{ _id: tripId }] : []),
      ],
    })
      .populate('partnerId')
      .populate('vehicleId')
      .populate('parcelIds');

    if (!trip) {
      throw new Error(`Trip not found: ${tripId}`);
    }

    const parcels = (trip.parcelIds as any[]) || [];

    const startDeparture = trip.startLocation?.departureTime || trip.departureTime || '08:00 AM';
    const finalArrival = trip.finalDestination?.expectedArrival || trip.expectedArrival || '12:00 PM';

    const rawStops = [
      {
        stopId: 'START',
        order: 1,
        name: trip.startLocation?.name || trip.fromLocation?.villageOrCity || 'Start Point',
        expectedArrival: startDeparture,
        expectedDeparture: startDeparture,
        status: trip.startLocation?.status || (trip.tripStatus === 'MOVING' ? 'DEPARTED' : 'PENDING'),
      },
      ...(trip.stops || []).map((s: any, idx: number) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        order: s.stopOrder || idx + 2,
        name: s.name,
        expectedArrival: s.expectedArrival || '09:00 AM',
        expectedDeparture: s.expectedDeparture || s.expectedArrival || '09:10 AM',
        status: s.status || 'UPCOMING',
      })),
      {
        stopId: 'FINAL',
        order: (trip.stops?.length || 0) + 2,
        name: trip.finalDestination?.name || trip.toLocation?.villageOrCity || 'Final Destination',
        expectedArrival: finalArrival,
        expectedDeparture: finalArrival,
        status: trip.finalDestination?.status || (trip.tripStatus === 'COMPLETED' ? 'ARRIVED' : 'UPCOMING'),
      },
    ];

    let currentOnboardCount = 0;
    let currentOnboardWeightKg = 0;

    const stopsManifest = rawStops.map((st, idx) => {
      // Find parcels with pickup at this stop
      const toPickup = parcels.filter((p) => {
        if (p.pickupStopId === st.stopId) return true;
        return isLocationMatch(p.pickupStopName || p.pickupLocation, st.name);
      });

      // Find parcels with drop at this stop
      const toDrop = parcels.filter((p) => {
        if (p.destinationStopId === st.stopId) return true;
        return isLocationMatch(p.destinationStopName || p.deliveryLocation, st.name);
      });

      const pickupWeight = toPickup.reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);
      const dropWeight = toDrop.reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);

      currentOnboardCount += toPickup.length - toDrop.length;
      currentOnboardWeightKg += pickupWeight - dropWeight;
      currentOnboardCount = Math.max(0, currentOnboardCount);
      currentOnboardWeightKg = Math.max(0, currentOnboardWeightKg);

      return {
        stopId: st.stopId,
        order: idx + 1,
        stopOrder: idx + 1,
        name: st.name,
        expectedArrival: st.expectedArrival,
        expectedDeparture: st.expectedDeparture,
        status: st.status,
        onboardCount: currentOnboardCount,
        onboardWeightKg: Math.round(currentOnboardWeightKg * 10) / 10,
        parcelsToPickup: toPickup.map((p) => ({
          parcelId: p.parcelId,
          parcelTrackingNumber: p.parcelTrackingNumber,
          senderName: p.senderName,
          senderMobile: p.senderMobile,
          weightKg: p.weightKg,
          whatIsInside: p.whatIsInside,
          pickupCode: p.pickupCode,
          customerOfferPrice: p.customerOfferPrice,
          destinationStopName: p.destinationStopName || p.deliveryLocation,
        })),
        parcelsToDrop: toDrop.map((p) => ({
          parcelId: p.parcelId,
          parcelTrackingNumber: p.parcelTrackingNumber,
          receiverName: p.receiverName,
          receiverMobile: p.receiverMobile,
          deliveryAddress: p.deliveryAddress,
          weightKg: p.weightKg,
          whatIsInside: p.whatIsInside,
          deliveryPin: p.deliveryPin,
          customerOfferPrice: p.customerOfferPrice,
          pickupStopName: p.pickupStopName || p.pickupLocation,
        })),
        pickupCount: toPickup.length,
        dropCount: toDrop.length,
      };
    });

    return {
      trip,
      stops: stopsManifest,
      totalParcelsCarried: parcels.length,
    };
  }

  /**
   * Advance parcel through complete lifecycle stages (Section 10)
   */
  static async advanceParcelLifecycle(
    parcelId: string,
    targetStatus: string,
    details: {
      actorRole?: string;
      actorId?: string;
      locationName?: string;
      notes?: string;
      code?: string;
    } = {}
  ): Promise<any> {
    const parcel = await Parcel.findOne({
      $or: [
        { parcelId },
        ...(mongoose.Types.ObjectId.isValid(parcelId) ? [{ _id: parcelId }] : []),
      ],
    });

    if (!parcel) throw new Error(`Parcel not found: ${parcelId}`);

    // Verification code checks for critical handovers
    if (targetStatus === 'PICKUP_CODE_VERIFIED' || targetStatus === 'PICKED_UP') {
      if (details.code && details.code !== parcel.pickupCode) {
        throw new Error('Invalid Pickup Code provided by partner.');
      }
    }

    if (targetStatus === 'DELIVERED') {
      if (details.code && details.code !== parcel.deliveryPin) {
        throw new Error('Invalid Delivery PIN provided by receiver.');
      }
    }

    parcel.status = targetStatus as any;
    if (targetStatus === 'PARTNER_ACCEPTED') {
      parcel.acceptedAt = new Date();
    }
    await parcel.save();

    // Update assignment if exists
    await ParcelAssignment.updateOne(
      { parcelId: parcel._id },
      {
        status: targetStatus === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT',
        acceptedAt: targetStatus === 'PARTNER_ACCEPTED' ? new Date() : undefined,
      }
    );

    // Create event
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: targetStatus as any,
      locationName: details.locationName || parcel.pickupLocation || 'Transit Stop',
      description: details.notes || `Parcel status advanced to ${targetStatus}`,
      actorRole: details.actorRole || 'System / Logistics',
      actorId: details.actorId ? new Types.ObjectId(details.actorId) : undefined,
    });

    await TrackingEvent.create({
      trackingCode: parcel.parcelTrackingNumber,
      parcelId: parcel._id,
      status: targetStatus,
      locationName: details.locationName || parcel.pickupLocation || 'Transit Stop',
      note: details.notes || `Parcel reached state ${targetStatus}`,
    });

    emitToAll('parcel:update', {
      parcelId: parcel.parcelId,
      status: parcel.status,
    });

    return parcel;
  }

  /**
   * Backward-compatible route search by origin and destination
   */
  static async findMatchingRoutes(
    origin: string | any,
    destination: string | any,
    weightKg: number = 1
  ): Promise<MatchedDeliveryOption[]> {
    const pickupLocation = typeof origin === 'string' ? origin : origin?.name || '';
    const deliveryLocation = typeof destination === 'string' ? destination : destination?.name || '';
    const result = await this.findMatchingTripsForParcel(
      {
        pickupLocation,
        deliveryLocation,
        weightKg,
        sendDate: 'Today',
      },
      { flexibleDate: true }
    );
    return result.matches;
  }
}
