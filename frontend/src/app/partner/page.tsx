'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { usePartner } from '../../context/PartnerContext';
import {
  Truck,
  Package,
  Radio,
  Compass,
  Bike,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Power,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Bell,
  Check,
  X,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const {
    partner,
    incomingRequests,
    bookingRequests,
    ringingRequest,
    setRingingRequest,
    activeParcels,
    routes,
    vehicles,
    recentCompletedParcels,
    stats,
    loading,
    isOnline,
    togglingOnline,
    loadDashboard,
    handleToggleOnline,
    handleAcceptBookingRequest,
    handleRejectBookingRequest,
  } = usePartner();

  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [rejectingOfferId, setRejectingOfferId] = useState<string | null>(null);

  const pendingOffers = (bookingRequests || []).filter(
    (b) => b.status === 'PENDING_PARTNER_RESPONSE' && new Date(b.expiresAt).getTime() > Date.now()
  );

  const onAcceptOffer = async (requestId: string) => {
    setAcceptingOfferId(requestId);
    const success = await handleAcceptBookingRequest(requestId);
    setAcceptingOfferId(null);
    if (success) {
      alert('Offer accepted! Locked price confirmed.');
    }
  };

  const onRejectOffer = async (requestId: string) => {
    setRejectingOfferId(requestId);
    await handleRejectBookingRequest(requestId, 'Partner unavailable / Route full');
    setRejectingOfferId(null);
  };

  const totalEarnings = stats?.totalEarnings ?? partner?.walletBalance ?? 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center shadow-md">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {partner?.businessName || user?.name || 'LocalHaat Logistics Partner'}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] uppercase font-bold tracking-wider">
                VERIFIED FLEET
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Travelling Neighbour & Corridor Freight Operator{user?.phone ? ` • Mobile: ${user.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Online Toggle & Status */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'ONLINE: Accepting' : 'OFFLINE: Paused'}</span>
          </button>

          <Button
            onClick={() => loadDashboard()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* DIRECT BOOKING OFFERS ALERT & CARDS */}
      {pendingOffers.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-300 text-yellow-950 px-2 py-0.5 rounded-full">
                    ACTION REQUIRED • RINGING
                  </span>
                  <span className="text-xs text-orange-100 font-bold">
                    {pendingOffers.length} Customer Offer{pendingOffers.length > 1 ? 's' : ''} Waiting
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                  Direct Consignment Booking Offers Along Your Route!
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                type="button"
                onClick={() => {
                  if (pendingOffers[0]) {
                    setRingingRequest(pendingOffers[0]);
                  }
                }}
                className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Open Ringing Alert</span>
              </Button>
              <Link
                href="/partner/requests"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>View All Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            {pendingOffers.map((offer) => (
              <div
                key={offer.requestId}
                className="bg-white rounded-2xl p-5 text-gray-900 border-2 border-orange-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-900 border-orange-300 font-mono font-bold text-xs">
                      #{offer.parcelTrackingNumber || offer.requestId}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-900 border-purple-300 text-xs font-bold">
                      {offer.methodCategory || 'SCHEDULED ROUTE'}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">Trip: {offer.tripCode}</span>
                    <span className="text-xs text-gray-500">• Sender: <strong className="text-gray-800">{offer.customerName}</strong></span>
                    {offer.customerPhone && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {offer.customerPhone}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> Pickup Stop
                      </div>
                      <div className="font-bold text-gray-900">{offer.pickupStop?.name}</div>
                      <div className="text-gray-500 text-[11px]">
                        Dep: {offer.pickupStop?.expectedDeparture || '08:00 AM'}
                      </div>
                    </div>

                    <div className="sm:border-l sm:border-gray-200 sm:pl-3">
                      <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" /> Destination Stop
                      </div>
                      <div className="font-bold text-gray-900">{offer.destinationStop?.name}</div>
                      <div className="text-gray-500 text-[11px]">
                        ETA: {offer.destinationStop?.expectedArrival || '09:45 AM'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span><strong>Weight:</strong> {offer.weightKg} KG</span>
                    <span><strong>Contents:</strong> {offer.whatIsInside || 'Goods'}</span>
                    <span><strong>Category:</strong> {offer.parcelCategory}</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      Offered Net Fare
                    </span>
                    <span className="text-3xl font-black text-emerald-700 font-mono">
                      ₹{offer.offeredPrice}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Price Locked
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => setRingingRequest(offer)}
                      variant="outline"
                      size="sm"
                      className="text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold text-xs px-3 rounded-xl shadow-xs"
                      title="Open full ringing alert modal with live sound"
                    >
                      <Bell className="w-3.5 h-3.5 mr-1 text-amber-600 animate-bounce" /> Ringing Alert
                    </Button>

                    <Button
                      onClick={() => onRejectOffer(offer.requestId)}
                      disabled={rejectingOfferId === offer.requestId || acceptingOfferId === offer.requestId}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50 text-xs px-3 rounded-xl border-gray-200"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Decline
                    </Button>

                    <Button
                      onClick={() => onAcceptOffer(offer.requestId)}
                      disabled={acceptingOfferId === offer.requestId}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 rounded-xl shadow-xs"
                    >
                      {acceptingOfferId === offer.requestId ? (
                        <span>Accepting...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          ACCEPT OFFER ₹{offer.offeredPrice}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/partner/wallet"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group"
        >
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Wallet Earnings
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block mt-1">
            ₹{totalEarnings}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            View Wallet & Payouts <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Completed Hauls
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 block mt-1">
            {stats?.completedTrips ?? stats?.completedCount ?? partner?.totalParcelsDelivered ?? recentCompletedParcels.length ?? 0}
          </span>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            100% On-time delivery rate
          </span>
        </div>

        <Link
          href="/partner/deliveries"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Active Deliveries
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 block mt-1">
            {activeParcels.length}
          </span>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            Manage In-Transit <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/partner/vehicles"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all group"
        >
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Registered Fleet
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 block mt-1">
            {vehicles.length}
          </span>
          <span className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
            Manage Vehicles <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Realtime Alert Banner for New Incoming Requests */}
      {(incomingRequests.length > 0 || pendingOffers.length > 0) && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-950">
                {pendingOffers.length > 0
                  ? `${pendingOffers.length} Direct Route Booking Offer${pendingOffers.length > 1 ? 's' : ''} + ${incomingRequests.length} Corridor Requests Available!`
                  : `${incomingRequests.length} New Corridor Request${incomingRequests.length > 1 ? 's' : ''} Available!`}
              </h4>
              <p className="text-xs text-orange-800">
                Senders are waiting for transporter pickup on your corridor. Accept them now to earn delivery fees.
              </p>
            </div>
          </div>
          <Link
            href="/partner/requests"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs whitespace-nowrap"
          >
            <span>Review & Accept Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Access Grid to Sub-Pages */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs">
          Dedicated Fleet Portals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/partner/requests"
            className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                New Requests
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Live broadcasts and direct route booking offers from senders.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>
                {pendingOffers.length > 0 ? `${pendingOffers.length} Direct + ` : ''}
                {incomingRequests.length} Corridor
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/partner/deliveries"
            className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Active Deliveries
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Assigned consignments, OTP verification, and village hub handover.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>{activeParcels.length} In-Progress</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/partner/routes"
            className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                My Travel Routes
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Configure your daily commuter paths, departure hours, and rates per kg.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>{routes.length} Active Routes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Active Deliveries Quick Glance */}
      {activeParcels.length > 0 && (
        <Card className="rounded-2xl border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                Current Active Deliveries ({activeParcels.length})
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Consignments currently loaded or scheduled for pickup
              </p>
            </div>
            <Link
              href="/partner/deliveries"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open Full Deliveries View <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-gray-100">
            {activeParcels.slice(0, 3).map((parcel) => (
              <div key={parcel._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      {parcel.parcelTrackingNumber}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                      {parcel.status.replace('_', ' ')}
                    </Badge>
                    {parcel.paymentMethod === 'CASH_TO_PARTNER' ? (
                      parcel.paymentStatus === 'PAID' ? (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                          Cash Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                          💵 Collect Cash (₹{parcel.customerOfferPrice ?? 0})
                        </Badge>
                      )
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[10px]">
                        💳 Paid Online
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <span>{parcel.pickupLocation || parcel.pickupAddress || 'Pickup'}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span>{parcel.deliveryLocation || parcel.deliveryAddress || 'Destination'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-700 block">
                      ₹{parcel.customerOfferPrice ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {parcel.weightKg || 1} kg
                    </span>
                  </div>
                  <Link
                    href="/partner/deliveries"
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200 transition-colors"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Parcels */}
      <Card className="rounded-2xl border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recent Completed Hauls & Earnings
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified deliveries with fee credited to your wallet
            </p>
          </div>
          <Link
            href="/partner/wallet"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Wallet Statement <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-gray-100">
          {recentCompletedParcels.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">No completed hauls yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Completed parcel deliveries and credited earnings will appear here once delivered.
              </p>
            </div>
          ) : (
            recentCompletedParcels.map((parcel: any) => (
              <div key={parcel._id} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{parcel.parcelTrackingNumber}</span>
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                      DELIVERED & PAID
                    </Badge>
                  </div>
                  <div className="text-gray-500">
                    {parcel.pickupLocation} → {parcel.deliveryLocation}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    +₹{parcel.customerOfferPrice || 0}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {parcel.weightKg || 0} kg
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
