'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../../context/BusinessContext';
import {
  Truck,
  CalendarCheck,
  MapPin,
  Clock,
  PlusCircle,
  Package,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export default function BusinessPickupsPage() {
  const { business, pickupLocations, createPickupRequest } = useBusiness();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    warehouseAddress: '',
    scheduledDate: 'Today',
    scheduledTime: '02:30 PM - 04:30 PM',
    packageCount: 8,
    cargoType: 'Cartons / Corrugated Boxes',
    notes: 'Please bring loading dolly or pallet jack.',
  });

  const [pickupHistory, setPickupHistory] = useState([
    {
      requestId: 'PKP-892401',
      warehouseAddress: business?.registeredAddress?.addressLine || 'Main Logistics Warehouse Hub, Sector 4',
      scheduledTime: 'Today, 03:00 PM',
      packageCount: 14,
      cargoType: 'Agricultural Produce / Grains',
      status: 'DISPATCHED_TO_CORRIDOR',
      assignedTransporter: 'Mohan Sharma (Tata Ace #UP32-AK-4412)',
      createdAt: '1 hour ago',
    },
    {
      requestId: 'PKP-771923',
      warehouseAddress: business?.registeredAddress?.addressLine || 'Main Logistics Warehouse Hub, Sector 4',
      scheduledTime: 'Yesterday, 11:30 AM',
      packageCount: 6,
      cargoType: 'Machinery Spare Parts',
      status: 'COMPLETED',
      assignedTransporter: 'Vikram Singh (Mahindra Bolero #UP32-EZ-9011)',
      createdAt: 'Yesterday',
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createPickupRequest({
        warehouseAddress: formData.warehouseAddress || business?.registeredAddress?.addressLine,
        scheduledTime: `${formData.scheduledDate}, ${formData.scheduledTime}`,
        packageCount: Number(formData.packageCount) || 5,
        notes: `${formData.cargoType} • ${formData.notes}`,
      });

      if (res.success) {
        setPickupHistory((prev) => [
          {
            requestId: res.pickupRequest?.requestId || `PKP-${Math.floor(100000 + Math.random() * 900000)}`,
            warehouseAddress: formData.warehouseAddress || business?.registeredAddress?.addressLine || 'Warehouse Facility',
            scheduledTime: `${formData.scheduledDate}, ${formData.scheduledTime}`,
            packageCount: Number(formData.packageCount) || 5,
            cargoType: formData.cargoType,
            status: 'DISPATCHED_TO_CORRIDOR',
            assignedTransporter: 'Broadcasting to Corridor Transporters...',
            createdAt: 'Just now',
          },
          ...prev,
        ]);
        setShowModal(false);
        alert(res.message || 'Pickup request scheduled successfully!');
      }
    } catch (err: any) {
      alert(`Could not schedule pickup: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Warehouse Pickup Requests
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Request LocalHaat corridor transporters and small commercial trucks to collect batch cargo at your facility.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule Warehouse Pickup
        </Button>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-200/70 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <strong className="block font-bold mb-0.5">Automated Corridor Dispatch</strong>
          When you schedule a pickup, available corridor drivers and small freight vehicles travelling near your warehouse route receive an instant dispatch dispatch notification with GPS routing.
        </div>
      </div>

      {/* Scheduled Requests List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Pickup Schedule & Corridor Status</h3>
          <span className="text-xs text-gray-400 font-medium">Total: {pickupHistory.length} Requests</span>
        </div>

        <div className="divide-y divide-gray-100">
          {pickupHistory.map((item, idx) => (
            <div key={idx} className="p-5 hover:bg-gray-50/50 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-gray-900">
                    {item.requestId}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold'
                        : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold animate-pulse'
                    }
                  >
                    {item.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Scheduled: <strong className="text-gray-800">{item.scheduledTime}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Warehouse Location</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                    {item.warehouseAddress}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Consignment Package Count</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1 mt-0.5">
                    <Package className="w-3 h-3 text-amber-500 shrink-0" />
                    {item.packageCount} Packages • {item.cargoType}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Transport Vehicle</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1 mt-0.5">
                    <Truck className="w-3 h-3 text-blue-500 shrink-0" />
                    {item.assignedTransporter}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-gray-900">Schedule Warehouse Transporter Pickup</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Select Warehouse Facility</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                  value={formData.warehouseAddress}
                  onChange={(e) => setFormData({ ...formData, warehouseAddress: e.target.value })}
                >
                  <option value="">Primary Facility ({business?.registeredAddress?.addressLine || 'Warehouse'})</option>
                  {pickupLocations?.map((loc: any, idx: number) => (
                    <option key={idx} value={loc.addressLine}>
                      {loc.addressLine} ({loc.villageOrCity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Pickup Date</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Day After Tomorrow">Day After Tomorrow</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Time Window Slot</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  >
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Morning)</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                    <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Estimated Packages</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.packageCount}
                    onChange={(e) => setFormData({ ...formData, packageCount: Number(e.target.value) })}
                    className="rounded-xl h-10 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Packaging Type</label>
                  <Input
                    value={formData.cargoType}
                    onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Special Loading Notes for Driver</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                  placeholder="Gate #2, contact warehouse manager..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 text-xs"
              >
                {submitting ? 'Scheduling Transporter...' : 'Confirm Corridor Pickup'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
