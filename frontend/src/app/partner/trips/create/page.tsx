'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartner } from '../../../../context/PartnerContext';
import { PartnerRoute, RouteStop } from '../../../../types';
import {
  Compass,
  MapPin,
  ArrowRight,
  Clock,
  Calendar,
  Bike,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Navigation,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';

function CreateTripFromRouteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { routes, handleCreateTrip, vehicles } = usePartner();

  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<PartnerRoute | null>(null);

  const [travelDate, setTravelDate] = useState<string>('Today');
  const [departureTime, setDepartureTime] = useState<string>('08:00 AM');
  const [finalArrivalTime, setFinalArrivalTime] = useState<string>('11:00 AM');
  const [finalDestinationName, setFinalDestinationName] = useState<string>('');
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-select route from query param or first route
  useEffect(() => {
    if (routes.length > 0) {
      const qRouteId = searchParams.get('routeId');
      if (qRouteId && routes.some((r) => r._id === qRouteId)) {
        handleSelectRoute(qRouteId);
      } else if (!selectedRouteId) {
        handleSelectRoute(routes[0]._id);
      }
    }
  }, [routes, searchParams]);

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    const found = routes.find((r) => r._id === routeId);
    if (found) {
      setSelectedRoute(found);
      setDepartureTime(found.departureTime || '08:00 AM');
      setFinalArrivalTime(found.finalArrivalTime || '11:00 AM');
      setFinalDestinationName(found.destinationLocation?.villageOrCity || '');

      const activeStops = (found.stops || []).filter((s) => s.isActive !== false);
      setStops(
        activeStops.map((s, idx) => ({
          ...s,
          stopOrder: s.stopOrder || idx + 1,
        }))
      );
    }
  };

  const handleUpdateStopTime = (idx: number, field: 'expectedArrival' | 'expectedDeparture', val: string) => {
    const updated = [...stops];
    updated[idx] = { ...updated[idx], [field]: val };
    setStops(updated);
  };

  const onPublishTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) {
      setErrorMsg('Please select a corridor route.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const vehicle = vehicles && vehicles.length > 0 ? vehicles[0] : null;

    const payload = {
      routeId: selectedRoute._id,
      routeTitle: selectedRoute.routeTitle,
      transportType: selectedRoute.vehicleType || 'Bike',
      vehicleId: vehicle?._id,
      vehicleNumber: vehicle?.registrationNumber,
      travelDate: travelDate.trim() || 'Today',
      departureTime: departureTime.trim() || '08:00 AM',
      expectedArrival: finalArrivalTime.trim() || '11:00 AM',
      startLocation: {
        name: selectedRoute.sourceLocation.villageOrCity,
        villageOrCity: selectedRoute.sourceLocation.villageOrCity,
        address: selectedRoute.sourceLocation.addressLine || selectedRoute.sourceLocation.villageOrCity,
        departureTime: departureTime.trim() || '08:00 AM',
      },
      finalDestination: {
        name: finalDestinationName.trim() || selectedRoute.destinationLocation.villageOrCity,
        villageOrCity: finalDestinationName.trim() || selectedRoute.destinationLocation.villageOrCity,
        address: selectedRoute.destinationLocation.addressLine || selectedRoute.destinationLocation.villageOrCity,
        expectedArrival: finalArrivalTime.trim() || '11:00 AM',
      },
      stops: stops.map((s, idx) => ({
        stopId: s.stopId || `STOP-${idx + 1}`,
        stopOrder: idx + 1,
        name: s.name,
        villageOrCity: s.village || s.name,
        address: s.address || s.district,
        expectedArrival: s.expectedArrival || '09:00 AM',
        expectedDeparture: s.expectedDeparture || '09:10 AM',
        waitingMinutes: s.waitingMinutes || 10,
        status: 'UPCOMING',
      })),
      totalCapacityKg: selectedRoute.capacityKg || 50,
      pricePerKg: selectedRoute.pricePerKg || 10,
      notes: `Trip published from route ${selectedRoute.routeTitle} for ${travelDate}`,
    };

    const ok = await handleCreateTrip(payload);
    setSubmitting(false);

    if (ok) {
      alert(`Trip published successfully for ${travelDate}!`);
      router.push('/partner/routes');
    } else {
      setErrorMsg('Failed to publish trip. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/partner/routes')}
            className="rounded-xl h-9 px-2.5 text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Routes</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Publish Scheduled Trip</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Instantiate a real dated trip from your planned corridor route with all stopovers
            </p>
          </div>
        </div>

        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
          TRIP DISPATCH ENGINE
        </Badge>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {routes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Planned Routes Available</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You must register a corridor route before scheduling trips.
          </p>
          <Button
            onClick={() => router.push('/partner/routes')}
            className="bg-emerald-600 text-white text-xs font-bold rounded-xl mt-2"
          >
            Go to Partner Routes
          </Button>
        </div>
      ) : (
        <form onSubmit={onPublishTrip} className="space-y-6">
          {/* 1. SELECT ROUTE CARD */}
          <Card className="rounded-2xl border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Step 1: Select Corridor Route</span>
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Choose Planned Route</label>
              <select
                value={selectedRouteId}
                onChange={(e) => handleSelectRoute(e.target.value)}
                className="w-full text-xs h-11 px-3 rounded-xl border border-gray-300 bg-white font-semibold text-gray-800"
              >
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeTitle} ({r.sourceLocation.villageOrCity} ➔ {r.destinationLocation.villageOrCity}) — {r.stops?.length || 0} stops
                  </option>
                ))}
              </select>
            </div>

            {selectedRoute && (
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <span>{selectedRoute.sourceLocation.villageOrCity}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedRoute.destinationLocation.villageOrCity}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium">
                  <span>Transport: <b>{selectedRoute.vehicleType || 'Bike'}</b></span>
                  <span>Capacity: <b>{selectedRoute.capacityKg || 50} KG</b></span>
                  <span>Rate: <b>₹{selectedRoute.pricePerKg || 10}/kg</b></span>
                </div>
              </div>
            )}
          </Card>

          {/* 2. TRIP SCHEDULE CARD */}
          <Card className="rounded-2xl border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Step 2: Travel Date & Start/End Schedules</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Travel Date *</label>
                <Input
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  placeholder="e.g. Today or 10 October 2026"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Start Departure Time *</label>
                <Input
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 08:00 AM"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Final Destination Arrival *</label>
                <Input
                  value={finalArrivalTime}
                  onChange={(e) => setFinalArrivalTime(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  className="text-xs"
                  required
                />
              </div>
            </div>
          </Card>

          {/* 3. STOPOVER SCHEDULE VERIFICATION (Section 13) */}
          <Card className="rounded-2xl border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Step 3: Confirm Expected Times for Each Stop</span>
              </h2>
              <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                {stops.length} Loaded Stops
              </Badge>
            </div>

            {stops.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-gray-50 rounded-xl text-center">
                This route has no intermediate stopovers. The trip will move directly from Origin to Final Destination.
              </p>
            ) : (
              <div className="space-y-3">
                {stops.map((stop, idx) => (
                  <div
                    key={stop.stopId || idx}
                    className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{stop.name}</span>
                        <span className="text-[11px] text-gray-500">{stop.address || stop.village || 'Stopover'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-400">Arr:</span>
                        <Input
                          value={stop.expectedArrival || '09:00 AM'}
                          onChange={(e) => handleUpdateStopTime(idx, 'expectedArrival', e.target.value)}
                          className="w-24 h-7 text-xs px-2"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-400">Dep:</span>
                        <Input
                          value={stop.expectedDeparture || '09:10 AM'}
                          onChange={(e) => handleUpdateStopTime(idx, 'expectedDeparture', e.target.value)}
                          className="w-24 h-7 text-xs px-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/partner/routes')}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting || !selectedRoute}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm px-6 h-10"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>{submitting ? 'Publishing Trip...' : 'Publish Trip to Network'}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreateTripFromRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center text-xs text-gray-500 gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading Route Corridor...</span>
        </div>
      }
    >
      <CreateTripFromRouteContent />
    </Suspense>
  );
}
