'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Package,
  DollarSign,
  CreditCard,
  FileText,
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Edit,
  Save,
  MessageSquareWarning,
  History,
  Lock,
  ExternalLink,
  Key,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function AgentProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'EARNINGS' | 'PAYOUTS' | 'DOCS' | 'REVIEWS' | 'COMPLAINTS' | 'LOGS' | 'EDIT'>('PACKAGES');

  // Status Action Modal State
  const [modalAction, setModalAction] = useState<'SUSPEND' | 'BLOCK' | 'VERIFY' | 'ACTIVATE' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Password Reset Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordFeedback, setResetPasswordFeedback] = useState<string | null>(null);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState<any>({
    commissionPerDelivery: 25,
    servingVillages: '',
    workingHours: '',
    internalNotes: '',
    emergencyName: '',
    emergencyPhone: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });

  const fetchAgentProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminAgentById(agentId);
      if (res.success && res.data) {
        setData(res.data);
        const a = res.data.agent;
        setEditForm({
          commissionPerDelivery: a.commissionPerDelivery || 25,
          servingVillages: Array.isArray(a.servingVillages) ? a.servingVillages.join(', ') : a.servingVillages || '',
          workingHours: a.workingHours || '',
          internalNotes: a.internalNotes || '',
          emergencyName: a.emergencyContact?.name || '',
          emergencyPhone: a.emergencyContact?.phone || '',
          accountNumber: a.bankDetails?.accountNumber || '',
          ifscCode: a.bankDetails?.ifscCode || '',
          bankName: a.bankDetails?.bankName || '',
          upiId: a.bankDetails?.upiId || '',
        });
      } else {
        setError(res.message || 'Agent not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading agent profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) fetchAgentProfile();
  }, [agentId]);

  const handleExecuteStatusAction = async () => {
    if (!modalAction) return;

    try {
      setActionLoading(true);
      setFeedback(null);
      let payloadAction: any = modalAction;
      if (modalAction === 'VERIFY') payloadAction = 'VERIFY_KYC';

      const res = await api.updateAdminAgentStatus(
        agentId,
        payloadAction,
        actionReason,
        durationDays
      );

      if (res.success) {
        setFeedback(`Agent successfully updated: ${payloadAction}`);
        setTimeout(() => {
          setModalAction(null);
          setActionReason('');
          setFeedback(null);
          fetchAgentProfile();
        }, 1200);
      } else {
        setFeedback(res.message || 'Action failed');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Error executing action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setResetPasswordLoading(true);
      setResetPasswordFeedback(null);
      const res = await api.resetAdminAgentPassword(agentId, newPassword);
      if (res.success) {
        setResetPasswordFeedback('Agent password successfully updated!');
        setTimeout(() => {
          setIsResetPasswordModalOpen(false);
          setNewPassword('');
          setResetPasswordFeedback(null);
        }, 1500);
      } else {
        setResetPasswordFeedback(res.message || 'Password reset failed');
      }
    } catch (err: any) {
      setResetPasswordFeedback(err.message || 'Error resetting password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        commissionPerDelivery: Number(editForm.commissionPerDelivery),
        servingVillages: editForm.servingVillages.split(',').map((s: string) => s.trim()).filter(Boolean),
        workingHours: editForm.workingHours,
        internalNotes: editForm.internalNotes,
        emergencyContact: {
          name: editForm.emergencyName,
          phone: editForm.emergencyPhone,
        },
        bankDetails: {
          accountNumber: editForm.accountNumber,
          ifscCode: editForm.ifscCode,
          bankName: editForm.bankName,
          upiId: editForm.upiId,
        },
      };

      const res = await api.updateAdminAgentProfile(agentId, payload);
      if (res.success) {
        setFeedback('Profile configuration updated successfully!');
        setTimeout(() => setFeedback(null), 3000);
        fetchAgentProfile();
        setActiveTab('PACKAGES');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Querying Agent 360° Profile & Ledger from MongoDB...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-gray-900">Agent Dossier Unavailable</h3>
        <p className="text-xs text-gray-500">{error || 'Unable to locate this agent record.'}</p>
        <Link href="/admin/agents/all">
          <Button size="sm" className="bg-emerald-700 text-white font-bold text-xs">
            Return to Agents Directory
          </Button>
        </Link>
      </div>
    );
  }

  const { agent, packages, earnings, payouts, kycDocs, reviews, complaints, activities, auditLogs } = data;

  return (
    <div className="space-y-6">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/agents/all" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Agents Directory
        </Link>

        <Button onClick={fetchAgentProfile} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Profile
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
          {feedback}
        </div>
      )}

      {/* Profile Header Dossier Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {agent.userId?.name?.charAt(0) || 'A'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">{agent.userId?.name}</h1>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-mono text-xs">
                  {agent.hubCode}
                </Badge>
                <Badge
                  className={
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : agent.status === 'SUSPENDED'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }
                >
                  {agent.status}
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                  {agent.operationalStatus}
                </Badge>
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 font-mono">
                  KYC: {agent.verificationStatus}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {agent.userId?.phone}
                </span>
                {agent.userId?.email && (
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {agent.userId?.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {agent.villageName} ({agent.hubAddress?.district}, {agent.hubAddress?.state})
                </span>
              </div>
            </div>
          </div>

          {/* Action Modals Button Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsResetPasswordModalOpen(true)}
              className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" /> Reset Password
            </Button>

            {agent.verificationStatus !== 'VERIFIED' && (
              <Button
                size="sm"
                onClick={() => setModalAction('VERIFY')}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verify KYC
              </Button>
            )}

            {agent.status === 'ACTIVE' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalAction('SUSPEND')}
                className="text-xs text-amber-800 border-amber-300 hover:bg-amber-50 font-bold"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Suspend
              </Button>
            ) : agent.status === 'SUSPENDED' ? (
              <Button
                size="sm"
                onClick={() => setModalAction('ACTIVATE')}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Lift Suspension
              </Button>
            ) : null}

            {agent.status !== 'BLOCKED' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalAction('BLOCK')}
                className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50 font-bold"
              >
                <Ban className="w-3.5 h-3.5 mr-1" /> Block
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setModalAction('ACTIVATE')}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Unblock
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('EDIT')}
              className="text-xs border-gray-200 text-gray-700 font-bold"
            >
              <Edit className="w-3.5 h-3.5 mr-1" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* 4 Quick Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer Rating</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">★ {agent.rating || 4.9}</div>
            <span className="text-[10px] text-gray-500">{reviews?.length || 0} reviews</span>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Delivered</span>
            <div className="text-xl font-black text-gray-900 mt-0.5">{agent.totalDelivered || 0}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Parcels Handled</span>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">COD Cash In Hand</span>
            <div className="text-xl font-black text-gray-900 mt-0.5">₹{agent.cashInHand || 0}</div>
            <span className="text-[10px] text-gray-500">Collected COD</span>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery Tariff</span>
            <div className="text-xl font-black text-emerald-900 mt-0.5">₹{agent.commissionPerDelivery || 25}</div>
            <span className="text-[10px] text-emerald-700">Per Delivery Run</span>
          </div>
        </div>

        {/* ================= COMPLETE INFORMATION DOSSIER GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
          {/* Card A: Login & Credentials */}
          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/80 space-y-2">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
              <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-700" /> Portal Login Details
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsResetPasswordModalOpen(true)}
                className="text-[10px] h-6 px-1.5 text-indigo-700 font-bold hover:bg-indigo-100"
              >
                Reset Password
              </Button>
            </div>
            <div className="space-y-1 text-gray-700">
              <div><span className="text-gray-400">Login Email:</span> <strong className="font-mono text-gray-900">{agent.userId?.email || 'N/A'}</strong></div>
              <div><span className="text-gray-400">Login Mobile:</span> <strong className="font-mono text-gray-900">{agent.userId?.phone}</strong></div>
              <div><span className="text-gray-400">Role:</span> <Badge className="bg-indigo-100 text-indigo-800 text-[10px]">{agent.userId?.role || 'village_agent'}</Badge></div>
              <div><span className="text-gray-400">Account Status:</span> <strong className={agent.userId?.isActive ? 'text-emerald-700' : 'text-rose-700'}>{agent.userId?.isActive ? 'Active (Allowed)' : 'Inactive'}</strong></div>
              <div><span className="text-gray-400">Onboarded:</span> <span className="font-mono">{new Date(agent.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Card B: Hub Operational Specs */}
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80 space-y-2">
            <div className="border-b border-emerald-100 pb-1.5 font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-700" /> Hub Geography & Operations
            </div>
            <div className="space-y-1 text-gray-700">
              <div><span className="text-gray-400">Village Hub:</span> <strong className="text-gray-900">{agent.villageName}</strong></div>
              <div><span className="text-gray-400">Hub Code:</span> <span className="font-mono font-bold text-emerald-800">{agent.hubCode}</span></div>
              <div><span className="text-gray-400">Working Hours:</span> <strong>{agent.workingHours || '08:00 AM - 07:00 PM'}</strong></div>
              <div><span className="text-gray-400">Address:</span> <span>{agent.hubAddress?.addressLine || 'Haat Road'}, {agent.hubAddress?.district}, {agent.hubAddress?.state} ({agent.hubAddress?.pincode})</span></div>
              <div className="pt-1">
                <span className="text-gray-400 block text-[10px]">Serving Villages:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(agent.servingVillages || []).map((v: string, idx: number) => (
                    <span key={idx} className="bg-emerald-100/80 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card C: Banking & Emergency Contact */}
          <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100/80 space-y-2">
            <div className="border-b border-purple-100 pb-1.5 font-extrabold text-purple-950 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-700" /> Settlement & Emergency
            </div>
            <div className="space-y-1 text-gray-700">
              <div><span className="text-gray-400">UPI ID:</span> <strong className="font-mono text-purple-900">{agent.bankDetails?.upiId || 'Not Set'}</strong></div>
              <div><span className="text-gray-400">Bank Name:</span> <strong>{agent.bankDetails?.bankName || 'Not Set'}</strong></div>
              <div><span className="text-gray-400">Account No:</span> <span className="font-mono">{agent.bankDetails?.accountNumber || 'Not Set'}</span></div>
              <div><span className="text-gray-400">IFSC Code:</span> <span className="font-mono">{agent.bankDetails?.ifscCode || 'Not Set'}</span></div>
              <div className="pt-1 border-t border-purple-100/60 mt-1">
                <span className="text-gray-400 block text-[10px]">Emergency Contact:</span>
                <div className="text-gray-900 font-semibold mt-0.5">
                  {agent.emergencyContact?.name || 'Not Provided'}{' '}
                  {agent.emergencyContact?.phone && <span className="font-mono text-gray-500">({agent.emergencyContact.phone})</span>}
                  {agent.emergencyContact?.relation && <span className="text-[10px] text-purple-700"> • {agent.emergencyContact.relation}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suspension / Block Banner if applicable */}
        {agent.status === 'SUSPENDED' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Active Disciplinary Suspension
            </div>
            <p><strong>Reason:</strong> {agent.suspensionReason}</p>
            <p className="text-[11px] font-mono text-amber-800">
              Duration: {agent.suspensionDuration} • Ends: {agent.suspensionEndDate ? new Date(agent.suspensionEndDate).toLocaleDateString() : 'Indefinite'}
            </p>
          </div>
        )}

        {agent.status === 'BLOCKED' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950">
            <div className="font-bold flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-600" /> Account Administratively Blocked
            </div>
            <p><strong>Reason:</strong> {agent.blockedReason}</p>
          </div>
        )}
      </div>

      {/* Operational Sub-Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {[
          { key: 'PACKAGES', label: `Assigned Packages (${packages?.length || 0})` },
          { key: 'EARNINGS', label: `Earnings Ledger (${earnings?.length || 0})` },
          { key: 'PAYOUTS', label: `Payouts (${payouts?.length || 0})` },
          { key: 'DOCS', label: `KYC Docs (${kycDocs?.length || 0})` },
          { key: 'REVIEWS', label: `Reviews (${reviews?.length || 0})` },
          { key: 'COMPLAINTS', label: `Tickets (${complaints?.length || 0})` },
          { key: 'LOGS', label: `Activity Stream (${activities?.length || 0})` },
          { key: 'EDIT', label: 'Configure Profile' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Assigned Packages */}
      {activeTab === 'PACKAGES' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700">
            Current & Historic Hub Parcels
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Tracking</th>
                  <th className="p-3">Receiver</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Delivery PIN</th>
                  <th className="p-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No parcels currently assigned to this agent.</td>
                  </tr>
                ) : (
                  packages.map((pkg: any) => (
                    <tr key={pkg._id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-emerald-800">{pkg.parcelTrackingNumber}</td>
                      <td className="p-3">{pkg.receiverName} ({pkg.receiverMobile})</td>
                      <td className="p-3"><Badge className="bg-gray-100 text-gray-700">{pkg.status}</Badge></td>
                      <td className="p-3 font-mono font-bold">{pkg.deliveryPin || '****'}</td>
                      <td className="p-3 text-right font-mono font-bold">₹{pkg.customerOfferPrice}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Earnings Ledger */}
      {activeTab === 'EARNINGS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700">
            Agent Compensation Entries
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 text-right">Base</th>
                  <th className="p-3 text-right">Net Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {earnings?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">No earnings recorded.</td>
                  </tr>
                ) : (
                  earnings.map((e: any) => (
                    <tr key={e._id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-purple-700">{e.referenceId}</td>
                      <td className="p-3">{e.remarks}</td>
                      <td className="p-3 text-right font-mono">₹{e.baseAmount}</td>
                      <td className="p-3 text-right font-mono font-black text-gray-900">₹{e.netAmount}</td>
                      <td className="p-3"><Badge className="bg-emerald-50 text-emerald-800">{e.status}</Badge></td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Payouts */}
      {activeTab === 'PAYOUTS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700">
            Disbursement Requests
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Mode & Beneficiary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Txn Ref</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No payout requests recorded.</td>
                  </tr>
                ) : (
                  payouts.map((p: any) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-black text-gray-900">₹{p.amount}</td>
                      <td className="p-3 font-mono">{p.paymentMode} • {p.beneficiaryDetails?.upiId || p.beneficiaryDetails?.accountNumber}</td>
                      <td className="p-3"><Badge className="bg-blue-50 text-blue-800">{p.status}</Badge></td>
                      <td className="p-3 font-mono text-purple-700">{p.transactionRef || 'Pending'}</td>
                      <td className="p-3 font-mono text-gray-400 text-[11px]">{new Date(p.requestedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KYC Documents */}
      {activeTab === 'DOCS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {kycDocs?.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-400 text-xs">No KYC documents uploaded.</div>
          ) : (
            kycDocs.map((doc: any) => (
              <div key={doc._id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-xs">{doc.documentType}</span>
                  <Badge className="bg-teal-50 text-teal-800 border-teal-200">{doc.verificationStatus}</Badge>
                </div>
                <div className="font-mono text-xs text-gray-600 font-bold">{doc.documentNumber}</div>
                {doc.documentUrl && (
                  <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img src={doc.documentUrl} alt="Doc preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: Customer Reviews */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-3">
          {reviews?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No customer reviews yet.</div>
          ) : (
            reviews.map((r: any) => (
              <div key={r._id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="font-mono font-bold text-gray-800 ml-1">{r.rating}.0</span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-700">{r.status}</Badge>
                </div>
                <p className="text-gray-700 italic">&quot;{r.comment}&quot;</p>
                <div className="text-[10px] text-gray-400">By {r.customerId?.name} • {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: Complaints */}
      {activeTab === 'COMPLAINTS' && (
        <div className="space-y-3">
          {complaints?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No grievances logged against this agent.</div>
          ) : (
            complaints.map((c: any) => (
              <div key={c._id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-700">{c.ticketNumber} ({c.category})</span>
                  <Badge className="bg-rose-100 text-rose-800">{c.status}</Badge>
                </div>
                <h4 className="font-bold text-gray-900">{c.subject}</h4>
                <p className="text-gray-600">{c.description}</p>
                {c.resolutionNotes && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl">
                    <strong>Resolution:</strong> {c.resolutionNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 7: Activity Stream */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-700">Recent Field Activities</h3>
          {activities?.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">No activity entries found.</div>
          ) : (
            activities.map((act: any) => (
              <div key={act._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-900">{act.title}</div>
                  <div className="text-[11px] text-gray-500">{act.description}</div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{new Date(act.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 8: Edit Profile Form */}
      {activeTab === 'EDIT' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-gray-900 border-b pb-2">
            Configure Agent Commercials & Profile Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Commission Rate per Delivery (₹):</label>
              <Input
                type="number"
                value={editForm.commissionPerDelivery}
                onChange={(e) => setEditForm({ ...editForm, commissionPerDelivery: e.target.value })}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Serving Villages (comma-separated):</label>
              <Input
                type="text"
                value={editForm.servingVillages}
                onChange={(e) => setEditForm({ ...editForm, servingVillages: e.target.value })}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Working Hours:</label>
              <Input
                type="text"
                value={editForm.workingHours}
                onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">UPI ID for Payouts:</label>
              <Input
                type="text"
                value={editForm.upiId}
                onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Bank Account Number:</label>
              <Input
                type="text"
                value={editForm.accountNumber}
                onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Bank IFSC Code:</label>
              <Input
                type="text"
                value={editForm.ifscCode}
                onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value })}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-gray-700">Internal Administrative Notes:</label>
            <textarea
              value={editForm.internalNotes}
              onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[80px]"
              placeholder="Internal operator notes about this village agent..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={actionLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Profile Configurations
            </Button>
          </div>
        </form>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Reset Password for {agent.userId?.name}
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  Login Email: {agent.userId?.email || agent.userId?.phone}
                </span>
              </div>
            </div>

            {resetPasswordFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                {resetPasswordFeedback}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">New Login Password *</label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new agent password (min 6 chars)..."
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  disabled={resetPasswordLoading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resetPasswordLoading || newPassword.length < 6}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs"
                >
                  {resetPasswordLoading ? 'Updating Password...' : 'Save New Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modals (Suspend / Block / Verify) */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-gray-900">
              Confirm Action: {modalAction} on {agent.hubCode}
            </h3>

            {modalAction === 'SUSPEND' && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-gray-700">Suspension Term (Days):</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={0}>Indefinite</option>
                </select>
              </div>
            )}

            {(modalAction === 'SUSPEND' || modalAction === 'BLOCK') && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-gray-700">Mandatory Justification / Reason:</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="State the regulatory or operational reason..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[90px]"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="ghost" onClick={() => setModalAction(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteStatusAction}
                disabled={actionLoading || ((modalAction === 'SUSPEND' || modalAction === 'BLOCK') && !actionReason.trim())}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                {actionLoading ? 'Processing...' : `Confirm ${modalAction}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
