'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useSocket } from '../../../../context/SocketContext';
import {
  Radio,
  Truck,
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  Eye,
  Phone,
  RefreshCw,
  Search,
  Filter,
  Navigation,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';

export default function LiveVehiclesPage() {
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [movingParcels, setMovingParcels] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [transportFilter, setTransportFilter] = useState('ALL');

  const fetchLive = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsLive();
      if (res.success) {
        setTrips(res.trips || []);
        setMovingParcels(res.movingParcels || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    if (socket) {
      socket.on('logistics:trip_update', () => fetchLive());
      return () => {
        socket.off('logistics:trip_update');
      };
    }
  }, [socket]);

  const getTransportIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('bike') || t.includes('cycle')) return '🛵';
    if (t.includes('auto') || t.includes('rickshaw')) return '🛺';
    if (t.includes('cab') || t.includes('taxi')) return '🚕';
    if (t.includes('bus')) return '🚌';
    if (t.includes('pickup') || t.includes('truck')) return '🚚';
    if (t.includes('van') || t.includes('car')) return '🚐';
    return '🚗';
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesTransport =
      transportFilter === 'ALL' ||
      trip.transportType?.toLowerCase() === transportFilter.toLowerCase();
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      trip.tripId?.toLowerCase().includes(s) ||
      trip.partnerName?.toLowerCase().includes(s) ||
      trip.routeTitle?.toLowerCase().includes(s) ||
      trip.vehicleNumber?.toLowerCase().includes(s) ||
      trip.currentStop?.toLowerCase().includes(s) ||
      trip.nextStop?.toLowerCase().includes(s);
    return matchesTransport && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <Link
            href="/admin/logistics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Logistics Control Center
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              LIVE VEHICLES & ACTIVE MOVEMENTS
            </h1>
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs">
              {trips.filter((t) => t.tripStatus === 'MOVING').length} MOVING NOW
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Real-time tracking displaying Current Stop, Next Stop, Final Destination, and per-stop parcel distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/logistics/trips">
            <Button size="sm" variant="outline" className="text-xs font-bold">
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Scheduled Timetable Trips
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={fetchLive} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Search by trip, driver, stop or corridor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Bike', 'Auto', 'Cab', 'Bus', 'Van', 'Pickup'].map((t) => (
              <button
                key={t}
                onClick={() => setTransportFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  transportFilter === t
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Vehicles */}
      {filteredTrips.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-2">
          <Truck className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-xs font-bold text-gray-700">No active vehicles currently match.</h3>
          <p className="text-[11px] text-gray-500">All moving or scheduled vehicles will stream here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => {
            const capacityUsed = trip.usedCapacityKg || 0;
            const capacityTotal = trip.totalCapacityKg || 20;
            const capacityAvailable = Math.max(0, capacityTotal - capacityUsed);
            const capacityPercent = Math.min(100, Math.round((capacityUsed / capacityTotal) * 100));

            const originName = trip.startLocation?.name || trip.fromLocation?.villageOrCity || 'Origin';
            const destName = trip.finalDestination?.name || trip.toLocation?.villageOrCity || 'Final';

            const stopBreakdown: any[] = trip.parcelsPerStopBreakdown || [];

            return (
              <div
                key={trip._id || trip.tripId}
                className="bg-white rounded-2xl border-2 border-sky-100 hover:border-sky-300 transition-all shadow-xs p-4 space-y-3.5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTransportIcon(trip.transportType)}</span>
                    <div>
                      <div className="font-extrabold text-sm text-gray-900">{trip.partnerName}</div>
                      <div className="text-[11px] text-gray-500">
                        {trip.transportType} {trip.vehicleNumber && `(${trip.vehicleNumber})`}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] font-extrabold ${
                      trip.tripStatus === 'MOVING'
                        ? 'bg-emerald-500 text-white animate-pulse'
                        : trip.tripStatus === 'SCHEDULED'
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {trip.tripStatus}
                  </Badge>
                </div>

                {/* Corridor Overview */}
                <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">Corridor Route</div>
                  <div className="font-bold text-gray-900">
                    {originName} ➔ {destName}
                  </div>
                  {trip.currentOperationalLocation && (
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location: {trip.currentOperationalLocation}
                    </div>
                  )}
                </div>

                {/* SECTION 23: CURRENT STOP, NEXT STOP, FINAL DESTINATION */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Stop Progression Tracking
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Current Stop</span>
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {trip.currentStop || originName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Next Stop</span>
                      <span className="font-bold text-sky-900 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        {trip.nextStop || destName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-semibold">Final Destination</span>
                    <span className="font-bold text-indigo-900">
                      {trip.finalDestination || destName}
                    </span>
                  </div>
                </div>

                {/* SECTION 23: PARCELS CARRIED PER STOP BREAKDOWN */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Parcels Carried Per Stop</span>
                    <span className="font-mono text-gray-900 font-bold">
                      {trip.activeParcelCount || trip.parcelIds?.length || 0} Total
                    </span>
                  </div>

                  {stopBreakdown.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {stopBreakdown.map((sb: any, idx: number) => (
                        <Badge
                          key={idx}
                          className="bg-white border border-gray-200 text-gray-800 text-[10px] font-semibold py-0.5 px-2 shadow-3xs"
                        >
                          For <strong className="text-sky-700 ml-0.5 mr-1">{sb.stopName}:</strong>{' '}
                          <span className="font-mono font-bold text-gray-900">{sb.count} parcel{sb.count > 1 ? 's' : ''}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-400 italic">
                      Payload: {trip.activeParcelCount || 0} parcels onboard.
                    </div>
                  )}
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span>Capacity Meter</span>
                    <span className="font-mono text-gray-900">
                      {capacityUsed}/{capacityTotal} KG ({capacityAvailable} KG Free)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        capacityPercent > 80 ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-700 font-mono">
                    ₹{trip.estimatedEarnings || 0} Earnings
                  </div>
                  <Link href={`/admin/logistics/trips/${trip.tripId || trip._id}`}>
                    <Button size="sm" className="h-7 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View Dossier
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
