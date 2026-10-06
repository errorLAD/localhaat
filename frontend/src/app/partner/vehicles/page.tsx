'use client';

import React, { useState } from 'react';
import { usePartner } from '../../../context/PartnerContext';
import {
  Bike,
  Truck,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
  RefreshCw,
  Car,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';

const VEHICLE_OPTIONS = [
  'Pickup (Tata Ace / Bolero Maxi)',
  'Bus (Regional / Inter-District)',
  'Auto Cargo (3-Wheeler Tempo)',
  'E-Rickshaw Cargo / Toto',
  'Tractor Trolley',
  'Delivery Van / Maruti Eeco',
  'Mini Truck (Tata 407 / 6-Wheeler)',
  'Heavy Commercial Truck (10+ Wheeler)',
  'Bike / Motorcycle',
  'Cycle',
  'Other Commercial Transport',
];

export default function RegisteredTransportPage() {
  const {
    vehicles,
    drivers,
    loading,
    loadDashboard,
    handleRegisterVehicle,
  } = usePartner();

  const [formOpen, setFormOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState('Pickup (Tata Ace / Bolero Maxi)');
  const [regNumber, setRegNumber] = useState('');
  const [modelName, setModelName] = useState('Tata Ace Gold');
  const [vehCapacityKg, setVehCapacityKg] = useState('750');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const reg =
      regNumber.trim() ||
      `BR-${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const drv = drivers?.find((d) => d._id === assignedDriverId);

    const ok = await handleRegisterVehicle({
      vehicleType,
      registrationNumber: reg,
      modelName,
      maxCapacityKg: Number(vehCapacityKg) || 50,
      driverId: assignedDriverId || undefined,
      driverName: drv?.name,
    });
    setSubmitting(false);
    if (ok) {
      alert(`Vehicle (${vehicleType} - ${modelName} [${reg}]) registered successfully!`);
      setFormOpen(false);
      setRegNumber('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Registered Transport & Fleet</h1>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-bold">
                {vehicles.length} {vehicles.length === 1 ? 'VEHICLE' : 'VEHICLES'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Two-wheelers, auto-rickshaws, and commuter vehicles registered to carry rural parcels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setFormOpen(!formOpen)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{formOpen ? 'Cancel' : 'Add Vehicle'}</span>
          </Button>

          <Button
            onClick={() => loadDashboard()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Add Vehicle Form */}
      {formOpen && (
        <Card className="rounded-2xl border-purple-300 shadow-md animate-in fade-in overflow-hidden">
          <CardHeader className="bg-purple-50/70 border-b border-purple-100 py-4">
            <CardTitle className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-700" />
              Register New Commuter Transport Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Transport Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {VEHICLE_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Vehicle Model Name
                  </label>
                  <Input
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. Hero Splendor Plus / Bajaj Maxima"
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registration Plate Number (Optional)
                  </label>
                  <Input
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. BR-07-AK-4192 (auto-generates if empty)"
                    className="text-xs h-9 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Max Safe Cargo Capacity (kg)
                  </label>
                  <Input
                    type="number"
                    value={vehCapacityKg}
                    onChange={(e) => setVehCapacityKg(e.target.value)}
                    placeholder="750"
                    min="1"
                    max="10000"
                    required
                    className="text-xs h-9 font-mono"
                  />
                </div>

                {drivers && drivers.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Assign Authorized Driver
                    </label>
                    <select
                      value={assignedDriverId}
                      onChange={(e) => setAssignedDriverId(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Owner Drives (Self)</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <Card className="rounded-2xl border-gray-200 p-8 text-center text-gray-500">
          <Bike className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-700">No vehicles registered yet</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Add your bikes, autos, or transport vehicles to start accepting rural parcels and deliveries.
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Vehicle</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {vehicles.map((v: any) => (
            <Card
              key={v._id}
              className="rounded-2xl border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    ACTIVE • VERIFIED
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {v.model || v.modelName || 'Commuter Transport'}
                  </h4>
                  <p className="text-xs text-gray-500">{v.vehicleType || 'Two-Wheeler'}</p>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between font-mono text-xs">
                  <span className="text-gray-500 text-[11px]">Plate Number:</span>
                  <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                    {v.registrationNumber || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-gray-600">
                  <span>Safe Cargo Load:</span>
                  <span className="font-bold font-mono text-purple-700">
                    {v.maxCapacityKg ? `${v.maxCapacityKg} kg max` : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
