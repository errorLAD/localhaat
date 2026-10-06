'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  BarChart3,
  ArrowLeft,
  Truck,
  Users,
  Navigation,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const parcelsByTransport = data?.parcelsByTransport || [];
  const partnersByTransport = data?.partnersByTransport || [];
  const mostActiveRoutes = data?.mostActiveRoutes || [];
  const topPartners = data?.topPartners || [];

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
              Logistics Fleet Performance & Route Analytics
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              REAL-TIME AGGREGATION
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Multi-modal transport distribution, top performing routes, and partner delivery leaderboards from MongoDB.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchAnalytics} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Parcels by Transport */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b pb-2">
            <Truck className="w-4 h-4 text-sky-600" />
            Parcels by Preferred Transport
          </h2>
          <div className="space-y-2">
            {parcelsByTransport.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No parcel transport aggregations available.</p>
            ) : (
              parcelsByTransport.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs">
                  <span className="font-bold text-gray-800">{item._id || 'Standard'}</span>
                  <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-mono font-bold">
                    {item.count} Parcels
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Partners by Transport */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b pb-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Partners by Fleet Vehicle Type
          </h2>
          <div className="space-y-2">
            {partnersByTransport.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No partner transport aggregations available.</p>
            ) : (
              partnersByTransport.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs">
                  <span className="font-bold text-gray-800">{item._id || 'Bike'}</span>
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-mono font-bold">
                    {item.count} Partners
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Active Routes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b pb-2">
            <Navigation className="w-4 h-4 text-purple-600" />
            Most Active Transport Corridors
          </h2>
          <div className="space-y-2">
            {mostActiveRoutes.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No route trip activity recorded yet.</p>
            ) : (
              mostActiveRoutes.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs space-y-1">
                  <div className="font-bold text-gray-900">{item._id}</div>
                  <div className="flex justify-between text-purple-800 text-[11px] font-semibold">
                    <span>{item.tripsCount} Completed Trips</span>
                    <span>{item.parcelsTotal || 0} Carried Parcels</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Partner Leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b pb-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            Top Performing Logistics Partners
          </h2>
          <div className="space-y-2">
            {topPartners.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No partner records available.</p>
            ) : (
              topPartners.map((partner: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-xs">
                  <div>
                    <div className="font-extrabold text-gray-900">{partner.businessName}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{partner.partnerCode} • {partner.primaryTransportType}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 block">
                      ₹{(partner.totalEarnings || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {partner.totalParcelsDelivered || 0} delivered
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
