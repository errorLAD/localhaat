'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Truck,
  Search,
  RefreshCw,
  UserCheck,
  CheckCircle,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Bike,
  Navigation,
  X,
  Package,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreShippingPage() {
  const [parcels, setParcels] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [supportedVehicles, setSupportedVehicles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Assign Partner Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [assigning, setAssigning] = useState(false);

  const fetchShippingOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreShipping();
      if (res.success) {
        setParcels(res.parcels || []);
        setPartners(res.partners || []);
        setSupportedVehicles(res.supportedVehicles || [
          'Cycle',
          'Bike',
          'Auto',
          'Car',
          'Van/Pickup',
          'Bus/Transport',
          'Approved rail route',
          'Any Available Partner',
        ]);
      }
    } catch (err: any) {
      console.error('Failed to load shipping overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingOverview();
  }, []);

  const openAssignModal = (parcel: any) => {
    setSelectedParcel(parcel);
    setSelectedPartnerId(partners[0]?._id || '');
    setVehicleType(parcel.preferredLogisticsType || 'Bike');
    setModalOpen(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setAssigning(true);

    try {
      const res = await api.assignStoreShipping({
        parcelId: selectedParcel._id,
        partnerId: selectedPartnerId || undefined,
        vehicleType,
      });

      if (res.success) {
        alert(res.message || 'Logistics partner assigned successfully!');
        setModalOpen(false);
        fetchShippingOverview();
      } else {
        alert(res.message || 'Assignment failed');
      }
    } catch (err: any) {
      alert(`Error assigning partner: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleAutoMatch = async (parcel: any) => {
    try {
      const res = await api.assignStoreShipping({
        parcelId: parcel._id,
        vehicleType: 'Bike',
      });
      if (res.success) {
        alert(`Auto-matched parcel to nearest active corridor partner!`);
        fetchShippingOverview();
      } else {
        alert(res.message || 'Auto-match failed');
      }
    } catch (err: any) {
      alert(`Error in auto-match: ${err.message}`);
    }
  };

  const filtered = parcels.filter((p) => {
    const term = search.toLowerCase();
    return (
      !search ||
      p.parcelTrackingNumber?.toLowerCase().includes(term) ||
      p.receiverName?.toLowerCase().includes(term) ||
      p.deliveryLocation?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rural Corridor Dispatch</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Shipping & Courier Delivery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-vendor e-commerce logistics dispatch using LocalHaat's peer courier network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchShippingOverview}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Available Fleet Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">Active Parcels in Transit</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{parcels.length} Dispatches</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Under courier leg management</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">Available Logistics Fleet</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{partners.length} Drivers</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified rural corridor partners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">Multi-Modal Transport Modes</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{supportedVehicles.length} Types</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Cycle, Bike, Auto, Bus, Rail, Van</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Bike className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Tracking Number (LH-TRK-...), recipient, or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
        />
        <Badge className="bg-slate-100 text-slate-600 font-mono text-[10px]">
          {filtered.length} Parcels
        </Badge>
      </div>

      {/* Dispatch Shipments Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading corridor logistics telemetry...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active shipping consignments</h3>
          <p className="text-xs text-slate-500">Orders ready for warehouse pickup will populate this corridor queue.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Origin Warehouse</th>
                  <th className="py-3 px-4">Destination Village</th>
                  <th className="py-3 px-4">Weight & Dimensions</th>
                  <th className="py-3 px-4">Assigned Vehicle Type</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Logistics Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((parcel) => (
                  <tr key={parcel._id} className="hover:bg-slate-50/70 transition">
                    {/* Tracking Code */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-black text-slate-900 text-xs">
                        {parcel.parcelTrackingNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">ID: {parcel.parcelId}</div>
                    </td>

                    {/* Pickup Origin */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>{parcel.pickupLocation || 'Warehouse Hub'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {parcel.pickupAddress}
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ArrowRight className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span>{parcel.deliveryLocation}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {parcel.receiverName} ({parcel.receiverMobile})
                      </div>
                    </td>

                    {/* Weight & Size */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div>{parcel.weightKg || 1} kg</div>
                      <div className="text-[10px] text-slate-400">
                        {parcel.dimensions?.lengthCm || 15}×{parcel.dimensions?.widthCm || 15}×
                        {parcel.dimensions?.heightCm || 15} cm
                      </div>
                    </td>

                    {/* Vehicle Type (Customer sees TYPE, not vehicle registration number) */}
                    <td className="py-3.5 px-4">
                      <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-[10px] font-bold">
                        <Bike className="w-3 h-3 mr-1" />
                        {parcel.preferredLogisticsType || 'Bike'}
                      </Badge>
                      <div className="text-[9px] text-slate-400 mt-0.5">Type-only visible</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          parcel.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                            : ['in_transit', 'partner_accepted', 'PARTNER_ACCEPTED'].includes(parcel.status)
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold'
                            : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                        }
                      >
                        {(parcel.status || 'CREATED').toUpperCase()}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAutoMatch(parcel)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition border border-purple-200 text-[11px] flex items-center gap-1"
                          title="Auto-Match Nearest Available Partner"
                        >
                          <Sparkles className="w-3 h-3" /> Auto
                        </button>
                        <button
                          onClick={() => openAssignModal(parcel)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-[11px] shadow-2xs"
                        >
                          Assign Driver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANUAL LOGISTICS ASSIGNMENT ================= */}
      {modalOpen && selectedParcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assign Logistics Partner</h3>
                <p className="text-xs text-slate-400 font-mono">Consignment #{selectedParcel.parcelTrackingNumber}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Corridor Logistics Partner</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white font-medium"
                >
                  <option value="">Auto-Assign Next Available Partner</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.vehicleType}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supported Vehicle Type (Customer sees Vehicle Type only)
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white font-medium"
                >
                  {supportedVehicles.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Privacy enforced: Customer interface hides plate number and shows transport mode only.
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-sky-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Corridor Handover Route
                </span>
                <p className="text-[11px] text-sky-800">
                  {selectedParcel.pickupLocation} → Local Haat Drop Point → {selectedParcel.deliveryLocation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black shadow-md shadow-sky-600/20 transition flex items-center gap-2"
                >
                  {assigning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Dispatch Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
