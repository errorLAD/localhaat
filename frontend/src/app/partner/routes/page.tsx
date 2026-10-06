'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePartner } from '../../../context/PartnerContext';
import { PartnerRoute, RouteStop } from '../../../types';
import {
  Compass,
  MapPin,
  ArrowRight,
  ArrowDown,
  Plus,
  Clock,
  Bike,
  Bus,
  Car,
  Truck,
  DollarSign,
  CheckCircle2,
  X,
  RefreshCw,
  Info,
  Edit3,
  Trash2,
  ArrowUp,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Navigation,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';

const TRANSPORT_OPTIONS = [
  'Bike',
  'Cycle',
  'Auto / E-rickshaw',
  'Car',
  'Van / Pickup',
  'Bus / Transport',
  'Train / approved rail route',
  'Travelling Person',
  'Other',
];

const PARTNER_TYPE_OPTIONS = [
  'Travelling Partner',
  'Professional Transporter',
  'Bus / Public Transport',
  'Local Commuter',
];

// Helper to convert "08:30 AM" or "13:30" or "8:30" into minutes from midnight
function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toUpperCase();

  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

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

export default function MyTravelRoutesPage() {
  const {
    routes,
    locations,
    shops,
    loading,
    loadDashboard,
    handleCreateRoute,
    handleUpdateRoute,
    handleDeleteRoute,
  } = usePartner();

  // Route Editor state (Create or Edit)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  // Core route form fields
  const [routeTitle, setRouteTitle] = useState('');
  const [sourceCity, setSourceCity] = useState('');
  const [sourceAddress, setSourceAddress] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [departureTime, setDepartureTime] = useState('08:00 AM');
  const [finalArrivalTime, setFinalArrivalTime] = useState('11:00 AM');
  const [travelDate, setTravelDate] = useState('Daily Morning Commute');
  const [routeTransport, setRouteTransport] = useState('Bike');
  const [partnerCategory, setPartnerCategory] = useState('Travelling Partner');
  const [routeCapacityKg, setRouteCapacityKg] = useState('50');
  const [pricePerKg, setPricePerKg] = useState('10');
  const [totalDistanceKm, setTotalDistanceKm] = useState('40');

  // Ordered stopovers list
  const [stops, setStops] = useState<RouteStop[]>([]);

  // Stopover Modal state (for adding or editing an individual stop)
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null);
  const [insertStopIndex, setInsertStopIndex] = useState<number | null>(null);

  // Stopover form fields
  const [stopName, setStopName] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [stopVillage, setStopVillage] = useState('');
  const [stopDistrict, setStopDistrict] = useState('Regional');
  const [stopState, setStopState] = useState('Bihar');
  const [stopPinCode, setStopPinCode] = useState('');
  const [stopLandmark, setStopLandmark] = useState('');
  const [stopExpectedArrival, setStopExpectedArrival] = useState('09:00 AM');
  const [stopExpectedDeparture, setStopExpectedDeparture] = useState('09:10 AM');
  const [stopWaitingMinutes, setStopWaitingMinutes] = useState('10');
  const [stopLatitude, setStopLatitude] = useState('');
  const [stopLongitude, setStopLongitude] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset editor form to blank for new route
  const openNewRouteEditor = () => {
    setEditingRouteId(null);
    setRouteTitle('');
    setSourceCity('');
    setSourceAddress('');
    setDestCity('');
    setDestAddress('');
    setDepartureTime('08:00 AM');
    setFinalArrivalTime('11:00 AM');
    setTravelDate('Daily Morning Commute');
    setRouteTransport('Bike');
    setPartnerCategory('Travelling Partner');
    setRouteCapacityKg('50');
    setPricePerKg('10');
    setTotalDistanceKm('40');
    setStops([]);
    setFormError(null);
    setEditorOpen(true);
  };

  // Open editor pre-filled with an existing route
  const openEditRoute = (route: PartnerRoute) => {
    setEditingRouteId(route._id);
    setRouteTitle(route.routeTitle || '');
    setSourceCity(route.sourceLocation?.villageOrCity || '');
    setSourceAddress(route.sourceLocation?.addressLine || '');
    setDestCity(route.destinationLocation?.villageOrCity || '');
    setDestAddress(route.destinationLocation?.addressLine || '');
    setDepartureTime(route.departureTime || '08:00 AM');
    setFinalArrivalTime(route.finalArrivalTime || '11:00 AM');
    setTravelDate(route.travelDate || 'Daily Morning Commute');
    setRouteTransport(route.vehicleType || 'Bike');
    setPartnerCategory(route.partnerType || 'Travelling Partner');
    setRouteCapacityKg(String(route.capacityKg || 50));
    setPricePerKg(String(route.pricePerKg || 10));
    setTotalDistanceKm(String(route.totalDistanceKm || 40));

    // Populate active stops
    const existingStops = (route.stops || []).map((s, idx) => ({
      ...s,
      stopOrder: s.stopOrder || idx + 1,
      isActive: s.isActive !== false,
    }));
    setStops(existingStops);
    setFormError(null);
    setEditorOpen(true);
  };

  // Open modal to add stopover at a specific index
  const handleOpenAddStop = (indexAfter: number) => {
    setEditingStopIndex(null);
    setInsertStopIndex(indexAfter);
    setStopName('');
    setStopAddress('');
    setStopVillage('');
    setStopDistrict('Regional');
    setStopState('Bihar');
    setStopPinCode('');
    setStopLandmark('');

    // Pre-calculate suggested arrival / departure time
    let suggestedArr = '09:00 AM';
    let suggestedDep = '09:10 AM';
    if (indexAfter === 0) {
      // First stop: after Start departure
      const startMins = parseTimeToMinutes(departureTime);
      if (startMins !== null) {
        const hArr = Math.floor((startMins + 60) / 60) % 24;
        const mArr = (startMins + 60) % 60;
        const ampmArr = hArr >= 12 ? 'PM' : 'AM';
        const displayHArr = hArr % 12 === 0 ? 12 : hArr % 12;
        suggestedArr = `${String(displayHArr).padStart(2, '0')}:${String(mArr).padStart(2, '0')} ${ampmArr}`;

        const hDep = Math.floor((startMins + 70) / 60) % 24;
        const mDep = (startMins + 70) % 60;
        const ampmDep = hDep >= 12 ? 'PM' : 'AM';
        const displayHDep = hDep % 12 === 0 ? 12 : hDep % 12;
        suggestedDep = `${String(displayHDep).padStart(2, '0')}:${String(mDep).padStart(2, '0')} ${ampmDep}`;
      }
    } else if (stops[indexAfter - 1]) {
      const prevDepMins = parseTimeToMinutes(stops[indexAfter - 1].expectedDeparture);
      if (prevDepMins !== null) {
        const hArr = Math.floor((prevDepMins + 60) / 60) % 24;
        const mArr = (prevDepMins + 60) % 60;
        const ampmArr = hArr >= 12 ? 'PM' : 'AM';
        const displayHArr = hArr % 12 === 0 ? 12 : hArr % 12;
        suggestedArr = `${String(displayHArr).padStart(2, '0')}:${String(mArr).padStart(2, '0')} ${ampmArr}`;

        const hDep = Math.floor((prevDepMins + 70) / 60) % 24;
        const mDep = (prevDepMins + 70) % 60;
        const ampmDep = hDep >= 12 ? 'PM' : 'AM';
        const displayHDep = hDep % 12 === 0 ? 12 : hDep % 12;
        suggestedDep = `${String(displayHDep).padStart(2, '0')}:${String(mDep).padStart(2, '0')} ${ampmDep}`;
      }
    }

    setStopExpectedArrival(suggestedArr);
    setStopExpectedDeparture(suggestedDep);
    setStopWaitingMinutes('10');
    setStopLatitude('');
    setStopLongitude('');
    setStopModalOpen(true);
  };

  // Open modal to edit an existing stop
  const handleOpenEditStop = (idx: number) => {
    const s = stops[idx];
    if (!s) return;
    setEditingStopIndex(idx);
    setInsertStopIndex(null);
    setStopName(s.name);
    setStopAddress(s.address || '');
    setStopVillage(s.village || '');
    setStopDistrict(s.district || 'Regional');
    setStopState(s.state || 'Bihar');
    setStopPinCode(s.pinCode || '');
    setStopLandmark(s.landmark || '');
    setStopExpectedArrival(s.expectedArrival || '09:00 AM');
    setStopExpectedDeparture(s.expectedDeparture || '09:10 AM');
    setStopWaitingMinutes(String(s.waitingMinutes || 10));
    setStopLatitude(s.latitude ? String(s.latitude) : '');
    setStopLongitude(s.longitude ? String(s.longitude) : '');
    setStopModalOpen(true);
  };

  // Save stopover from modal into stops array
  const handleSaveStopover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName.trim()) {
      alert('Stop Name is required.');
      return;
    }

    const newStop: RouteStop = {
      stopId: editingStopIndex !== null ? stops[editingStopIndex].stopId : `STOP-${Date.now().toString().slice(-4)}`,
      stopOrder: editingStopIndex !== null ? stops[editingStopIndex].stopOrder : (insertStopIndex ?? stops.length) + 1,
      name: stopName.trim(),
      village: stopVillage.trim() || stopName.trim(),
      address: stopAddress.trim() || stopName.trim(),
      district: stopDistrict.trim() || 'Regional',
      state: stopState.trim() || 'Bihar',
      pinCode: stopPinCode.trim() || undefined,
      landmark: stopLandmark.trim() || undefined,
      expectedArrival: stopExpectedArrival.trim() || '09:00 AM',
      expectedDeparture: stopExpectedDeparture.trim() || '09:10 AM',
      waitingMinutes: Number(stopWaitingMinutes) || 10,
      latitude: stopLatitude ? parseFloat(stopLatitude) : undefined,
      longitude: stopLongitude ? parseFloat(stopLongitude) : undefined,
      isActive: true,
    };

    if (editingStopIndex !== null) {
      // Editing existing stop
      const updated = [...stops];
      updated[editingStopIndex] = newStop;
      setStops(updated);
    } else if (insertStopIndex !== null) {
      // Inserting between stops or at index
      const updated = [...stops];
      updated.splice(insertStopIndex, 0, newStop);
      // Re-number stop orders
      const reindexed = updated.map((s, i) => ({ ...s, stopOrder: i + 1 }));
      setStops(reindexed);
    } else {
      // Append to end
      const updated = [...stops, newStop].map((s, i) => ({ ...s, stopOrder: i + 1 }));
      setStops(updated);
    }

    setStopModalOpen(false);
  };

  // Reorder stops up or down
  const handleMoveStop = (idx: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && idx === 0) return;
    if (direction === 'DOWN' && idx === stops.length - 1) return;

    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    const updated = [...stops];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate stopOrder
    const reordered = updated.map((s, i) => ({ ...s, stopOrder: i + 1 }));
    setStops(reordered);
  };

  // Remove a stop
  const handleRemoveStop = (idx: number) => {
    if (!confirm(`Are you sure you want to remove stop "${stops[idx].name}"?`)) return;
    const updated = stops.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stopOrder: i + 1 }));
    setStops(updated);
  };

  // Validate chronological order of route times
  const validateChronologicalSequence = (): boolean => {
    const startMins = parseTimeToMinutes(departureTime);
    let lastMins = startMins;

    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      if (!s.isActive && s.isActive === false) continue;

      const arrMins = parseTimeToMinutes(s.expectedArrival);
      const depMins = parseTimeToMinutes(s.expectedDeparture);

      if (lastMins !== null && arrMins !== null && arrMins < lastMins) {
        setFormError(
          `Stop times must follow the route sequence. Stop "${s.name}" arrival (${s.expectedArrival}) cannot be earlier than previous departure.`
        );
        return false;
      }

      if (arrMins !== null && depMins !== null && depMins < arrMins) {
        setFormError(
          `Stop times must follow the route sequence. Stop "${s.name}" departure (${s.expectedDeparture}) cannot be earlier than its arrival (${s.expectedArrival}).`
        );
        return false;
      }

      lastMins = depMins ?? arrMins ?? lastMins;
    }

    if (finalArrivalTime && lastMins !== null) {
      const finalMins = parseTimeToMinutes(finalArrivalTime);
      if (finalMins !== null && finalMins < lastMins) {
        setFormError(
          `Stop times must follow the route sequence. Final destination arrival (${finalArrivalTime}) cannot be earlier than previous stops.`
        );
        return false;
      }
    }

    setFormError(null);
    return true;
  };

  // Submit complete Route (Save Route)
  const onSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCity.trim() || !destCity.trim()) {
      setFormError('Please enter both Starting Location and Final Destination.');
      return;
    }

    if (!validateChronologicalSequence()) {
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const matchedSrc = locations?.find(
      (l) => (l.village || l.name).toLowerCase() === sourceCity.toLowerCase().trim()
    );
    const matchedDst = locations?.find(
      (l) => (l.village || l.name).toLowerCase() === destCity.toLowerCase().trim()
    );

    const routePayload = {
      routeTitle: routeTitle.trim() || `${sourceCity.trim()} ➔ ${destCity.trim()} Corridor`,
      sourceCity: sourceCity.trim(),
      destCity: destCity.trim(),
      sourceLocation: {
        villageOrCity: sourceCity.trim(),
        addressLine: sourceAddress.trim() || matchedSrc?.address || sourceCity.trim(),
        district: matchedSrc?.district || 'Regional',
        state: matchedSrc?.state || 'Bihar',
        pincode: matchedSrc?.pinCode || '846001',
      },
      destinationLocation: {
        villageOrCity: destCity.trim(),
        addressLine: destAddress.trim() || matchedDst?.address || destCity.trim(),
        district: matchedDst?.district || 'Regional',
        state: matchedDst?.state || 'Bihar',
        pincode: matchedDst?.pinCode || '846002',
      },
      sourceLocationId: matchedSrc?._id,
      destinationLocationId: matchedDst?._id,
      stops: stops.map((s, idx) => ({
        ...s,
        stopOrder: idx + 1,
        isActive: s.isActive !== false,
      })),
      departureTime: departureTime.trim() || '08:00 AM',
      finalArrivalTime: finalArrivalTime.trim() || '11:00 AM',
      travelDate: travelDate.trim() || 'Daily Morning Commute',
      vehicleType: routeTransport || 'Bike',
      partnerType: partnerCategory || 'Travelling Partner',
      capacityKg: Number(routeCapacityKg) || 50,
      pricePerKg: Number(pricePerKg) || 10,
      totalDistanceKm: Number(totalDistanceKm) || 40,
    };

    let ok = false;
    if (editingRouteId) {
      ok = await handleUpdateRoute(editingRouteId, routePayload);
    } else {
      ok = await handleCreateRoute(routePayload);
    }

    setSubmitting(false);

    if (ok) {
      alert(
        editingRouteId
          ? `Route "${routePayload.routeTitle}" updated with ${stops.length} stopovers!`
          : `New Corridor Route "${routePayload.routeTitle}" published with ${stops.length} stopovers!`
      );
      setEditorOpen(false);
      setEditingRouteId(null);
    }
  };

  // Delete Route
  const onDeleteRoute = async (routeId: string, title: string) => {
    if (!confirm(`Are you sure you want to deactivate corridor "${title}"?`)) return;
    const ok = await handleDeleteRoute(routeId);
    if (ok) {
      alert(`Corridor route "${title}" has been deactivated.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">My Commute Routes & Corridors</h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                {routes.length} ACTIVE CORRIDORS
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Publish and manage your travel routes, intermediate stopovers, and scheduled trips
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/partner/trips/create"
            className="inline-flex items-center gap-1.5 border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl h-9 px-3.5 transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Schedule Trip</span>
          </Link>

          <Button
            onClick={openNewRouteEditor}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Route</span>
          </Button>

          <Button
            onClick={() => loadDashboard()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl h-9"
            title="Refresh routes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Explanatory Info Box */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">How Stopover Route Crowdsourcing Works:</span>
          <p className="text-emerald-800 leading-relaxed">
            When you register a route like <b>PATNA ➔ DARBHANGA</b> with stopovers at <b>HAJIPUR</b>, <b>MUZAFFARPUR</b>, and <b>SAMASTIPUR</b>, customers looking for intermediate rides (like <i>Patna ➔ Muzaffarpur</i> or <i>Hajipur ➔ Samastipur</i>) will automatically match your trip. Our engine ensures parcels move in forward order with guaranteed vehicle capacity!
          </p>
        </div>
      </div>

      {/* VISUAL ROUTE EDITOR MODAL / FORM (Section 2, 4, 22) */}
      {editorOpen && (
        <Card className="rounded-2xl border-emerald-300 shadow-md bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-emerald-100 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {editingRouteId ? 'Edit Route & Stopovers' : 'Create Visual Corridor Route'}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure your start location, intermediate stopovers, and arrival/departure times
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditorOpen(false);
                setEditingRouteId(null);
              }}
              variant="ghost"
              size="sm"
              className="rounded-full text-gray-500 hover:bg-emerald-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={onSaveRoute} className="space-y-8">
              {/* Route General Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Route Title / Description</label>
                  <Input
                    placeholder="e.g. Patna ➔ Darbhanga Express Corridor"
                    value={routeTitle}
                    onChange={(e) => setRouteTitle(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Vehicle Transport</label>
                  <select
                    value={routeTransport}
                    onChange={(e) => setRouteTransport(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-lg border border-gray-300 bg-white"
                  >
                    {TRANSPORT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Partner Category</label>
                  <select
                    value={partnerCategory}
                    onChange={(e) => setPartnerCategory(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-lg border border-gray-300 bg-white"
                  >
                    {PARTNER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Available Capacity (KG)</label>
                  <Input
                    type="number"
                    min="1"
                    value={routeCapacityKg}
                    onChange={(e) => setRouteCapacityKg(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Corridor Pricing (₹/KG)</label>
                  <Input
                    type="number"
                    min="1"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Total Distance (KM)</label>
                  <Input
                    type="number"
                    min="1"
                    value={totalDistanceKm}
                    onChange={(e) => setTotalDistanceKm(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Travel Frequency / Schedule</label>
                  <Input
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    placeholder="e.g. Daily Morning Commute or Today"
                    className="text-xs bg-white"
                  />
                </div>
              </div>

              {/* VISUAL JOURNEY TIMELINE (Section 4 Requirement) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>Visual Route Journey</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-800 border-emerald-200">
                      {stops.length} STOPOVER{stops.length === 1 ? '' : 'S'}
                    </Badge>
                  </h3>
                  <span className="text-xs text-gray-500">
                    Stops must follow forward chronological sequence
                  </span>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/20 rounded-2xl p-5 space-y-4">
                  {/* START LOCATION NODE */}
                  <div className="bg-white border-2 border-emerald-400 rounded-xl p-4 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                          START
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Origin Location
                            </span>
                          </div>
                          <Input
                            placeholder="Starting Village or City (e.g. Patna)"
                            value={sourceCity}
                            onChange={(e) => setSourceCity(e.target.value)}
                            className="font-bold text-gray-900 text-sm mt-1 h-9"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right">
                          <label className="text-[10px] uppercase font-bold text-gray-400 block">
                            Departure Time
                          </label>
                          <Input
                            placeholder="e.g. 08:00 AM"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                            className="text-xs font-semibold text-gray-800 w-32 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Stop Button between Start and First Stop */}
                  <div className="flex flex-col items-center justify-center my-1">
                    <div className="w-0.5 h-4 bg-emerald-300"></div>
                    <Button
                      type="button"
                      onClick={() => handleOpenAddStop(0)}
                      variant="outline"
                      size="sm"
                      className="border-dashed border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-100 text-xs rounded-full px-4 h-7 my-1 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Stop</span>
                    </Button>
                    <div className="w-0.5 h-4 bg-emerald-300"></div>
                  </div>

                  {/* INTERMEDIATE STOPS */}
                  {stops.map((stop, idx) => (
                    <React.Fragment key={stop.stopId || idx}>
                      <div className="bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black text-xs">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">
                                  {stop.name}
                                </span>
                                {stop.district && (
                                  <span className="text-[11px] text-gray-500">
                                    ({stop.district})
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400 block">
                                {stop.address || stop.village || 'Registered Stopover'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 self-end md:self-center">
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                                Arrival ➔ Departure
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                <span>{stop.expectedArrival || '09:00 AM'}</span>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <span>{stop.expectedDeparture || '09:10 AM'}</span>
                              </div>
                            </div>

                            {/* Stop Actions: Reorder, Edit, Remove */}
                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                              <button
                                type="button"
                                onClick={() => handleMoveStop(idx, 'UP')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-white rounded text-gray-600 disabled:opacity-30"
                                title="Move stop up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStop(idx, 'DOWN')}
                                disabled={idx === stops.length - 1}
                                className="p-1 hover:bg-white rounded text-gray-600 disabled:opacity-30"
                                title="Move stop down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditStop(idx)}
                                className="p-1 hover:bg-white rounded text-emerald-600"
                                title="Edit stop details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStop(idx)}
                                className="p-1 hover:bg-white rounded text-red-600"
                                title="Remove stop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add Stop Button between stops */}
                      <div className="flex flex-col items-center justify-center my-1">
                        <div className="w-0.5 h-4 bg-emerald-300"></div>
                        <Button
                          type="button"
                          onClick={() => handleOpenAddStop(idx + 1)}
                          variant="outline"
                          size="sm"
                          className="border-dashed border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-100 text-xs rounded-full px-4 h-7 my-1 gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Stop</span>
                        </Button>
                        <div className="w-0.5 h-4 bg-emerald-300"></div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* FINAL DESTINATION NODE */}
                  <div className="bg-white border-2 border-teal-500 rounded-xl p-4 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs">
                          END
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Final Destination
                            </span>
                          </div>
                          <Input
                            placeholder="Destination Village or City (e.g. Darbhanga)"
                            value={destCity}
                            onChange={(e) => setDestCity(e.target.value)}
                            className="font-bold text-gray-900 text-sm mt-1 h-9"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right">
                          <label className="text-[10px] uppercase font-bold text-gray-400 block">
                            Expected Arrival
                          </label>
                          <Input
                            placeholder="e.g. 01:30 PM"
                            value={finalArrivalTime}
                            onChange={(e) => setFinalArrivalTime(e.target.value)}
                            className="text-xs font-semibold text-gray-800 w-32 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingRouteId(null);
                  }}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm px-6"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  )}
                  <span>{editingRouteId ? 'Update & Save Route' : 'Publish Route Corridor'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ADD / EDIT STOPOVER MODAL (Section 3) */}
      {stopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">
                  {editingStopIndex !== null ? 'Edit Stopover' : 'Add Stopover Location'}
                </h3>
              </div>
              <button
                onClick={() => setStopModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStopover} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Stop Name / Town *</label>
                <Input
                  placeholder="e.g. Hajipur or Muzaffarpur"
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Village / Locality</label>
                  <Input
                    placeholder="e.g. Baghmali"
                    value={stopVillage}
                    onChange={(e) => setStopVillage(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">District</label>
                  <Input
                    placeholder="e.g. Vaishali"
                    value={stopDistrict}
                    onChange={(e) => setStopDistrict(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Detailed Address / Stand</label>
                <Input
                  placeholder="e.g. Near Gandhi Chowk Bus Stand"
                  value={stopAddress}
                  onChange={(e) => setStopAddress(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">State</label>
                  <Input
                    value={stopState}
                    onChange={(e) => setStopState(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">PIN Code</label>
                  <Input
                    placeholder="e.g. 844101"
                    value={stopPinCode}
                    onChange={(e) => setStopPinCode(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Expected Arrival Time</label>
                  <Input
                    placeholder="e.g. 09:00 AM"
                    value={stopExpectedArrival}
                    onChange={(e) => setStopExpectedArrival(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Expected Departure Time</label>
                  <Input
                    placeholder="e.g. 09:10 AM"
                    value={stopExpectedDeparture}
                    onChange={(e) => setStopExpectedDeparture(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Waiting Time (Minutes)</label>
                <Input
                  type="number"
                  min="0"
                  value={stopWaitingMinutes}
                  onChange={(e) => setStopWaitingMinutes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Latitude (Optional)</label>
                  <Input
                    placeholder="e.g. 25.6858"
                    value={stopLatitude}
                    onChange={(e) => setStopLatitude(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Longitude (Optional)</label>
                  <Input
                    placeholder="e.g. 85.2155"
                    value={stopLongitude}
                    onChange={(e) => setStopLongitude(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStopModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {editingStopIndex !== null ? 'Save Stop Changes' : 'Add Stop'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXISTING ROUTES LIST (Section 1 Requirement) */}
      {routes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No active corridors published yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Publish your daily commute or frequent travel routes so regional customers can book parcel slots along your journey.
          </p>
          <Button
            onClick={openNewRouteEditor}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Register First Route</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => {
            const originName =
              route.sourceLocation?.villageOrCity ||
              route.sourceLocation?.addressLine ||
              route.routeTitle?.split('➔')[0]?.trim() ||
              'Start';

            const destName =
              route.destinationLocation?.villageOrCity ||
              route.destinationLocation?.addressLine ||
              route.routeTitle?.split('➔')[1]?.trim() ||
              'End';

            const activeStops = (route.stops || []).filter((s) => s.isActive !== false);
            const routeCode = `LP-RT-${route._id.slice(-6).toUpperCase()}`;

            return (
              <Card
                key={route._id}
                className="rounded-2xl border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Top Header: Route ID & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {routeCode}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      {route.status ? route.status.toUpperCase() : 'ACTIVE CORRIDOR'}
                    </Badge>
                  </div>

                  {/* Origin to Destination */}
                  <div className="flex items-center gap-2 text-base font-black text-gray-900">
                    <span>{originName}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{destName}</span>
                  </div>

                  {/* Route Specs Grid (Section 1) */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Number of Stopovers
                      </span>
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        {activeStops.length} {activeStops.length === 1 ? 'Stop' : 'Stops'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Transport Type
                      </span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-gray-500" />
                        {route.vehicleType || 'Two-Wheeler / Bike'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Partner Type
                      </span>
                      <span className="font-semibold text-gray-800">
                        {route.partnerType || 'Travelling Partner'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Schedule / Departure
                      </span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {route.departureTime || '08:00 AM'}
                      </span>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Available Capacity
                      </span>
                      <span className="font-bold text-gray-900 font-mono">
                        {route.capacityKg ? `${route.capacityKg} kg cargo` : '50 kg cargo'}
                      </span>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Corridor Pricing
                      </span>
                      <span className="font-bold text-emerald-700 font-mono">
                        ₹{route.pricePerKg ?? 10} / kg
                      </span>
                    </div>
                  </div>

                  {/* Stopover Journey Strip Preview */}
                  {activeStops.length > 0 && (
                    <div className="space-y-1.5 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                        Stops Sequence & ETAs:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-700 font-medium">
                        <span className="font-bold text-emerald-950">{originName}</span>
                        {activeStops.map((st, i) => (
                          <React.Fragment key={st.stopId || i}>
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-900 text-[11px] shadow-2xs font-semibold">
                              {st.name} <span className="text-gray-400 font-normal">({st.expectedArrival || 'ETA'})</span>
                            </span>
                          </React.Fragment>
                        ))}
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-teal-950">{destName}</span>
                      </div>
                    </div>
                  )}

                  {/* Date information */}
                  <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1">
                    <span>
                      {route.travelDate || 'Daily Service'}
                    </span>
                    <span>
                      {route.createdAt ? `Created ${new Date(route.createdAt).toLocaleDateString()}` : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Card Actions: Schedule Trip, Edit Route & Deactivate */}
                <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2">
                  <Link
                    href={`/partner/trips/create?routeId=${route._id}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-8 px-3 transition-colors shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Trip</span>
                  </Link>

                  <Button
                    onClick={() => openEditRoute(route)}
                    variant="outline"
                    size="sm"
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs font-bold rounded-xl h-8 px-3 gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Route</span>
                  </Button>

                  <Button
                    onClick={() => onDeleteRoute(route._id, route.routeTitle)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 text-xs font-medium rounded-xl h-8 px-2"
                    title="Deactivate corridor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
