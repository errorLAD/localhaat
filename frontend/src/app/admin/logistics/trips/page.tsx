'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  Navigation,
  ArrowLeft,
  PlusCircle,
  MapPin,
  Clock,
  Eye,
  RefreshCw,
  Truck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';

interface IntermediateStopInput {
  name: string;
  villageOrCity?: string;
  address?: string;
  expectedArrival: string;
  expectedDeparture: string;
  waitingMinutes: number;
}

export default function ScheduledTripsPage() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [transportFilter, setTransportFilter] = useState('ALL');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [travelDate, setTravelDate] = useState('10 Oct 2026');
  const [transportType, setTransportType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('BR-07-AB-4021');
  const [totalCapacityKg, setTotalCapacityKg] = useState(20);
  const [routeTitle, setRouteTitle] = useState('Darbhanga ➔ Sakri ➔ Pandaul ➔ Madhubani Line');

  // Start Location
  const [startName, setStartName] = useState('Darbhanga');
  const [startAddress, setStartAddress] = useState('Central Haat Depot, Darbhanga');
  const [startDepartureTime, setStartDepartureTime] = useState('08:00 AM');

  // Intermediate Stops
  const [stops, setStops] = useState<IntermediateStopInput[]>([
    {
      name: 'Sakri',
      villageOrCity: 'Sakri',
      address: 'Sakri Railway Station Chowk',
      expectedArrival: '08:50 AM',
      expectedDeparture: '09:00 AM',
      waitingMinutes: 10,
    },
    {
      name: 'Pandaul',
      villageOrCity: 'Pandaul',
      address: 'Pandaul Market Crossing',
      expectedArrival: '09:45 AM',
      expectedDeparture: '09:55 AM',
      waitingMinutes: 10,
    },
  ]);

  // Final Destination
  const [finalName, setFinalName] = useState('Madhubani');
  const [finalAddress, setFinalAddress] = useState('Madhubani Town Bus Stand');
  const [finalExpectedArrival, setFinalExpectedArrival] = useState('11:30 AM');

  const fetchTripsAndPartners = async () => {
    try {
      setLoading(true);
      const [tripsRes, partnersRes] = await Promise.all([
        api.getAdminLogisticsTrips(),
        api.getAdminLogisticsPartners({ verificationStatus: 'VERIFIED' }),
      ]);
      if (tripsRes.success) setTrips(tripsRes.trips || []);
      if (partnersRes.success) {
        setPartners(partnersRes.partners || []);
        if (partnersRes.partners?.length > 0 && !selectedPartnerId) {
          const first = partnersRes.partners[0];
          setSelectedPartnerId(first._id);
          setTransportType(first.primaryTransportType || 'Bike');
          setVehicleNumber(first.vehicleNumber || 'BR-07-AB-4021');
          setTotalCapacityKg(first.capacityKg || 25);
        }
      }
    } catch (err: any) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndPartners();
  }, []);

  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    const p = partners.find((x) => x._id === partnerId);
    if (p) {
      setTransportType(p.primaryTransportType || 'Bike');
      setVehicleNumber(p.vehicleNumber || '');
      setTotalCapacityKg(p.capacityKg || 25);
    }
  };

  const handleAddStop = () => {
    setStops([
      ...stops,
      {
        name: '',
        villageOrCity: '',
        address: '',
        expectedArrival: '10:15 AM',
        expectedDeparture: '10:25 AM',
        waitingMinutes: 10,
      },
    ]);
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, field: keyof IntermediateStopInput, val: any) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], [field]: val };
    setStops(updated);
  };

  // Chronology Time Validation (Section 19)
  const parseTimeToMin = (tStr: string) => {
    if (!tStr) return 0;
    const parts = tStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!parts) return 0;
    let h = parseInt(parts[1], 10);
    const m = parseInt(parts[2], 10);
    const modifier = parts[3]?.toUpperCase();
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const validateTimeline = () => {
    const errors: string[] = [];
    const startMin = parseTimeToMin(startDepartureTime);

    let prevDepartureMin = startMin;
    let prevName = startName || 'Start Point';

    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      if (!s.name.trim()) {
        errors.push(`Stop #${i + 1} must have a valid name.`);
      }
      const arrMin = parseTimeToMin(s.expectedArrival);
      const depMin = parseTimeToMin(s.expectedDeparture);

      if (arrMin < prevDepartureMin) {
        errors.push(
          `Stop ${s.name || `#${i + 1}`} arrival (${s.expectedArrival}) cannot be earlier than ${prevName} departure.`
        );
      }
      if (depMin < arrMin) {
        errors.push(
          `Stop ${s.name || `#${i + 1}`} departure (${s.expectedDeparture}) cannot be earlier than arrival (${s.expectedArrival}).`
        );
      }
      prevDepartureMin = depMin;
      prevName = s.name || `Stop #${i + 1}`;
    }

    const finalMin = parseTimeToMin(finalExpectedArrival);
    if (finalMin < prevDepartureMin) {
      errors.push(
        `Final destination ${finalName} arrival (${finalExpectedArrival}) cannot be earlier than last stop ${prevName} departure.`
      );
    }

    return errors;
  };

  const timelineErrors = validateTimeline();

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timelineErrors.length > 0) {
      setFormError(timelineErrors.join(' | '));
      return;
    }

    const partner = partners.find((p) => p._id === selectedPartnerId);
    if (!partner) {
      setFormError('Please select a verified logistics partner.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        partnerId: partner._id,
        partnerName: partner.businessName,
        partnerMobile: partner.phone,
        partnerType: partner.partnerCategory || 'PROFESSIONAL',
        transportType,
        vehicleNumber,
        totalCapacityKg: Number(totalCapacityKg),
        travelDate,
        routeTitle: routeTitle || `${startName} ➔ ${stops.map((s) => s.name).join(' ➔ ')} ➔ ${finalName} Line`,
        startLocation: {
          name: startName,
          villageOrCity: startName,
          address: startAddress,
          departureTime: startDepartureTime,
        },
        stops: stops.map((s, idx) => ({
          stopId: `STOP-${idx + 1}`,
          stopOrder: idx + 1,
          name: s.name,
          villageOrCity: s.villageOrCity || s.name,
          address: s.address,
          expectedArrival: s.expectedArrival,
          expectedDeparture: s.expectedDeparture,
          waitingMinutes: Number(s.waitingMinutes || 10),
          status: 'UPCOMING',
        })),
        finalDestination: {
          name: finalName,
          villageOrCity: finalName,
          address: finalAddress,
          expectedArrival: finalExpectedArrival,
        },
      };

      const res = await api.createAdminLogisticsTrip(payload);
      if (res.success) {
        alert(res.message || 'Scheduled trip created successfully!');
        setShowCreateModal(false);
        fetchTripsAndPartners();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      t.tripId?.toLowerCase().includes(s) ||
      t.partnerName?.toLowerCase().includes(s) ||
      t.routeTitle?.toLowerCase().includes(s) ||
      t.startLocation?.name?.toLowerCase().includes(s) ||
      t.finalDestination?.name?.toLowerCase().includes(s);

    const matchesDate =
      dateFilter === 'ALL' ||
      (t.travelDate || 'Today').toLowerCase() === dateFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'ALL' || t.tripStatus === statusFilter;

    const matchesTransport =
      transportFilter === 'ALL' ||
      t.transportType?.toLowerCase() === transportFilter.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus && matchesTransport;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
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
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              SCHEDULED TRIPS & ROUTE STOPS MANAGEMENT
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              {trips.length} SCHEDULED TRIPS
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Multi-stop timetable schedules with stop-level departure/arrival controls and forward-only parcel matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Scheduled Trip
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchTripsAndPartners}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Search Trip ID, Partner, Route, Stops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white font-semibold text-gray-700"
          >
            <option value="ALL">All Dates</option>
            <option value="10 Oct 2026">10 Oct 2026 (Showcase Run)</option>
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white font-semibold text-gray-700"
          >
            <option value="ALL">All Trip Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="READY">READY</option>
            <option value="MOVING">MOVING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={transportFilter}
            onChange={(e) => setTransportFilter(e.target.value)}
            className="text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white font-semibold text-gray-700"
          >
            <option value="ALL">All Transport Types</option>
            <option value="Bike">Bike</option>
            <option value="Auto">Auto</option>
            <option value="Cab">Cab</option>
            <option value="Bus">Bus</option>
            <option value="Van">Van</option>
            <option value="Pickup">Pickup</option>
          </select>
        </div>
      </div>

      {/* Trips Cards Directory */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-gray-200">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Loading Scheduled Trips & Stop Timetables...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-2">
          <Truck className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-xs font-bold text-gray-700">No trips match current filters.</h3>
          <p className="text-[11px] text-gray-500">Try adjusting your date or search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => {
            const start = trip.startLocation || { name: trip.fromLocation?.villageOrCity || 'Start', departureTime: '08:00 AM' };
            const final = trip.finalDestination || { name: trip.toLocation?.villageOrCity || 'Destination', expectedArrival: '12:00 PM' };
            const tripStops: any[] = trip.stops || [];

            const usedKg = trip.usedCapacityKg || 0;
            const totalKg = trip.totalCapacityKg || 25;
            const freeKg = Math.max(0, totalKg - usedKg);
            const loadPercent = Math.min(100, Math.round((usedKg / totalKg) * 100));

            return (
              <div
                key={trip._id || trip.tripId}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-sky-300 transition-all shadow-2xs p-5 space-y-4"
              >
                {/* Trip Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm font-mono text-sky-900 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      {trip.tripId}
                    </span>
                    <Badge
                      className={`text-[10px] font-extrabold ${
                        trip.tripStatus === 'MOVING'
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : trip.tripStatus === 'SCHEDULED'
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {trip.tripStatus}
                    </Badge>
                    <Badge className="bg-amber-50 text-amber-900 border-amber-200 text-[10px] font-semibold">
                      <Calendar className="w-3 h-3 mr-1" />
                      {trip.travelDate || 'Today'}
                    </Badge>
                  </div>

                  <Link href={`/admin/logistics/trips/${trip.tripId}`}>
                    <Button size="sm" variant="outline" className="text-xs h-7 text-sky-700 hover:text-sky-900">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Trip Dossier
                    </Button>
                  </Link>
                </div>

                {/* Partner Details */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-gray-900">{trip.partnerName}</div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{trip.transportType}</span>
                      {trip.vehicleNumber && <span className="font-mono text-gray-600">({trip.vehicleNumber})</span>}
                    </div>
                  </div>
                  {trip.partnerMobile && (
                    <a
                      href={`tel:${trip.partnerMobile}`}
                      className="text-sky-700 font-mono text-xs flex items-center gap-1 hover:underline font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {trip.partnerMobile}
                    </a>
                  )}
                </div>

                {/* Stop-by-Stop Timetable Sequence */}
                <div className="bg-sky-50/50 rounded-xl p-3 border border-sky-100 space-y-2">
                  <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Route Timetable & Stops</span>
                    <span>{tripStops.length + 2} Stop Points</span>
                  </div>

                  {/* Visual Stop Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    {/* Start */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-800 shadow-3xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{start.name || 'Start'}</span>
                      <span className="text-[10px] text-gray-400 font-mono">({start.departureTime})</span>
                    </div>

                    {/* Intermediate Stops */}
                    {tripStops.map((st: any, idx: number) => (
                      <React.Fragment key={st.stopId || idx}>
                        <ArrowRight className="w-3 h-3 text-sky-400 flex-shrink-0" />
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-800 shadow-3xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{st.name}</span>
                          <span className="text-[10px] text-emerald-700 font-mono">({st.expectedArrival})</span>
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-gray-100 text-gray-600 border-0">
                            Stop {st.stopOrder || idx + 1}
                          </Badge>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Final */}
                    <ArrowRight className="w-3 h-3 text-sky-400 flex-shrink-0" />
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-800 shadow-3xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>{final.name || 'Destination'}</span>
                      <span className="text-[10px] text-indigo-700 font-mono font-bold">({final.expectedArrival})</span>
                    </div>
                  </div>
                </div>

                {/* Capacity & Parcels Carried */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Carrying Payload:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {usedKg} KG / {totalKg} KG ({freeKg} KG Free)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        loadPercent > 80 ? 'bg-red-500' : loadPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-sky-600" />
                      <span>{trip.activeParcelCount || trip.parcelIds?.length || 0} active parcel(s) assigned</span>
                    </span>
                    <span className="font-semibold text-emerald-700">₹{trip.estimatedEarnings || 0} projected earnings</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SCHEDULED TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-3xl w-full p-6 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  Create Scheduled Trip with Route Stops
                </h2>
                <p className="text-xs text-gray-500">
                  Define trip date, transport vehicle, start time, intermediate stops, and logical arrival timetable.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
              {/* Partner & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Logistics Partner</label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handlePartnerChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 p-2 font-semibold bg-white"
                  >
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.businessName} ({p.primaryTransportType} - {p.partnerCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Travel Date (Section 32)</label>
                  <Input
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    placeholder="e.g. 10 Oct 2026"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Transport Type</label>
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2 font-semibold bg-white"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Auto">Auto</option>
                    <option value="Cab">Cab</option>
                    <option value="Bus">Bus</option>
                    <option value="Van">Van</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Number & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Vehicle Number</label>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. BR-07-AB-4021"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Total Capacity (KG)</label>
                  <Input
                    type="number"
                    min="1"
                    value={totalCapacityKg}
                    onChange={(e) => setTotalCapacityKg(Number(e.target.value))}
                    className="text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Route Title</label>
                  <Input
                    value={routeTitle}
                    onChange={(e) => setRouteTitle(e.target.value)}
                    placeholder="e.g. Darbhanga ➔ Sakri ➔ Pandaul ➔ Madhubani Line"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* START LOCATION (Section 18) */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Trip Start Location & Departure Time
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Start City / Village (e.g. Darbhanga)"
                    value={startName}
                    onChange={(e) => setStartName(e.target.value)}
                    required
                    className="text-xs bg-white"
                  />
                  <Input
                    placeholder="Start Hub Address (e.g. Central Depot)"
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                    className="text-xs bg-white"
                  />
                  <Input
                    placeholder="Departure Time (e.g. 08:00 AM)"
                    value={startDepartureTime}
                    onChange={(e) => setStartDepartureTime(e.target.value)}
                    required
                    className="text-xs bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* INTERMEDIATE STOPS BUILDER (Sections 18 & 19) */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sky-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-sky-700" />
                    Intermediate Stops & Waiting Times ({stops.length} configured)
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddStop}
                    className="h-7 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Stop
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {stops.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-sky-200 shadow-3xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md">
                          Stop #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Stop Name / Village</label>
                          <Input
                            placeholder="e.g. Sakri"
                            value={st.name}
                            onChange={(e) => handleStopChange(idx, 'name', e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Expected Arrival</label>
                          <Input
                            placeholder="e.g. 08:50 AM"
                            value={st.expectedArrival}
                            onChange={(e) => handleStopChange(idx, 'expectedArrival', e.target.value)}
                            required
                            className="text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Expected Departure</label>
                          <Input
                            placeholder="e.g. 09:00 AM"
                            value={st.expectedDeparture}
                            onChange={(e) => handleStopChange(idx, 'expectedDeparture', e.target.value)}
                            required
                            className="text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Waiting (Min)</label>
                          <Input
                            type="number"
                            placeholder="10"
                            value={st.waitingMinutes}
                            onChange={(e) => handleStopChange(idx, 'waitingMinutes', Number(e.target.value))}
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINAL DESTINATION (Section 18) */}
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-indigo-700" />
                  Final Destination & Expected Final Arrival Time
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Final City / Village (e.g. Madhubani)"
                    value={finalName}
                    onChange={(e) => setFinalName(e.target.value)}
                    required
                    className="text-xs bg-white"
                  />
                  <Input
                    placeholder="Final Destination Address"
                    value={finalAddress}
                    onChange={(e) => setFinalAddress(e.target.value)}
                    className="text-xs bg-white"
                  />
                  <Input
                    placeholder="Final Arrival Time (e.g. 11:30 AM)"
                    value={finalExpectedArrival}
                    onChange={(e) => setFinalExpectedArrival(e.target.value)}
                    required
                    className="text-xs bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* CHRONOLOGY VALIDATION ALERT (Section 19) */}
              {timelineErrors.length > 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Logical Timetable Validation Errors:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {timelineErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  All stop arrival and departure timings follow valid logical forward chronology.
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || timelineErrors.length > 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  {submitting ? 'Creating Trip...' : 'Confirm & Publish Scheduled Trip'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
