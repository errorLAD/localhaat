'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useSocket } from '../../../../context/SocketContext';
import {
  Package,
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  UserCheck,
  Building,
  CreditCard,
  DollarSign,
  AlertTriangle,
  History,
  Send,
  RefreshCw,
  Phone,
  FileText,
  Sliders,
  Check,
  QrCode,
  KeyRound,
  Lock,
  Unlock,
  AlertOctagon,
  Percent,
  Store,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function ParcelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { socket } = useSocket();

  const [parcel, setParcel] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [legs, setLegs] = useState<any[]>([]);
  const [handovers, setHandovers] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Matching Partners
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Available Agents for reassignment
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);

  // States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modals / Dialog States
  const [showAssignPartnerModal, setShowAssignPartnerModal] = useState(false);
  const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [newOfferPrice, setNewOfferPrice] = useState<number>(0);
  const [newLogisticsType, setNewLogisticsType] = useState('Bike');

  const [showFailDeliveryModal, setShowFailDeliveryModal] = useState(false);
  const [failReason, setFailReason] = useState('Customer unavailable');
  const [failNotes, setFailNotes] = useState('');

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Customer rejected package');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Cancelled by admin request');
  const [processRefund, setProcessRefund] = useState(true);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('DAMAGED_ITEM');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeClaimAmount, setDisputeClaimAmount] = useState<number>(0);

  // Operational Note
  const [auditNoteText, setAuditNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Fetch 360 Dossier
  const fetchParcelDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminParcelById(id);
      if (res.success) {
        setParcel(res.parcel);
        setEvents(res.events || []);
        setLegs(res.legs || []);
        setHandovers(res.handovers || []);
        setEarnings(res.earnings || []);
        setPayments(res.payments || []);
        setDisputes(res.disputes || []);
        setAuditLogs(res.auditLogs || []);
        setNewOfferPrice(res.parcel?.customerOfferPrice || 150);
        setNewLogisticsType(res.parcel?.preferredLogisticsType || 'Bike');
      } else {
        setError(res.message || 'Parcel dossier not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading parcel dossier.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches
  const fetchMatchingPartners = async () => {
    try {
      setMatchesLoading(true);
      const res = await api.findMatchingPartnersForParcel(id);
      if (res.success) {
        setMatches(res.matches || []);
        if (res.matches && res.matches.length > 0) {
          setSelectedPartnerId(res.matches[0].partnerId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchesLoading(false);
    }
  };

  // Fetch available agents
  const fetchAgents = async () => {
    try {
      const res = await api.getAvailableAgents();
      if (res.success) {
        setAvailableAgents(res.agents || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParcelDossier();
    fetchAgents();

    if (socket) {
      socket.on('admin:parcel_update', (data: any) => {
        if (!data.parcelId || data.parcelId === parcel?.parcelId) {
          fetchParcelDossier();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('admin:parcel_update');
      }
    };
  }, [id, socket]);

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // 1. Assign Partner
  const handleAssignPartner = async () => {
    if (!selectedPartnerId) return;
    try {
      setActionLoading(true);
      const selectedMatch = matches.find((m) => m.partnerId === selectedPartnerId);
      const res = await api.assignAdminParcelPartner(id, {
        partnerId: selectedPartnerId,
        vehicleId: selectedMatch?.vehicle?._id,
        note: `Assigned via automated matching algorithm (${selectedMatch?.matchScore}% match)`,
      });
      if (res.success) {
        showNotification('Logistics Partner assigned successfully!');
        setShowAssignPartnerModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Assignment error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Assign Agent
  const handleAssignAgent = async () => {
    if (!selectedAgentId) return;
    try {
      setActionLoading(true);
      const res = await api.assignAdminParcelAgent(id, {
        agentId: selectedAgentId,
        note: 'Assigned Village Hub via Admin Console',
      });
      if (res.success) {
        showNotification('Village Agent assigned successfully!');
        setShowAssignAgentModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Agent assignment error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Admin Verify Pickup
  const handleVerifyPickup = async (bypass: boolean = true) => {
    if (!confirm('Verify pickup for this parcel and transition to In Transit?')) return;
    try {
      setActionLoading(true);
      const res = await api.verifyAdminParcelPickup(id, {
        bypassCode: bypass,
        notes: 'Admin one-click pickup verification',
      });
      if (res.success) {
        showNotification('Pickup verified! Parcel is now IN TRANSIT.');
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Pickup verification error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Admin Verify Handover
  const handleVerifyHandover = async (bypass: boolean = true) => {
    if (!confirm('Verify handover to Village Agent Hub?')) return;
    try {
      setActionLoading(true);
      const res = await api.verifyAdminParcelHandover(id, {
        bypassCode: bypass,
        notes: 'Admin verified handover to Village Hub',
      });
      if (res.success) {
        showNotification('Handover verified! Parcel received by Village Agent.');
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Handover verification error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Admin Verify Delivery
  const handleVerifyDelivery = async (bypass: boolean = true) => {
    if (!confirm('Verify final delivery and credit partner & agent earnings?')) return;
    try {
      setActionLoading(true);
      const res = await api.verifyAdminParcelDelivery(id, {
        bypassPin: bypass,
        notes: 'Admin confirmed doorstep delivery with PIN bypass',
      });
      if (res.success) {
        showNotification('Delivery confirmed! Earnings credited successfully.');
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Delivery verification error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Fail Delivery
  const handleFailDelivery = async () => {
    try {
      setActionLoading(true);
      const res = await api.failAdminParcelDelivery(id, {
        reason: failReason,
        notes: failNotes,
      });
      if (res.success) {
        showNotification('Delivery marked as failed.');
        setShowFailDeliveryModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Return Parcel
  const handleInitiateReturn = async () => {
    try {
      setActionLoading(true);
      const res = await api.returnAdminParcel(id, {
        returnReason,
      });
      if (res.success) {
        showNotification('Return initiated successfully.');
        setShowReturnModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 8. Cancel Parcel
  const handleCancelParcel = async () => {
    try {
      setActionLoading(true);
      const res = await api.cancelAdminParcel(id, {
        reason: cancelReason,
        processRefund,
      });
      if (res.success) {
        showNotification('Parcel cancelled successfully.');
        setShowCancelModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Permanently Delete Parcel
  const handleDeleteParcel = async () => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY DELETE parcel ${parcel?.parcelId}? All associated tracking events, legs, handovers, and disputes will be permanently deleted from MongoDB. This action CANNOT be undone.`
      )
    )
      return;
    try {
      setActionLoading(true);
      const res = await api.deleteAdminParcel(id, 'Permanent deletion from 360 Operations Dossier');
      if (res.success) {
        alert(`Parcel ${parcel?.parcelId} has been permanently deleted.`);
        router.push('/admin/parcels/all');
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 9. Update Price & Details
  const handleUpdatePrice = async () => {
    try {
      setActionLoading(true);
      const res = await api.updateAdminParcelDetails(id, {
        customerOfferPrice: newOfferPrice,
        preferredLogisticsType: newLogisticsType,
      });
      if (res.success) {
        showNotification('Parcel price & logistics type updated.');
        setShowEditPriceModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 10. Add Operational Note
  const handleAddAuditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditNoteText.trim()) return;
    try {
      setAddingNote(true);
      const res = await api.addAdminParcelAuditNote(id, auditNoteText.trim());
      if (res.success) {
        setAuditNoteText('');
        showNotification('Operational note added to audit trail.');
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Note failed: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  // 11. Raise Dispute
  const handleRaiseDispute = async () => {
    try {
      setActionLoading(true);
      const res = await api.createOrUpdateAdminParcelDispute(id, {
        reason: disputeReason,
        description: disputeDescription || 'Customer dispute logged by admin',
        claimAmount: disputeClaimAmount || parcel?.customerOfferPrice,
        status: 'OPEN',
      });
      if (res.success) {
        showNotification('Dispute ticket logged successfully.');
        setShowDisputeModal(false);
        fetchParcelDossier();
      }
    } catch (err: any) {
      alert(`Dispute creation error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-gray-500">Loading 360° Parcel Operations Dossier...</p>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-gray-900">{error || 'Parcel not found'}</h2>
        <Button onClick={() => router.back()} size="sm">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="space-y-1">
          <Link
            href="/admin/parcels/all"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Parcels Directory
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-mono tracking-tight">
              {parcel.parcelId}
            </h1>
            <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-mono text-xs">
              {parcel.parcelTrackingNumber}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 border-gray-300 uppercase font-bold text-[11px]">
              {parcel.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Registered on {new Date(parcel.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>

        {/* Global Operations Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pickup Verification */}
          {['SEARCHING_FOR_PARTNER', 'PARTNER_ACCEPTED', 'PICKUP_PENDING'].includes(parcel.status) && (
            <Button
              size="sm"
              onClick={() => handleVerifyPickup(true)}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1" />
              Verify Pickup
            </Button>
          )}

          {/* Handover Verification */}
          {['PICKED_UP', 'IN_TRANSIT', 'HANDOVER_PENDING'].includes(parcel.status) && (
            <Button
              size="sm"
              onClick={() => handleVerifyHandover(true)}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
            >
              <Building className="w-3.5 h-3.5 mr-1" />
              Verify Hub Handover
            </Button>
          )}

          {/* Delivery Verification */}
          {['RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY'].includes(parcel.status) && (
            <Button
              size="sm"
              onClick={() => handleVerifyDelivery(true)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Verify Doorstep Delivery
            </Button>
          )}

          {/* Failure & Return Actions */}
          {parcel.status !== 'DELIVERED' && parcel.status !== 'CANCELLED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFailDeliveryModal(true)}
                className="text-xs font-bold text-red-700 border-red-200 hover:bg-red-50"
              >
                Fail Delivery
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReturnModal(true)}
                className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Return
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </>
          )}

          <Button
            size="sm"
            onClick={handleDeleteParcel}
            disabled={actionLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
            title="Permanently Delete Parcel"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Parcel
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchParcelDossier}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* TOP ROW: Secure Handover Codes Card & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 4-digit Pickup Verification Code */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-orange-600" />
              Pickup Verification Code
            </span>
            <span className="text-[10px] text-gray-400">Sender → Partner</span>
          </div>
          <div className="text-2xl font-extrabold text-orange-600 font-mono tracking-widest">
            {parcel.pickupCode}
          </div>
          <p className="text-[11px] text-gray-500">Provided by sender to verify parcel release to driver.</p>
        </div>

        {/* Card 2: 4-digit Hub Handover Code */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-purple-600" />
              Hub Handover Code
            </span>
            <span className="text-[10px] text-gray-400">Partner → Agent</span>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 font-mono tracking-widest">
            {parcel.handoverCode}
          </div>
          <p className="text-[11px] text-gray-500">Transferred at village hub / sorting facility.</p>
        </div>

        {/* Card 3: 4-digit Doorstep Delivery PIN */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-green-600" />
              Doorstep Delivery PIN
            </span>
            <span className="text-[10px] text-gray-400">Receiver → Agent</span>
          </div>
          <div className="text-2xl font-extrabold text-green-600 font-mono tracking-widest">
            {parcel.deliveryPin}
          </div>
          <p className="text-[11px] text-gray-500">Provided by customer upon doorstep physical handover.</p>
        </div>
      </div>

      {/* TWO COLUMN GRID: Left column details, right column logistics matching & timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Sender, Receiver, Specs, Financials (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION A: Sender & Receiver Dossier */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sender & Receiver Dossier
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sender Details */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Pickup Origin (Sender)
                  </span>
                  <Badge className="bg-blue-50 text-blue-700 text-[10px]">ORIGIN</Badge>
                </div>
                <div className="text-sm font-extrabold text-gray-900">{parcel.senderName}</div>
                <div className="text-xs text-gray-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {parcel.senderMobile}
                </div>
                <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                  <strong>Location:</strong> {parcel.pickupLocation}
                  <br />
                  <strong>Address:</strong> {parcel.pickupAddress}
                  {parcel.senderLocation?.district && (
                    <span className="block text-[11px] text-gray-500">
                      District: {parcel.senderLocation.district}, Pincode: {parcel.senderLocation.pincode}
                    </span>
                  )}
                </div>
              </div>

              {/* Receiver Details */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Delivery Destination (Receiver)
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">DESTINATION</Badge>
                </div>
                <div className="text-sm font-extrabold text-gray-900">{parcel.receiverName}</div>
                <div className="text-xs text-gray-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {parcel.receiverMobile}
                </div>
                <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                  <strong>Village / City:</strong> {parcel.deliveryLocation}
                  <br />
                  <strong>Address:</strong> {parcel.deliveryAddress}
                  {parcel.destinationLocation?.district && (
                    <span className="block text-[11px] text-gray-500">
                      District: {parcel.destinationLocation.district}, Pincode: {parcel.destinationLocation.pincode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Parcel Specifications */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Parcel Specifications & Cargo Details
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditPriceModal(true)}
                className="text-xs font-bold h-7"
              >
                <Sliders className="w-3 h-3 mr-1" />
                Override Specs / Price
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-[11px] text-gray-400">Category</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">{parcel.parcelCategory || 'General'}</div>
              </div>

              <div>
                <div className="text-[11px] text-gray-400">Weight</div>
                <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">{parcel.weightKg || 1} KG</div>
              </div>

              <div>
                <div className="text-[11px] text-gray-400">Dimensions</div>
                <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
                  {parcel.dimensions?.lengthCm || 20} × {parcel.dimensions?.widthCm || 20} ×{' '}
                  {parcel.dimensions?.heightCm || 20} cm
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-400">Approx. Declared Value</div>
                <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
                  ₹{parcel.approximateValue || 500}
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <div className="font-bold text-gray-700">What is inside:</div>
              <div className="text-gray-900 font-medium mt-0.5">{parcel.whatIsInside}</div>
              {parcel.specialInstructions && (
                <div className="text-gray-500 mt-1 italic">
                  <strong>Special Instructions:</strong> {parcel.specialInstructions}
                </div>
              )}
            </div>
          </div>

          {/* SECTION C: Multi-Leg Shipment Segments View */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Multi-Leg Shipment Segments ({legs.length} Legs)
            </div>

            <div className="space-y-3">
              {legs.map((leg) => {
                const isCompleted = leg.status === 'completed';
                const isInProgress = leg.status === 'in_progress';
                return (
                  <div
                    key={leg._id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-green-50/40 border-green-200'
                        : isInProgress
                        ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400/40'
                        : 'bg-gray-50/60 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-900 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                          {leg.sequence}
                        </span>
                        <span className="font-extrabold text-xs text-gray-900">
                          {leg.legType === 'FIRST_MILE_PICKUP'
                            ? 'First-Mile Pickup'
                            : leg.legType === 'MID_MILE_HAUL'
                            ? 'Mid-Mile Corridor Haul'
                            : 'Last-Mile Village Doorstep Delivery'}
                        </span>
                        <Badge
                          className={`text-[10px] uppercase font-bold ${
                            isCompleted
                              ? 'bg-green-100 text-green-900'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-900 animate-pulse'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {leg.status}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-xs text-gray-900 font-mono">
                          Est. ₹{leg.estimatedEarnings}
                        </span>
                        <div className="text-[10px] text-gray-400">~{leg.distanceKm} km</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong>Assigned Actor:</strong>{' '}
                        {leg.assignedToUserId?.name ? `${leg.assignedToUserId.name} (${leg.assignedType})` : 'Unassigned'}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">
                        Codes: P-Code {leg.pickupVerificationCode} | H-Code {leg.handoverVerificationCode}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION D: Tracking Timeline History */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Chronological Tracking Timeline ({events.length} Events)
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {events.map((ev) => (
                <div key={ev._id} className="relative space-y-0.5">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{ev.eventType}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(ev.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{ev.description}</p>
                  <div className="text-[10px] text-gray-400">
                    Location: {ev.locationName} | Actor: {ev.actorRole}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION E: Disputes & Investigations */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Customer Claims & Disputes ({disputes.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisputeModal(true)}
                className="text-xs font-bold text-red-700 border-red-200 hover:bg-red-50 h-7"
              >
                + Log Dispute
              </Button>
            </div>

            {disputes.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400">
                No active disputes or claims recorded for this parcel.
              </div>
            ) : (
              disputes.map((d) => (
                <div key={d._id} className="p-3.5 bg-red-50/50 border border-red-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-red-950">{d.disputeNumber}</span>
                      <Badge className="bg-red-100 text-red-900 border-red-300 text-[10px] uppercase font-bold">
                        {d.status}
                      </Badge>
                    </div>
                    <span className="font-bold text-red-700 font-mono">Claim: ₹{d.claimAmount}</span>
                  </div>
                  <div className="text-red-900">
                    <strong>Reason:</strong> {d.reason}
                  </div>
                  <p className="text-gray-700">{d.description}</p>
                  {d.refundApprovedAmount > 0 && (
                    <div className="font-bold text-emerald-700">
                      Refund Approved: ₹{d.refundApprovedAmount}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Matching Engine, Assigned Logistics, Village Agent, Audit Log */}
        <div className="space-y-6">
          {/* CARD 1: Automated Partner Matching Engine */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Assigned Transporter
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  fetchMatchingPartners();
                  setShowAssignPartnerModal(true);
                }}
                className="text-xs font-bold h-7"
              >
                {parcel.currentPartnerId ? 'Reassign' : 'Auto-Match'}
              </Button>
            </div>

            {parcel.currentPartnerId ? (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900">
                    {parcel.currentPartnerId.businessName}
                  </span>
                  <span className="text-blue-700 font-bold font-mono">★{parcel.currentPartnerId.rating || 4.9}</span>
                </div>
                <div className="text-gray-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {parcel.currentPartnerId.userId?.phone || 'Partner Phone'}
                </div>
                {parcel.currentVehicleId && (
                  <div className="text-[11px] text-indigo-700 font-mono bg-indigo-50 p-1.5 rounded border border-indigo-100">
                    Vehicle: {parcel.currentVehicleId.vehicleType} | Reg: {parcel.currentVehicleId.registrationNumber} (
                    {parcel.currentVehicleId.maxCapacityKg}kg cap)
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-center space-y-2 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />
                <div className="font-bold text-amber-950">No Transporter Assigned</div>
                <p className="text-gray-500 text-[11px]">Click Match to find the best nearby logistics partner.</p>
                <Button
                  size="sm"
                  onClick={() => {
                    fetchMatchingPartners();
                    setShowAssignPartnerModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Run Partner Match
                </Button>
              </div>
            )}
          </div>

          {/* CARD 2: Assigned Village Agent Hub */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Village Agent Hub
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAssignAgentModal(true)}
                className="text-xs font-bold h-7"
              >
                Change Hub
              </Button>
            </div>

            {parcel.currentAgentId ? (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900">
                    {parcel.currentAgentId.villageName}
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-900 font-mono text-[10px]">
                    {parcel.currentAgentId.hubCode}
                  </Badge>
                </div>
                <div className="text-gray-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {parcel.currentAgentId.userId?.phone || 'Agent Phone'}
                </div>
                <div className="text-[11px] text-gray-500">
                  Doorstep Commission: <strong>₹{parcel.currentAgentId.commissionPerDelivery || 30}</strong>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1 text-xs text-gray-400">
                <div>No Village Agent assigned.</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAssignAgentModal(true)}
                  className="text-xs font-bold text-emerald-700"
                >
                  Assign Village Agent
                </Button>
              </div>
            )}
          </div>

          {/* CARD 3: Financials & Ledger */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Financial Breakdown & Earnings
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Customer Offer:</span>
                <span className="font-extrabold text-gray-900 font-mono">₹{parcel.customerOfferPrice}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-emerald-700 font-medium">Partner Payout (60%):</span>
                <span className="font-bold text-emerald-800 font-mono">
                  ₹{Math.round(parcel.customerOfferPrice * 0.6)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-sky-700 font-medium">Village Agent Share:</span>
                <span className="font-bold text-sky-800 font-mono">
                  ₹{Math.max(30, Math.round(parcel.customerOfferPrice * 0.15))}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-amber-700 font-medium">LocalHaat Platform Fee:</span>
                <span className="font-bold text-amber-800 font-mono">
                  ₹{Math.round(parcel.customerOfferPrice * 0.25)}
                </span>
              </div>
            </div>

            {/* Existing Earnings records */}
            {earnings.length > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Released Earnings:</div>
                {earnings.map((ern) => (
                  <div key={ern._id} className="p-2 bg-emerald-50 rounded-lg text-xs flex justify-between">
                    <span>
                      {ern.actorType}: {ern.actorId?.name || 'Partner/Agent'}
                    </span>
                    <span className="font-bold text-emerald-800">₹{ern.netAmount} ({ern.status})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 4: Immutable Audit Log & Operator Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Immutable Operations Audit Log
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddAuditNote} className="space-y-2">
              <Input
                placeholder="Append operational note to audit log..."
                value={auditNoteText}
                onChange={(e) => setAuditNoteText(e.target.value)}
                className="text-xs h-8"
              />
              <Button type="submit" size="sm" disabled={addingNote} className="w-full text-xs h-8 font-bold">
                {addingNote ? 'Saving...' : 'Add Operator Note'}
              </Button>
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log._id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span>{log.action}</span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{log.reason || 'No description provided'}</p>
                  <div className="text-[9px] text-gray-400">
                    By: {log.adminName || 'Admin'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Automated Partner Matching Modal */}
      {showAssignPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Match & Assign Logistics Partner
              </h3>
              <button onClick={() => setShowAssignPartnerModal(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
              {matchesLoading ? (
                <div className="p-8 text-center text-xs text-gray-500">Running matching algorithm...</div>
              ) : matches.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">No partner matches found.</div>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.partnerId}
                    onClick={() => setSelectedPartnerId(m.partnerId)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                      selectedPartnerId === m.partnerId
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-gray-900">{m.businessName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{m.user?.phone}</div>
                      <div className="text-[10px] text-gray-400">Rating: ★{m.rating} | {m.totalTrips} Trips</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-blue-700 font-mono">{m.matchScore}%</div>
                      <div className="text-[10px] text-gray-400">Score</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-between bg-gray-50">
              <Button variant="outline" size="sm" onClick={() => setShowAssignPartnerModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAssignPartner} disabled={actionLoading || !selectedPartnerId}>
                {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Agent Modal */}
      {showAssignAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                Select Village Agent Hub
              </h3>
              <button onClick={() => setShowAssignAgentModal(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-2 max-h-[350px] overflow-y-auto">
              {availableAgents.map((ag) => (
                <div
                  key={ag._id}
                  onClick={() => setSelectedAgentId(ag._id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                    selectedAgentId === ag._id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900">{ag.villageName}</div>
                    <div className="text-[10px] font-mono text-gray-500">Hub Code: {ag.hubCode}</div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                    ₹{ag.commissionPerDelivery || 30} Comm.
                  </Badge>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-between bg-gray-50">
              <Button variant="outline" size="sm" onClick={() => setShowAssignAgentModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAssignAgent} disabled={actionLoading || !selectedAgentId}>
                {actionLoading ? 'Assigning...' : 'Confirm Hub'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Price / Specs */}
      {showEditPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-sm text-gray-900">
              Override Customer Offer Price & Transport
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Customer Offer Price (INR)</label>
                <Input
                  type="number"
                  value={newOfferPrice}
                  onChange={(e) => setNewOfferPrice(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Preferred Logistics Transport</label>
                <select
                  value={newLogisticsType}
                  onChange={(e) => setNewLogisticsType(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
                >
                  <option value="Bike">Bike / Two-Wheeler</option>
                  <option value="Pickup Van">Pickup Van / Auto</option>
                  <option value="Mini Truck">Mini Truck (Bolero / Ace)</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between bg-gray-50">
              <Button variant="outline" size="sm" onClick={() => setShowEditPriceModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdatePrice} disabled={actionLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Log Dispute */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-sm text-red-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Log Customer / Partner Dispute
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
                >
                  <option value="DAMAGED_ITEM">Damaged Goods / Broken Item</option>
                  <option value="LOST_ITEM">Lost Package / Missing Item</option>
                  <option value="DELAYED_DELIVERY">Excessive Transit Delay</option>
                  <option value="PAYMENT_ISSUE">Payment Dispute</option>
                  <option value="PARTNER_UNRESPONSIVE">Transporter Unresponsive</option>
                  <option value="OTHER">Other Dispute</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Claimed Compensation (INR)</label>
                <Input
                  type="number"
                  value={disputeClaimAmount || parcel.customerOfferPrice}
                  onChange={(e) => setDisputeClaimAmount(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Dispute Description / Notes</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain customer allegation and inspection report..."
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between bg-gray-50">
              <Button variant="outline" size="sm" onClick={() => setShowDisputeModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRaiseDispute} disabled={actionLoading} className="bg-red-600 text-white">
                Submit Dispute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Cancel Parcel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-sm text-gray-900">
              Cancel Parcel #{parcel.parcelId}
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cancellation Reason</label>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="text-xs"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processRefund}
                  onChange={(e) => setProcessRefund(e.target.checked)}
                />
                Process Full Refund (₹{parcel.customerOfferPrice})
              </label>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between bg-gray-50">
              <Button variant="outline" size="sm" onClick={() => setShowCancelModal(false)}>
                Dismiss
              </Button>
              <Button size="sm" onClick={handleCancelParcel} disabled={actionLoading} className="bg-red-600 text-white">
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
