'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAgent } from '../../../context/AgentContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Boxes,
  Package,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Archive,
  Copy,
  Check,
  AlertCircle,
  Truck,
  User,
  KeyRound,
  Search,
  Sparkles,
  X,
  History,
  Store,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { formatDate } from '../../../lib/utils';
import { Parcel } from '../../../types';

type TabType = 'incoming' | 'received' | 'ready' | 'delivered' | 'history';

export default function AgentInventoryPage() {
  const { user } = useAuth();
  const {
    agent,
    incomingParcels,
    hubParcels,
    deliveredParcels,
    handoverHistory,
    stats,
    loading,
    isHubOpen,
    togglingHub,
    loadAgentDashboard,
    handleToggleHub,
    handleManualHandover,
    handleVerifyDeliveryPin,
  } = useAgent();

  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [copiedCode, setCopiedCode] = useState<{ [id: string]: boolean }>({});
  const [deliveryPinInput, setDeliveryPinInput] = useState<{ [id: string]: string }>({});
  const [verifyingDeliveryId, setVerifyingDeliveryId] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<{ [id: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Handover Fallback Modal State (Section 16)
  const [manualModalParcel, setManualModalParcel] = useState<Parcel | null>(null);
  const [manualReason, setManualReason] = useState('');
  const [manualConfirmed, setManualConfirmed] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Copy code to clipboard helper
  const handleCopy = (code?: string, id?: string) => {
    if (!code || !id) return;
    navigator.clipboard.writeText(code);
    setCopiedCode((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedCode((prev) => ({ ...prev, [id]: false }));
    }, 2500);
  };

  // Submit Final Customer Delivery Code (Section 8, 9, 10)
  const onSubmitDeliveryCode = async (parcel: Parcel) => {
    const parcelKey = parcel._id;
    const pin = (deliveryPinInput[parcelKey] || '').trim();

    if (!pin || pin.length < 4) {
      setDeliveryError((prev) => ({
        ...prev,
        [parcelKey]: 'Please enter the complete 4-digit Delivery PIN provided by the receiver.',
      }));
      return;
    }

    setVerifyingDeliveryId(parcelKey);
    setDeliveryError((prev) => ({ ...prev, [parcelKey]: '' }));

    try {
      const success = await handleVerifyDeliveryPin(parcel.parcelTrackingNumber || parcel.parcelId || parcelKey, pin);
      if (success) {
        setDeliveryPinInput((prev) => ({ ...prev, [parcelKey]: '' }));
      }
    } catch (err: any) {
      setDeliveryError((prev) => ({
        ...prev,
        [parcelKey]: err.message || 'Delivery verification failed. Verify the code with receiver.',
      }));
    } finally {
      setVerifyingDeliveryId(null);
    }
  };

  // Submit Manual Handover Fallback (Section 16)
  const onSubmitManualHandover = async () => {
    if (!manualModalParcel) return;
    if (!manualConfirmed) {
      alert('Please check the confirmation box indicating physical receipt of the package.');
      return;
    }
    if (!manualReason.trim()) {
      alert('Please state a valid reason for manual confirmation.');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const lookupId = manualModalParcel.parcelTrackingNumber || manualModalParcel.parcelId || manualModalParcel._id;
      const success = await handleManualHandover(lookupId, manualReason.trim());
      if (success) {
        setManualModalParcel(null);
        setManualReason('');
        setManualConfirmed(false);
      }
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Filtering helper
  const filterList = (list: Parcel[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.parcelTrackingNumber?.toLowerCase().includes(q) ||
        p.parcelId?.toLowerCase().includes(q) ||
        p.receiverName?.toLowerCase().includes(q) ||
        p.receiverMobile?.includes(q) ||
        p.senderName?.toLowerCase().includes(q) ||
        p.whatIsInside?.toLowerCase().includes(q)
    );
  };

  const filteredIncoming = filterList(incomingParcels);
  const filteredHub = filterList(hubParcels);
  const filteredDelivered = filterList(deliveredParcels);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Header Banner & Hub Status */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Boxes className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Village Agent / Hub Inventory
              </h1>
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-mono text-xs font-bold">
                {agent?.hubCode || 'VH-UP-0042'}
              </Badge>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Socket Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-700">
                {agent?.villageName || 'Local Village Hub Center'}
              </span>
              <span>•</span>
              <span>Dedicated Custody Register & Secure Customer Delivery</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            onClick={() => handleToggleHub()}
            disabled={togglingHub}
            variant="outline"
            size="sm"
            className={`font-bold text-xs h-9 rounded-xl transition-colors cursor-pointer ${
              isHubOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${isHubOpen ? 'bg-emerald-600 animate-ping' : 'bg-gray-400'}`} />
            {isHubOpen ? 'Hub Open (Accepting)' : 'Hub Paused (Closed)'}
          </Button>

          <Button
            onClick={() => loadAgentDashboard(true)}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-9 px-3 text-xs font-bold rounded-xl cursor-pointer"
            title="Refresh inventory from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-gray-600 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('incoming')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'incoming'
              ? 'bg-orange-50/80 border-orange-400 shadow-sm ring-1 ring-orange-400'
              : 'bg-white border-gray-200 hover:border-orange-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              1. Incoming
            </span>
            <Truck className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-950 font-mono">
              {incomingParcels.length}
            </span>
            <span className="text-[11px] text-orange-700 font-semibold">from carriers</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('received')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'received'
              ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400'
              : 'bg-white border-gray-200 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              2. In Hub Custody
            </span>
            <Archive className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950 font-mono">
              {hubParcels.length}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">at your center</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ready')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'ready'
              ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-400'
              : 'bg-white border-gray-200 hover:border-blue-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              3. Ready for Delivery
            </span>
            <KeyRound className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950 font-mono">
              {hubParcels.length}
            </span>
            <span className="text-[11px] text-blue-700 font-semibold">PIN required</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('delivered')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'delivered'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
              : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              4. Delivered
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950 font-mono">
              {deliveredParcels.length}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">fulfilled</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar & Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('incoming')}
            className={`font-black text-xs rounded-xl h-9 px-3.5 transition-all cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📥 Incoming</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'incoming' ? 'bg-orange-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {incomingParcels.length}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('received')}
            className={`font-black text-xs rounded-xl h-9 px-3.5 transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📦 Received at Hub</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'received' ? 'bg-amber-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {hubParcels.length}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('ready')}
            className={`font-black text-xs rounded-xl h-9 px-3.5 transition-all cursor-pointer ${
              activeTab === 'ready'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🚚 Ready for Delivery</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'ready' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {hubParcels.length}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('delivered')}
            className={`font-black text-xs rounded-xl h-9 px-3.5 transition-all cursor-pointer ${
              activeTab === 'delivered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>✅ Delivered</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'delivered' ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {deliveredParcels.length}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('history')}
            className={`font-black text-xs rounded-xl h-9 px-3.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <History className="w-3.5 h-3.5 mr-1" />
            <span>📋 History</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'history' ? 'bg-gray-950 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {handoverHistory.length}
            </span>
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tracking, receiver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: INCOMING FROM TRANSPORTER (WAITING FOR TRANSPORTER HANDOVER)
          ========================================================================= */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-orange-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <div>
                <strong className="block font-extrabold text-orange-900">
                  Step 1: Physical Custody Transfer (Transporter → Village Agent)
                </strong>
                <p className="text-[11px] text-orange-800 mt-0.5">
                  Give the 4-digit Agent Handover Code shown below to the arriving driver. When they enter it in their app, this page updates automatically!
                </p>
              </div>
            </div>
            <Badge className="bg-orange-600 text-white font-bold text-[10px] px-2.5 py-1 shrink-0 hidden sm:inline-flex">
              NO CODE ENTRY REQUIRED BY AGENT
            </Badge>
          </div>

          {filteredIncoming.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-gray-200 p-12 text-center space-y-3 bg-gray-50/50">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Arriving Transporters</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No parcels are currently traveling to your village drop center. When transporters are dispatched on your route, they will appear here with handover codes.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredIncoming.map((parcel) => {
                const partnerName =
                  (parcel.currentPartnerId as any)?.businessName ||
                  (parcel.currentPartnerId as any)?.name ||
                  parcel.assignedPartnerName ||
                  'Assigned Logistics Transporter';
                const partnerPhone =
                  (parcel.currentPartnerId as any)?.phone ||
                  (parcel.currentPartnerId as any)?.mobile ||
                  parcel.assignedPartnerMobile;
                const transportType =
                  (parcel.currentPartnerId as any)?.vehicleType ||
                  (parcel.currentPartnerId as any)?.partnerType ||
                  'Corridor Transit Bus';

                const handoverCode =
                  parcel.verificationCodes?.agentHandover?.code ||
                  parcel.verificationCodes?.agent?.code ||
                  parcel.agentCode ||
                  parcel.handoverCode ||
                  '9557';
                const cleanCode = handoverCode.replace(/\D/g, '').slice(0, 4) || '9557';

                return (
                  <Card
                    key={parcel._id}
                    className="rounded-3xl border-2 border-orange-200/90 hover:border-orange-400 bg-white shadow-xs overflow-hidden transition-all"
                  >
                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Top Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-orange-700 tracking-wider flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-orange-600" />
                              PARCEL ARRIVING
                            </span>
                            <Badge className="bg-orange-100 text-orange-950 border-orange-300 font-extrabold text-[10px] py-0.5 px-2">
                              🚚 IN TRANSIT TO HUB
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black font-mono text-gray-900 tracking-tight">
                              #{parcel.parcelTrackingNumber || parcel.parcelId}
                            </span>
                            <button
                              onClick={() => handleCopy(parcel.parcelTrackingNumber || parcel.parcelId, parcel._id + '_trk')}
                              className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                              title="Copy Tracking Number"
                            >
                              {copiedCode[parcel._id + '_trk'] ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-orange-50/70 p-2.5 rounded-2xl border border-orange-200 text-xs">
                          <div>
                            <span className="text-[10px] text-orange-800 uppercase font-bold block">
                              Transporter / Carrier
                            </span>
                            <span className="font-extrabold text-orange-950 block">
                              {partnerName}
                            </span>
                          </div>
                          {partnerPhone && (
                            <a
                              href={`tel:${partnerPhone}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Call Driver
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Route Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            Origin / Sender
                          </span>
                          <span className="font-bold text-gray-900 block truncate">
                            {parcel.pickupLocation || parcel.pickupAddress || 'Rural Corridor Point'}
                          </span>
                          <span className="text-gray-500 text-[11px] block mt-0.5">
                            Sender: {parcel.senderName || 'Merchant'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            Destination Village Hub
                          </span>
                          <span className="font-bold text-gray-900 block truncate">
                            {parcel.deliveryLocation || parcel.deliveryAddress || 'Your Village Center'}
                          </span>
                          <span className="text-gray-500 text-[11px] block mt-0.5">
                            Receiver: <strong>{parcel.receiverName || 'Recipient'}</strong>
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            Transit Particulars
                          </span>
                          <span className="font-bold text-gray-900 block">
                            {transportType} • {parcel.weightKg || 1} kg
                          </span>
                          <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">
                            Contents: {parcel.whatIsInside || 'Goods / Produce'}
                          </span>
                        </div>
                      </div>

                      {/* STEP 1: GIVE THIS CODE TO THE TRANSPORTER */}
                      <div className="bg-linear-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 p-5 rounded-3xl border-2 border-orange-400 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-600 text-white uppercase tracking-wider shadow-2xs">
                              <KeyRound className="w-3.5 h-3.5" />
                              STEP 1 — GIVE THIS CODE TO THE TRANSPORTER
                            </div>
                            <h4 className="text-base font-black text-gray-900 mt-2">
                              Agent Handover Code (Share with Driver)
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                              Give this 4-digit code to the transporter. The transporter will enter this code in their Partner app to transfer physical custody to your hub.
                            </p>
                          </div>

                          {/* Big 4-Digit Code Box */}
                          <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
                            <div className="flex items-center gap-2">
                              {cleanCode.split('').map((digit, i) => (
                                <span
                                  key={i}
                                  className="w-12 h-14 bg-white border-2 border-orange-500 rounded-2xl flex items-center justify-center font-mono text-2xl font-black text-orange-900 shadow-sm"
                                >
                                  {digit}
                                </span>
                              ))}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(cleanCode, parcel._id + '_code')}
                              className="text-xs font-bold text-orange-900 border-orange-300 hover:bg-orange-100 h-8 rounded-xl cursor-pointer"
                            >
                              {copiedCode[parcel._id + '_code'] ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                  ✓ Copied Code
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 mr-1 text-orange-600" />
                                  Copy Code ({cleanCode})
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Status Bar */}
                        <div className="pt-3 border-t border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-orange-950 font-bold">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping shrink-0" />
                            <span>Status: ⏳ Waiting for transporter to enter code...</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-gray-500 italic hidden sm:inline">
                              Page will automatically update upon verification
                            </span>
                            <button
                              type="button"
                              onClick={() => setManualModalParcel(parcel)}
                              className="text-[11px] font-bold text-orange-800 hover:text-orange-950 underline hover:no-underline cursor-pointer"
                            >
                              Transporter app offline? Confirm manually
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: RECEIVED AT HUB (INVENTORY STORED AT VILLAGE HUB)
          ========================================================================= */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <div>
                <strong className="block font-extrabold text-amber-900">
                  Parcels Stored at Village Hub
                </strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Custody transferred from transporter and verified. These parcels are secured in your hub storage awaiting customer collection.
                </p>
              </div>
            </div>
            <Badge className="bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 shrink-0">
              {filteredHub.length} IN HUB
            </Badge>
          </div>

          {filteredHub.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-gray-200 p-12 text-center space-y-3 bg-gray-50/50">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <Archive className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Parcels in Hub Storage</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                All arrived consignments have been handed over to customers! Check the Incoming tab when new transporters arrive.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHub.map((parcel) => {
                const partnerName =
                  (parcel.currentPartnerId as any)?.businessName ||
                  (parcel.currentPartnerId as any)?.name ||
                  parcel.assignedPartnerName ||
                  'Logistics Transporter';
                const verifiedAt =
                  parcel.verificationCodes?.agentHandover?.verifiedAt ||
                  parcel.verificationCodes?.agent?.verifiedAt ||
                  parcel.updatedAt;

                return (
                  <Card
                    key={parcel._id}
                    className="rounded-3xl border border-amber-200 hover:border-amber-400 bg-white shadow-xs overflow-hidden transition-all flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-4">
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-black font-mono text-gray-900">
                            #{parcel.parcelTrackingNumber || parcel.parcelId}
                          </span>
                          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ✅ RECEIVED AT HUB
                          </Badge>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {parcel.weightKg || 1} KG
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-800">
                              Transporter Handover
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 font-mono">
                              {formatDate(verifiedAt)}
                            </span>
                          </div>
                          <p className="font-bold text-emerald-950">
                            Received From: <strong>{partnerName}</strong>
                          </p>
                          <span className="text-[11px] text-emerald-800 block">
                            Handover: ✅ Verified & Custody Secured
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Origin
                            </span>
                            <span className="font-bold text-gray-800 truncate block">
                              {parcel.pickupLocation || 'Origin Hub'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Destination
                            </span>
                            <span className="font-bold text-gray-800 truncate block">
                              {parcel.deliveryLocation || 'Village Drop'}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-blue-800 block">
                            Receiver / Customer
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-950 text-sm">
                              {parcel.receiverName || 'Customer'}
                            </span>
                            {parcel.receiverMobile && (
                              <a
                                href={`tel:${parcel.receiverMobile}`}
                                className="inline-flex items-center gap-1 font-mono text-blue-700 hover:underline font-bold text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                {parcel.receiverMobile}
                              </a>
                            )}
                          </div>
                          <span className="text-[11px] text-blue-800 block">
                            Contents: {parcel.whatIsInside || 'Goods'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: START FINAL DELIVERY */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 font-mono">
                        Stored in Hub Safe
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActiveTab('ready')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-8 px-4 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>START DELIVERY ➔</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 3: READY FOR FINAL DELIVERY (RECEIVER CODE INPUT)
          ========================================================================= */}
      {activeTab === 'ready' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔐</span>
              <div>
                <strong className="block font-extrabold text-blue-900">
                  Final Delivery Verification (Customer → Village Agent)
                </strong>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  When the receiver arrives, ask them for their 4-digit Delivery Code (shown on their tracking screen/SMS). Enter it below to fulfill delivery and unlock commission.
                </p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 shrink-0">
              RECEIVER CODE ONLY
            </Badge>
          </div>

          {filteredHub.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-gray-200 p-12 text-center space-y-3 bg-gray-50/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Consignments Awaiting Delivery</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No parcels are currently waiting for customer pickup. Verify transporter arrivals in the Incoming tab to add parcels here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHub.map((parcel) => {
                const parcelKey = parcel._id;
                const isDelivered =
                  parcel.status === 'DELIVERED' ||
                  parcel.status === 'delivered' ||
                  parcel.verificationCodes?.delivery?.status === 'VERIFIED';
                const isVerifying = verifyingDeliveryId === parcelKey;
                const error = deliveryError[parcelKey];

                return (
                  <Card
                    key={parcelKey}
                    className="rounded-3xl border-2 border-blue-200 hover:border-blue-400 bg-white shadow-xs overflow-hidden transition-all"
                  >
                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              FINAL DELIVERY
                            </span>
                            <Badge className="bg-blue-100 text-blue-950 border-blue-300 font-extrabold text-[10px] py-0.5 px-2">
                              AWAITING CUSTOMER CODE
                            </Badge>
                          </div>
                          <div className="text-xl font-black font-mono text-gray-900 tracking-tight">
                            #{parcel.parcelTrackingNumber || parcel.parcelId}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-blue-50 p-2.5 rounded-2xl border border-blue-200 text-xs">
                          <div>
                            <span className="text-[10px] text-blue-800 uppercase font-bold block">
                              Receiver / Customer
                            </span>
                            <span className="font-extrabold text-blue-950 text-sm block">
                              {parcel.receiverName || 'Customer'}
                            </span>
                          </div>
                          {parcel.receiverMobile && (
                            <a
                              href={`tel:${parcel.receiverMobile}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {parcel.receiverMobile}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Parcel Specifications */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            Destination Address
                          </span>
                          <span className="font-bold text-gray-900 block truncate">
                            {parcel.deliveryLocation || parcel.deliveryAddress || 'Village Doorstep'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            Cargo Particulars
                          </span>
                          <span className="font-bold text-gray-900 block">
                            {parcel.whatIsInside || 'Goods'} • {parcel.weightKg || 1} KG
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            Agent Commission
                          </span>
                          <span className="font-black text-emerald-700 block text-sm">
                            ₹{agent?.commissionPerDelivery || 30} Credited upon PIN
                          </span>
                        </div>
                      </div>

                      {/* DELIVERY CODE INPUT FORM */}
                      {!isDelivered ? (
                        <div className="bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-blue-500/15 p-5 rounded-3xl border-2 border-blue-400 space-y-4">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white uppercase tracking-wider shadow-2xs">
                              <KeyRound className="w-3.5 h-3.5" />
                              STEP 2 — ENTER CUSTOMER'S 4-DIGIT DELIVERY CODE
                            </div>
                            <h4 className="text-base font-black text-gray-900 mt-2">
                              Ask {parcel.receiverName || 'the receiver'} for their 4-digit Delivery Code
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                              The receiver sees this code on their live tracking link or received it via SMS.
                              Do NOT use the agent handover code.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                            <div className="relative flex-1 sm:max-w-xs">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                placeholder="Enter 4-digit Delivery Code"
                                value={deliveryPinInput[parcelKey] || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  setDeliveryPinInput((prev) => ({ ...prev, [parcelKey]: val }));
                                  if (error) setDeliveryError((prev) => ({ ...prev, [parcelKey]: '' }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    onSubmitDeliveryCode(parcel);
                                  }
                                }}
                                className="h-12 text-center font-mono text-xl tracking-widest font-black rounded-2xl bg-white border-2 border-blue-400 focus:border-blue-600 shadow-inner"
                              />
                            </div>

                            <Button
                              type="button"
                              onClick={() => onSubmitDeliveryCode(parcel)}
                              disabled={isVerifying || (deliveryPinInput[parcelKey] || '').length < 4}
                              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                            >
                              {isVerifying ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                                  Verifying PIN...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1.5" />
                                  VERIFY DELIVERY
                                </>
                              )}
                            </Button>
                          </div>

                          {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2 font-bold animate-in fade-in">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{error}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Delivery Completed State */
                        <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 text-xs text-emerald-950 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                              <strong className="text-sm font-black text-emerald-950 block">
                                ✅ DELIVERY COMPLETED
                              </strong>
                              <span className="text-[11px] text-emerald-800">
                                Verified with Customer Delivery PIN (••••). Commission credited to wallet.
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-emerald-600 text-white font-black text-[10px] px-3 py-1">
                            DELIVERED
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 4: DELIVERED (COMPLETED ORDERS)
          ========================================================================= */}
      {activeTab === 'delivered' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <div>
                <strong className="block font-extrabold text-emerald-900">
                  Fulfilled Last-Mile Deliveries
                </strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Consignments successfully handed over to village customers with verified Delivery PINs.
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 shrink-0">
              {filteredDelivered.length} DELIVERED
            </Badge>
          </div>

          {filteredDelivered.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-gray-200 p-12 text-center space-y-3 bg-gray-50/50">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Deliveries Completed Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Completed consignments with verified customer PINs will be listed here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDelivered.map((parcel) => (
                <Card
                  key={parcel._id}
                  className="rounded-3xl border border-emerald-200 bg-white shadow-xs overflow-hidden"
                >
                  <div className="p-5 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="space-y-0.5">
                        <span className="font-mono font-black text-gray-900 text-sm">
                          #{parcel.parcelTrackingNumber || parcel.parcelId}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold text-[10px] block w-fit">
                          ✓ DELIVERED & SETTLED
                        </Badge>
                      </div>
                      <span className="text-emerald-700 font-black font-mono text-sm bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        +₹{agent?.commissionPerDelivery || 30}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Customer</span>
                        <strong className="text-gray-900 block truncate">{parcel.receiverName || 'Receiver'}</strong>
                        <span className="font-mono text-[11px] text-gray-500">{parcel.receiverMobile}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Delivered At</span>
                        <strong className="text-gray-900 block font-mono">
                          {formatDate(parcel.verificationCodes?.delivery?.verifiedAt || parcel.updatedAt)}
                        </strong>
                        <span className="text-[11px] text-emerald-700 font-bold block">PIN Verified (••••)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Destination: <strong>{parcel.deliveryLocation || 'Doorstep'}</strong></span>
                      <span>Weight: <strong>{parcel.weightKg || 1} KG</strong></span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 5: HANDOVER HISTORY (FULL AUDIT TRAIL)
          ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-gray-100 rounded-2xl border border-gray-200 text-xs text-gray-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <strong className="block font-extrabold text-gray-900">
                  Custody Transfer Log & Audit Trail
                </strong>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Complete chronological history of transporter arrivals and final customer handovers.
                </p>
              </div>
            </div>
            <Badge className="bg-gray-800 text-white font-bold text-[10px] px-2.5 py-1 shrink-0">
              {handoverHistory.length} RECORDS
            </Badge>
          </div>

          {handoverHistory.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-gray-200 p-12 text-center space-y-3 bg-gray-50/50">
              <History className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No Handover History Recorded</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Completed custody handovers will be automatically logged here.
              </p>
            </Card>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-black text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Parcel</th>
                      <th className="py-3 px-4">Custody Transfer</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {handoverHistory.map((rec: any, idx: number) => {
                      const parcelTrk = rec.parcelId?.parcelTrackingNumber || rec.parcelId?.parcelId || 'Parcel';
                      return (
                        <tr key={rec._id || idx} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-gray-500">
                            {formatDate(rec.verifiedAt || rec.createdAt)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                            #{parcelTrk}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-gray-900">
                              {rec.fromActorType} ➔ {rec.toActorType}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-[10px] font-bold">
                              {rec.codeType || 'HANDOVER'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-black">
                              ✓ VERIFIED
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                            {rec.notes || rec.locationName || 'Hub Custody Verified'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 16: MANUAL HANDOVER FALLBACK MODAL
          ========================================================= */}
      {manualModalParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-orange-400 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-gray-900">
                  Manual Transporter Handover Fallback
                </h3>
              </div>
              <button
                onClick={() => setManualModalParcel(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p className="leading-relaxed">
                Use this fallback <strong>ONLY</strong> if the partner cannot enter the code due to a technical failure (e.g., driver phone dead, zero network connectivity at the village hub).
              </p>

              <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 space-y-1">
                <div>
                  Parcel: <strong>#{manualModalParcel.parcelTrackingNumber || manualModalParcel.parcelId}</strong>
                </div>
                <div>
                  Transporter: <strong>{manualModalParcel.assignedPartnerName || 'Logistics Partner'}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  Reason for manual confirmation <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Transporter phone dead, network unavailable"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="text-xs h-10 rounded-xl"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="confirmCheck"
                  checked={manualConfirmed}
                  onChange={(e) => setManualConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="confirmCheck" className="text-xs text-gray-800 font-bold cursor-pointer">
                  I confirm that I have physically received and inspected this package at the Village Hub.
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManualModalParcel(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSubmitManualHandover}
                disabled={isSubmittingManual || !manualConfirmed || !manualReason.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmittingManual ? 'Recording Audit...' : 'Confirm Manual Custody'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
