'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import {
  Users,
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Ban,
  Package,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Navigation,
  CreditCard,
  History,
  MessageSquareWarning,
  Eye,
  Clock,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';

export default function PartnerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [activeParcels, setActiveParcels] = useState<any[]>([]);
  const [parcelHistory, setParcelHistory] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsPartner(id);
      if (res.success) {
        setPartner(res.partner);
        setVehicles(res.vehicles || []);
        setRoutes(res.routes || []);
        setTrips(res.trips || []);
        setActiveParcels(res.activeParcels || []);
        setParcelHistory(res.parcelHistory || []);
        setEarnings(res.earnings || []);
        setPayouts(res.payouts || []);
        setComplaints(res.complaints || []);
        setActivities(res.activities || []);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleStatusAction = async (action: string) => {
    const reason = prompt(`Please enter reason for ${action}:`);
    if (reason === null) return;
    try {
      setActionLoading(true);
      const res = await api.updateAdminLogisticsPartnerStatus(id, { action, reason });
      if (res.success) {
        alert(res.message);
        fetchProfile();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-gray-500">Loading 360° Partner Profile...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-gray-900">Partner not found.</h2>
        <Button onClick={() => router.back()} size="sm">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <Link
            href="/admin/logistics/partners"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Partners Directory
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {partner.businessName}
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-mono text-xs">
              {partner.partnerCode || id.slice(-6)}
            </Badge>
            <Badge
              className={`text-xs font-extrabold ${
                partner.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {partner.verificationStatus}
            </Badge>
            <Badge
              className={`text-xs font-bold ${
                partner.partnerStatus === 'MOVING'
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-blue-100 text-blue-900 border-blue-200'
              }`}
            >
              {partner.partnerStatus}
            </Badge>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {partner.verificationStatus !== 'VERIFIED' && (
            <Button
              size="sm"
              onClick={() => handleStatusAction('VERIFY')}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Verify Partner
            </Button>
          )}

          {partner.verificationStatus !== 'SUSPENDED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusAction('SUSPEND')}
              disabled={actionLoading}
              className="text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Suspend
            </Button>
          )}

          {partner.verificationStatus !== 'BLOCKED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusAction('BLOCK')}
              disabled={actionLoading}
              className="text-xs font-bold text-red-700 border-red-300 hover:bg-red-50"
            >
              <Ban className="w-3.5 h-3.5 mr-1" />
              Block
            </Button>
          )}

          {(partner.verificationStatus === 'SUSPENDED' || partner.verificationStatus === 'BLOCKED') && (
            <Button
              size="sm"
              onClick={() => handleStatusAction('REACTIVATE')}
              disabled={actionLoading}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
            >
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
        {[
          { label: 'Transport', val: partner.primaryTransportType || 'Bike' },
          { label: 'Capacity', val: `${partner.capacityKg || 25} KG` },
          { label: 'Active Parcels', val: activeParcels.length },
          { label: 'Delivered', val: partner.totalParcelsDelivered || 0 },
          { label: 'Trips Completed', val: partner.totalTrips || trips.length },
          { label: 'Lifetime Earnings', val: `₹${(partner.totalEarnings || 0).toLocaleString('en-IN')}` },
        ].map((m, idx) => (
          <div key={idx} className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] text-gray-400 uppercase font-bold">{m.label}</span>
            <span className="text-sm font-extrabold text-gray-900 block mt-0.5">{m.val}</span>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Personal & KYC' },
          { id: 'trips', label: `Trips (${trips.length})` },
          { id: 'parcels', label: `Current Parcels (${activeParcels.length})` },
          { id: 'routes', label: `Routes (${routes.length})` },
          { id: 'earnings', label: `Earnings (${earnings.length})` },
          { id: 'complaints', label: `Complaints (${complaints.length})` },
          { id: 'activity', label: 'Activity Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-sky-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2">Personal & Contact Info</h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Contact Person</span>
                <span className="font-bold text-gray-900">{partner.userId?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Mobile Number</span>
                <span className="font-mono font-bold text-sky-700">{partner.phone || partner.userId?.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Email</span>
                <span className="font-mono text-gray-800">{partner.email || partner.userId?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Address</span>
                <span className="text-gray-800 font-semibold">{partner.address?.addressLine || 'Main Road'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">District & State</span>
                <span className="text-gray-800 font-semibold">{partner.address?.district || 'Darbhanga'}, {partner.address?.state || 'Bihar'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2">KYC & Transport Details</h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Partner Type</span>
                <span className="font-bold text-gray-900">{partner.partnerCategory || 'PROFESSIONAL'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Vehicle Type</span>
                <span className="font-bold text-gray-900">{partner.primaryTransportType || 'Bike'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Vehicle Number</span>
                <span className="font-mono font-bold text-gray-900">{partner.vehicleNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Capacity</span>
                <span className="font-mono font-bold text-emerald-700">{partner.capacityKg || 25} KG</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Service Areas</span>
                <span className="font-medium text-gray-800">{(partner.serviceAreas || []).join(', ') || 'Regional'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parcels' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900">Current Parcels with this Partner ({activeParcels.length})</h3>
          {activeParcels.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No parcels currently in possession of this partner.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Parcel ID</th>
                    <th className="py-2.5 px-3">What is inside</th>
                    <th className="py-2.5 px-3">Pickup → Delivery</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Offer</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeParcels.map((p) => (
                    <tr key={p._id} className="hover:bg-sky-50/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{p.parcelId}</td>
                      <td className="py-2.5 px-3">{p.whatIsInside}</td>
                      <td className="py-2.5 px-3">{p.pickupLocation} → {p.deliveryLocation}</td>
                      <td className="py-2.5 px-3 font-mono">{p.weightKg || 1} KG</td>
                      <td className="py-2.5 px-3">
                        <Badge className="bg-blue-100 text-blue-900 border-blue-200 text-[10px]">{p.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">₹{p.customerOfferPrice}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link href={`/admin/parcels/${p._id}`}>
                          <Button size="sm" variant="outline" className="h-6 text-[10px]">Dossier</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900">Partner Trips ({trips.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trips.map((t) => (
              <div key={t._id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-gray-900">{t.tripId}</span>
                  <Badge className="bg-sky-100 text-sky-900 border-sky-300 text-[10px]">{t.tripStatus}</Badge>
                </div>
                <div className="font-semibold text-gray-800">{t.routeTitle}</div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Parcels: {t.activeParcelCount || 0}</span>
                  <span>Departure: {t.departureTime}</span>
                </div>
                <Link href={`/admin/logistics/trips/${t.tripId}`}>
                  <Button size="sm" className="w-full h-7 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs mt-1">
                    <Eye className="w-3 h-3 mr-1" /> View Trip Dossier
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900">Partner Earnings Log ({earnings.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Base</th>
                  <th className="py-2.5 px-3">Deduction</th>
                  <th className="py-2.5 px-3 text-right">Net Partner Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {earnings.map((e) => (
                  <tr key={e._id}>
                    <td className="py-2 px-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-2 px-3 font-mono">{e.referenceId}</td>
                    <td className="py-2 px-3 font-mono">₹{e.baseAmount}</td>
                    <td className="py-2 px-3 font-mono text-red-600">-₹{e.deduction}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">₹{e.netAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
