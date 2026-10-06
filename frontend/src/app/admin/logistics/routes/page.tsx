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
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsRoutesPage() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsRoutes();
      if (res.success) {
        setRoutes(res.routes || []);
        setTrips(res.trips || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

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
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Logistics Corridors & Routes Directory
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              {routes.length} REGISTERED CORRIDORS
            </Badge>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={fetchRoutes} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-2">
            <Navigation className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-700">No corridor routes created yet.</p>
          </div>
        ) : (
          routes.map((r) => (
            <div key={r._id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-[10px]">
                  {r.vehicleType || 'Bike'}
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[10px]">
                  {r.status || 'Active'}
                </Badge>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">{r.routeTitle}</h3>
                <p className="text-xs text-gray-500">Partner: {r.partnerId?.businessName || 'Designated Fleet'}</p>
              </div>

              <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100 text-xs space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                  <span>{r.sourceLocation?.villageOrCity || 'Origin'}</span>
                  <span className="text-sky-600 font-extrabold">→</span>
                  <span>{r.destinationLocation?.villageOrCity || 'Destination'}</span>
                </div>
                {r.waypoints && r.waypoints.length > 0 && (
                  <div className="text-[10px] text-gray-500">
                    Waypoints: {r.waypoints.map((w: any) => w.villageOrCity).join(', ')}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Capacity</span>
                  <span className="font-mono font-bold text-gray-900">{r.capacityKg || 25} KG</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Departure</span>
                  <span className="font-bold text-gray-800">{r.departureTime || 'Daily'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
