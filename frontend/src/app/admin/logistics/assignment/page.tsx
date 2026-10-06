'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  Zap,
  ArrowLeft,
  Package,
  Users,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function ParcelAssignmentPage() {
  const [loading, setLoading] = useState(true);
  const [parcels, setParcels] = useState<any[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchUnassignedParcels = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminParcels({
        status: 'SEARCHING_FOR_PARTNER',
        limit: '50',
      });
      if (res.success) {
        const parcelList = res.parcels || [];
        setParcels(parcelList);
        if (parcelList.length > 0 && !selectedParcel) {
          handleSelectParcel(parcelList[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedParcels();
  }, []);

  const handleSelectParcel = async (p: any) => {
    setSelectedParcel(p);
    try {
      setMatchingLoading(true);
      const res = await api.getAdminLogisticsMatchingPartners(p.parcelId || p._id);
      if (res.success) {
        setMatches(res.matches || []);
      }
    } catch (err: any) {
      alert(`Error finding matching partners: ${err.message}`);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleAssignPartner = async (m: any) => {
    if (!selectedParcel) return;
    const isScheduled = m.isScheduledTripMatch;
    const destName = m.destinationStop?.name || selectedParcel.deliveryLocation;
    const eta = m.expectedDeliveryTime || 'Standard';

    const confirmMsg = isScheduled
      ? `Assign scheduled trip ${m.tripId} (${m.partnerName}) to parcel ${selectedParcel.parcelId}?\n\n• Pickup: ${m.pickupStop?.name} (${m.pickupStop?.expectedTime})\n• Destination Drop: ${destName} (ETA: ${eta})\n• Segment: Forward verified`
      : `Assign verified partner ${m.partnerName} (${m.primaryTransportType}) to parcel ${selectedParcel.parcelId}?`;

    if (!confirm(confirmMsg)) return;

    try {
      setAssigningId(m.partnerId);
      const payload: any = {
        partnerId: m.partnerId,
        vehicleId: m.vehicleId,
        note: isScheduled
          ? `Matched to scheduled trip ${m.tripId} for destination stop ${destName} with ETA ${eta} (${m.matchScore}% score)`
          : `Matched via Admin Logistics Matching Engine (${m.matchScore}% score)`,
      };

      if (isScheduled) {
        payload.tripId = m.tripMongoId || m.tripId;
        payload.pickupStopId = m.pickupStop?.stopId;
        payload.pickupStopName = m.pickupStop?.name;
        payload.pickupStopOrder = m.pickupStop?.order;
        payload.destinationStopId = m.destinationStop?.stopId;
        payload.destinationStopName = m.destinationStop?.name;
        payload.destinationStopOrder = m.destinationStop?.order;
        payload.expectedPickupTime = m.pickupStop?.expectedTime;
        payload.expectedDeliveryTime = m.expectedDeliveryTime;
      }

      const res = await api.assignAdminLogisticsPartner(selectedParcel.parcelId || selectedParcel._id, payload);

      if (res.success) {
        alert(res.message);
        setSelectedParcel(null);
        setMatches([]);
        fetchUnassignedParcels();
      }
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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
              Intelligent Parcel Partner & Route Stop Matching
            </h1>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
              {parcels.length} AWAITING PARTNER
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Multi-stop timetable matching engine enforcing strict forward directionality (pickup &lt; drop) and date alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/logistics/trips">
            <Button size="sm" variant="outline" className="text-xs font-bold">
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Manage Scheduled Trips
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={fetchUnassignedParcels} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Main Grid: Left = Unassigned Parcels List, Right = Matching Partners Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Parcels List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              Parcels Searching for Partner ({parcels.length})
            </h2>
          </div>

          {parcels.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-gray-800 mt-2">All parcels matched!</p>
              <p className="text-[11px] text-gray-500">No parcels currently awaiting logistics partner assignment.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {parcels.map((p) => {
                const isSelected = selectedParcel && (selectedParcel._id === p._id || selectedParcel.parcelId === p.parcelId);
                const isDemo = p.parcelId?.includes('DEMO');

                return (
                  <div
                    key={p._id || p.parcelId}
                    onClick={() => handleSelectParcel(p)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 shadow-xs'
                        : 'bg-gray-50/60 hover:bg-gray-100/70 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900">{p.parcelId}</span>
                        {isDemo && (
                          <Badge className="bg-purple-100 text-purple-900 border-purple-300 text-[9px] font-black">
                            DEMO
                          </Badge>
                        )}
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-bold">
                        ₹{p.customerOfferPrice}
                      </Badge>
                    </div>

                    <div className="font-semibold text-gray-800 mt-1 truncate">{p.whatIsInside}</div>

                    <div className="text-[11px] text-gray-600 flex items-center gap-1.5 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      <span>{p.pickupLocation}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span>{p.deliveryLocation}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 pt-1.5 border-t border-gray-200/60">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        {p.preferredDeliveryDate || 'Today'}
                      </span>
                      <span>Weight: <strong>{p.weightKg || 1} KG</strong></span>
                      <span className="text-sky-800 font-bold font-mono">Needs: {p.preferredLogisticsType || 'Bike'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Matching Candidates */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-600" />
                Matching Vehicles & Scheduled Route Runs
              </h2>
              {selectedParcel && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Target: <strong className="text-gray-900">{selectedParcel.parcelId}</strong> ({selectedParcel.pickupLocation} ➔ {selectedParcel.deliveryLocation}, {selectedParcel.weightKg || 1} KG)
                  {selectedParcel.preferredDeliveryDate && (
                    <span className="ml-1 text-amber-800 font-semibold">• Date: {selectedParcel.preferredDeliveryDate}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {matchingLoading ? (
            <div className="p-16 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-gray-500">Computing route stop matching & directionality algorithms...</p>
            </div>
          ) : !selectedParcel ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              Select a parcel from the queue on the left to evaluate matching partners and scheduled trips.
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-xs font-bold text-gray-800">No matching partners found for this segment.</h3>
              <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                If the route is in reverse (e.g. Pandaul ➔ Sakri), the intelligent router strictly rejects backwards movement to maintain line discipline.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
              {matches.map((m, idx) => {
                const isScheduled = m.isScheduledTripMatch;

                return (
                  <div
                    key={`${m.partnerId}-${m.tripId || idx}`}
                    className={`p-4 rounded-2xl border-2 transition-all shadow-2xs space-y-3 bg-white ${
                      isScheduled
                        ? 'border-emerald-300 hover:border-emerald-500'
                        : 'border-sky-100 hover:border-sky-300'
                    }`}
                  >
                    {/* Top Row: Partner & Match Type */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900">{m.partnerName}</span>
                          <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-mono text-[10px]">
                            {m.primaryTransportType}
                          </Badge>
                          {isScheduled && (
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-black">
                              SCHEDULED LINE MATCH
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          {isScheduled ? (
                            <span className="font-mono font-bold text-sky-800">Trip: {m.tripId} ({m.travelDate})</span>
                          ) : (
                            <span>Current: {m.currentLocation}</span>
                          )}
                          <span>•</span>
                          <span>Rating: ★ {m.rating}</span>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-right">
                        <div
                          className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                            isScheduled
                              ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                              : 'text-sky-700 bg-sky-50 border-sky-200'
                          }`}
                        >
                          {m.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    {/* SCHEDULED TRIP SPECIFIC ROUTE STOP DETAILS (Section 15, 16, 17, 26) */}
                    {isScheduled && (
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
                        <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                          <span>Matched Route Stops & Timetable</span>
                          <span className="text-emerald-700 font-bold">Forward Segment Verified ✓</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-lg border border-emerald-200">
                            <span className="text-[10px] text-gray-400 block font-semibold">Matched Pickup Point</span>
                            <span className="font-bold text-gray-900 block">{m.pickupStop?.name} (Stop #{m.pickupStop?.order})</span>
                            <span className="text-[10px] text-emerald-800 font-mono font-bold">
                              Pickup Time: {m.pickupStop?.expectedTime}
                            </span>
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-emerald-200">
                            <span className="text-[10px] text-gray-400 block font-semibold">Matched Destination Stop</span>
                            <span className="font-bold text-gray-900 block">{m.destinationStop?.name} (Stop #{m.destinationStop?.order})</span>
                            <span className="text-[10px] text-emerald-800 font-mono font-bold">
                              Expected Drop ETA: {m.expectedDeliveryTime}
                            </span>
                          </div>
                        </div>

                        {/* Full Corridor Sequence */}
                        {m.routeSequence && (
                          <div className="text-[10px] text-gray-600 flex items-center gap-1 flex-wrap pt-0.5">
                            <span className="font-semibold text-gray-700">Trip Line:</span>
                            {m.routeSequence.map((ptName: string, pIdx: number) => (
                              <React.Fragment key={pIdx}>
                                {pIdx > 0 && <span className="text-gray-400">➔</span>}
                                <span
                                  className={`px-1.5 py-0.5 rounded ${
                                    ptName === m.pickupStop?.name || ptName === m.destinationStop?.name
                                      ? 'bg-emerald-200 text-emerald-900 font-bold'
                                      : 'bg-white text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  {ptName}
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Match Explanation Tag */}
                    <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{m.matchExplanation}</span>
                    </div>

                    {/* Capacity & Earnings Bar */}
                    <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Available Free</span>
                        <span className="font-mono font-bold text-gray-900">{m.availableCapacityKg} KG</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Active Carried</span>
                        <span className="font-bold text-gray-800">{m.activeParcelsCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Partner Earning</span>
                        <span className="font-bold font-mono text-emerald-700">₹{m.estimatedEarning}</span>
                      </div>
                    </div>

                    {/* Assign Action Button */}
                    <div className="pt-1 flex items-center justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleAssignPartner(m)}
                        disabled={assigningId === m.partnerId}
                        className={`text-white font-bold text-xs shadow-xs ${
                          isScheduled
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                      >
                        {assigningId === m.partnerId ? 'Assigning...' : `Assign to Parcel (${m.matchScore}%)`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
