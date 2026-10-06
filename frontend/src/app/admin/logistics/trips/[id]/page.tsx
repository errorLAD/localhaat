'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import {
  Truck,
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Calendar,
  AlertTriangle,
  Radio,
  RefreshCw,
  Phone,
  Eye,
  Sliders,
  DollarSign,
  Layers,
  Check,
  Navigation,
  ArrowRight,
  User,
  KeyRound,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [parcelsByStop, setParcelsByStop] = useState<Record<string, any[]>>({});
  const [stopDelays, setStopDelays] = useState<any[]>([]);
  const [legs, setLegs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminLogisticsTrip(tripId);
      if (res.success) {
        setTrip(res.trip);
        setParcels(res.parcels || []);
        setParcelsByStop(res.parcelsByStop || {});
        setStopDelays(res.stopDelays || []);
        setLegs(res.legs || []);
        setActivities(res.activities || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change trip status to ${newStatus}?`)) return;
    try {
      setUpdatingStatus(true);
      const res = await api.updateAdminLogisticsTripStatus(trip.tripId, { tripStatus: newStatus });
      if (res.success) {
        fetchTripData();
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStopStatus = async (stopId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await api.updateAdminLogisticsTripStopStatus(trip.tripId, stopId, {
        status: newStatus,
      });
      if (res.success) {
        fetchTripData();
      }
    } catch (err: any) {
      alert(`Stop status update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAdvanceWaypoint = async (idx: number) => {
    try {
      setUpdatingStatus(true);
      const res = await api.updateAdminLogisticsTripStatus(trip.tripId, { waypointIndex: idx });
      if (res.success) {
        fetchTripData();
      }
    } catch (err: any) {
      alert(`Waypoint update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-gray-500">Loading Trip Corridor Dossier...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Unable to load trip</h2>
        <p className="text-xs text-gray-500">{error || 'Trip record not found.'}</p>
        <Link href="/admin/logistics/trips">
          <Button size="sm" variant="outline" className="text-xs">
            Back to Trips
          </Button>
        </Link>
      </div>
    );
  }

  const capacityUsed = trip.usedCapacityKg || 0;
  const capacityTotal = trip.totalCapacityKg || 25;
  const capacityAvailable = Math.max(0, capacityTotal - capacityUsed);
  const capacityPercent = Math.min(100, Math.round((capacityUsed / capacityTotal) * 100));

  const startLoc = trip.startLocation || {
    name: trip.fromLocation?.villageOrCity || 'Start',
    departureTime: trip.departureTime || '08:00 AM',
    status: trip.tripStatus === 'MOVING' ? 'DEPARTED' : 'PENDING',
  };

  const finalLoc = trip.finalDestination || {
    name: trip.toLocation?.villageOrCity || 'Destination',
    expectedArrival: trip.expectedArrival || '12:00 PM',
    status: trip.tripStatus === 'COMPLETED' ? 'ARRIVED' : 'UPCOMING',
  };

  const stopsList: any[] = trip.stops || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/logistics/trips"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Scheduled Trips
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-mono font-bold text-sky-700">{trip.tripId}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {trip.routeTitle || `${startLoc.name} ➔ ${finalLoc.name}`}
            </h1>
            <Badge
              className={`text-xs font-extrabold ${
                trip.tripStatus === 'MOVING'
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : trip.tripStatus === 'SCHEDULED'
                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                  : trip.tripStatus === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {trip.tripStatus}
            </Badge>
            <Badge className="bg-amber-50 text-amber-900 border-amber-200 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {trip.travelDate || 'Today'}
            </Badge>
          </div>
        </div>

        {/* Status Transition Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {trip.tripStatus === 'SCHEDULED' && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('READY')}
              disabled={updatingStatus}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
            >
              Mark Ready for Departure
            </Button>
          )}

          {(trip.tripStatus === 'READY' || trip.tripStatus === 'SCHEDULED') && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('MOVING')}
              disabled={updatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Dispatch & Start Trip
            </Button>
          )}

          {trip.tripStatus === 'MOVING' && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('COMPLETED')}
              disabled={updatingStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Complete Entire Trip
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={fetchTripData}
            disabled={loading || updatingStatus}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Partner Details */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100">
            <span>Logistics Partner</span>
            <Badge className="text-[10px] bg-blue-50 text-blue-800 border-blue-200">
              {trip.partnerType || 'PROFESSIONAL'}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="font-extrabold text-base text-gray-900">{trip.partnerName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="font-semibold text-gray-700">{trip.transportType}</span>
              {trip.vehicleNumber && <span className="font-mono">({trip.vehicleNumber})</span>}
            </div>
            {trip.partnerMobile && (
              <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <a href={`tel:${trip.partnerMobile}`} className="font-mono text-sky-700 hover:underline">
                  {trip.partnerMobile}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Timetable & Operational Location */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100">
            Timetable & Schedule
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-semibold">Start Departure</span>
              <span className="font-bold text-gray-800">{startLoc.departureTime}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-semibold">Final Expected Arrival</span>
              <span className="font-bold text-emerald-800">{finalLoc.expectedArrival}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 block font-semibold">Operational Location</span>
              <span className="font-bold text-gray-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {trip.currentOperationalLocation || 'Starting Point'} ({trip.routeProgress || 0}% progress)
              </span>
            </div>
          </div>
        </div>

        {/* Load & Capacity Meter */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100 flex items-center justify-between">
            <span>Capacity & Weight</span>
            <span className="font-mono text-emerald-700 font-bold text-xs">{capacityAvailable} KG Free</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Used / Total:</span>
              <span className="font-bold font-mono text-gray-900">
                {capacityUsed} KG / {capacityTotal} KG
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  capacityPercent > 85 ? 'bg-red-500' : capacityPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-500 pt-1">
              Carrying <span className="font-bold text-gray-900">{parcels.length}</span> parcel(s). Partner Earning: <span className="font-bold text-emerald-700">₹{trip.estimatedEarnings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULED ROUTE STOPS & TIMETABLE OPERATIONS (Sections 18, 20, 21, 22) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-sky-600" />
              SCHEDULED ROUTE STOPS & REAL-TIME TIMETABLE
            </h2>
            <p className="text-xs text-gray-500">
              Stop-level arrival & departure logs, waiting intervals, delay trackers, and operational actions.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 font-mono">
            {stopsList.length + 2} Planned Stops
          </span>
        </div>

        {/* Stop Timeline Component */}
        <div className="space-y-3">
          {/* 1. START POINT */}
          <div className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">{startLoc.name || 'Start Point'}</span>
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px]">
                    STARTING POINT
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-[10px]">
                    Status: {startLoc.status || 'PENDING'}
                  </Badge>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{startLoc.address || 'Central Depot'}</span>
                  <span>•</span>
                  <span>Departure: <strong className="text-gray-900 font-mono">{startLoc.departureTime}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {startLoc.status !== 'DEPARTED' && trip.tripStatus === 'MOVING' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStopStatus('START', 'DEPARTED')}
                  disabled={updatingStatus}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Confirm Dispatched
                </Button>
              )}
            </div>
          </div>

          {/* 2. INTERMEDIATE STOPS */}
          {stopsList.map((stop: any, idx: number) => {
            const isDelayed = stop.delayMinutes && stop.delayMinutes > 0;
            const stopId = stop.stopId || `STOP-${idx + 1}`;

            return (
              <div
                key={stopId}
                className="p-4 rounded-2xl border-2 border-sky-100 bg-white hover:border-sky-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                    {idx + 2}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">{stop.name}</span>
                      <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-[10px] font-mono">
                        Stop #{stop.stopOrder || idx + 1}
                      </Badge>
                      <Badge
                        className={`text-[10px] font-bold ${
                          stop.status === 'ARRIVED'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : stop.status === 'DEPARTED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {stop.status || 'UPCOMING'}
                      </Badge>
                      {isDelayed && (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-bold animate-pulse">
                          ⚠️ Delayed by {stop.delayMinutes} min
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-600" />
                      <span>{stop.address || stop.villageOrCity || 'Corridor Stop'}</span>
                      <span>•</span>
                      <span>Expected Arrival: <strong className="text-gray-900 font-mono">{stop.expectedArrival}</strong></span>
                      <span>•</span>
                      <span>Departure: <strong className="text-gray-900 font-mono">{stop.expectedDeparture}</strong></span>
                      {stop.waitingMinutes && (
                        <span>(Halt: {stop.waitingMinutes}m)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stop Status Action Buttons (Sections 20 & 21) */}
                <div className="flex items-center gap-2">
                  {stop.status === 'UPCOMING' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStopStatus(stopId, 'ARRIVED')}
                      disabled={updatingStatus}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                    >
                      Mark Arrived
                    </Button>
                  )}
                  {stop.status === 'ARRIVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStopStatus(stopId, 'DEPARTED')}
                      disabled={updatingStatus}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Mark Departed
                    </Button>
                  )}
                  {stop.status === 'DEPARTED' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Departed
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* 3. FINAL DESTINATION */}
          <div className="p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                {stopsList.length + 2}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">{finalLoc.name || 'Final Destination'}</span>
                  <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 text-[10px]">
                    FINAL TERMINAL
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-[10px]">
                    Status: {finalLoc.status || 'UPCOMING'}
                  </Badge>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  <span>{finalLoc.address || 'Town Bus Stand'}</span>
                  <span>•</span>
                  <span>Expected Arrival: <strong className="text-gray-900 font-mono">{finalLoc.expectedArrival}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {finalLoc.status !== 'ARRIVED' && trip.tripStatus === 'MOVING' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStopStatus('FINAL', 'ARRIVED')}
                  disabled={updatingStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Final Arrival Completed
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PARCELS GROUPED BY DESTINATION STOP (Section 24) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
              <Package className="w-4 h-4 text-sky-600" />
              PARCELS GROUPED BY DESTINATION STOP (SECTION 24)
            </h2>
            <p className="text-xs text-gray-500">
              Payload breakdown showing exact parcels scheduled for handover at each corridor stop.
            </p>
          </div>
          <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
            {parcels.length} Total Parcels
          </Badge>
        </div>

        {Object.keys(parcelsByStop).length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-500">No parcels currently mapped to route stops for this trip.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(parcelsByStop).map(([stopName, stopParcels]: [string, any]) => {
              const stopEta = stopParcels[0]?.expectedDeliveryTime || 'N/A';

              return (
                <div
                  key={stopName}
                  className="rounded-2xl border-2 border-gray-200 overflow-hidden shadow-3xs"
                >
                  {/* Stop Destination Header Banner */}
                  <div className="bg-sky-50 px-4 py-3 border-b border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-700" />
                      <span className="font-extrabold text-sm text-gray-900">
                        Stop: {stopName}
                      </span>
                      <Badge className="bg-sky-200 text-sky-900 font-bold text-xs">
                        {stopParcels.length} parcel{stopParcels.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="text-xs text-sky-900 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-sky-700" />
                      <span>Expected Drop ETA: <strong className="font-mono text-emerald-800">{stopEta}</strong></span>
                    </div>
                  </div>

                  {/* Parcels for this stop */}
                  <div className="divide-y divide-gray-100 bg-white">
                    {stopParcels.map((p: any) => {
                      const pId = p.parcelId || p._id;
                      const earning = Math.round((p.customerOfferPrice || 100) * 0.85);

                      return (
                        <div
                          key={p._id || pId}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-sky-50/30 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/parcels/${p._id}`}
                                className="font-mono font-bold text-sm text-sky-700 hover:underline"
                              >
                                {pId}
                              </Link>
                              <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-[10px]">
                                {p.status}
                              </Badge>
                              <span className="text-xs font-semibold text-gray-800">
                                {p.whatIsInside || 'Goods'}
                              </span>
                            </div>

                            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                              <span>Pickup: <strong>{p.pickupLocation}</strong></span>
                              <span>➔</span>
                              <span>Drop: <strong>{p.deliveryLocation}</strong></span>
                              <span>•</span>
                              <span>Receiver: <strong>{p.receiverName}</strong> ({p.receiverMobile})</span>
                              {p.deliveryPin && (
                                <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold text-[11px] flex items-center gap-1">
                                  <KeyRound className="w-3 h-3" /> PIN: {p.deliveryPin}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-mono font-bold text-xs text-gray-900">{p.weightKg || 1} KG</div>
                              <div className="text-[10px] text-emerald-700 font-bold font-mono">₹{earning}</div>
                            </div>

                            <Link href={`/admin/parcels/${p._id}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-sky-700 border-sky-200">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
