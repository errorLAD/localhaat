'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import {
  Users,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Ban,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  MoreVertical,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  PlusCircle,
  Eye,
  Key,
  Lock,
  Mail,
  Phone,
  MapPin,
  X,
  Trash2,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { useAuth } from '../../../../context/AuthContext';

function AllAgentsContent() {
  const { user, demoLogin } = useAuth();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [verificationStatus, setVerificationStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modals state
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'SUSPEND' | 'BLOCK' | 'VERIFY' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Bulk Selection & Deletion State
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState<string | null>(null);

  // Add / Provision Agent Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdAgentInfo, setCreatedAgentInfo] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    villageName: '',
    hubCode: '',
    servingVillages: '',
    commissionPerDelivery: 25,
    workingHours: '08:00 AM - 07:00 PM',
    addressLine: '',
    villageOrCity: '',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221001',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const params: any = {
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder: 'desc',
      };
      if (search.trim()) params.search = search.trim();
      if (status !== 'ALL') params.status = status;
      if (verificationStatus !== 'ALL') params.verificationStatus = verificationStatus;

      const res = await api.getAdminAgents(params);
      if (res.success) {
        setAgents(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setFetchError(res.message || 'Failed to fetch agents directory');
      }
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setFetchError(err.message || 'Error communicating with agents API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, status, verificationStatus, sortBy, user]);

  useEffect(() => {
    if (searchParams?.get('action') === 'new') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAgents();
  };

  const handleExecuteAction = async () => {
    if (!selectedAgent || !modalAction) return;

    try {
      setActionLoading(true);
      setActionMessage(null);

      let actionPayload: any = { action: modalAction };
      if (modalAction === 'SUSPEND') {
        actionPayload = { action: 'SUSPEND', reason: actionReason, durationDays };
      } else if (modalAction === 'BLOCK') {
        actionPayload = { action: 'BLOCK', reason: actionReason };
      } else if (modalAction === 'VERIFY') {
        actionPayload = { action: 'VERIFY_KYC' };
      }

      const res = await api.updateAdminAgentStatus(
        selectedAgent._id,
        actionPayload.action,
        actionPayload.reason,
        actionPayload.durationDays
      );

      if (res.success) {
        setActionMessage(`Action successful: ${res.message}`);
        setTimeout(() => {
          setModalAction(null);
          setSelectedAgent(null);
          setActionReason('');
          setActionMessage(null);
          fetchAgents();
        }, 1200);
      } else {
        setActionMessage(res.message || 'Operation failed');
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Error executing action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSelectAgent = (agentId: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const handleToggleSelectAll = () => {
    if (agents.length === 0) return;
    const allVisibleIds = agents.map((a) => a._id);
    const allSelected = allVisibleIds.every((id) => selectedAgentIds.includes(id));
    if (allSelected) {
      setSelectedAgentIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedAgentIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedAgentIds.length === 0) return;
    try {
      setBulkDeleteLoading(true);
      setBulkDeleteError(null);
      const res = await api.bulkDeleteAdminAgents(selectedAgentIds);
      if (res.success) {
        setBulkDeleteSuccess(res.message || `Deleted ${selectedAgentIds.length} agents successfully.`);
        setSelectedAgentIds([]);
        setIsBulkDeleteModalOpen(false);
        fetchAgents();
        setTimeout(() => setBulkDeleteSuccess(null), 5000);
      } else {
        setBulkDeleteError(res.message || 'Failed to delete selected agents.');
      }
    } catch (err: any) {
      setBulkDeleteError(err.message || 'Network error executing bulk delete.');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleOpenSingleDelete = (agent: any) => {
    setSelectedAgentIds([agent._id]);
    setIsBulkDeleteModalOpen(true);
  };

  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      setCreateError(null);

      const payload = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        password: createForm.password,
        villageName: createForm.villageName.trim(),
        hubCode: createForm.hubCode.trim() || undefined,
        servingVillages: createForm.servingVillages
          ? createForm.servingVillages.split(',').map((s) => s.trim()).filter(Boolean)
          : [createForm.villageName.trim()],
        commissionPerDelivery: Number(createForm.commissionPerDelivery) || 25,
        workingHours: createForm.workingHours,
        hubAddress: {
          addressLine: createForm.addressLine || 'Main Haat Road',
          villageOrCity: createForm.villageOrCity || createForm.villageName,
          district: createForm.district,
          state: createForm.state,
          pincode: createForm.pincode,
        },
        bankDetails: {
          accountNumber: createForm.accountNumber,
          ifscCode: createForm.ifscCode,
          bankName: createForm.bankName,
          upiId: createForm.upiId,
        },
      };

      const res = await api.createAdminAgent(payload);
      if (res.success) {
        setCreatedAgentInfo({
          ...res.data,
          plainPassword: createForm.password,
        });
        fetchAgents();
      } else {
        setCreateError(res.message || 'Failed to provision agent');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Network error provisioning agent');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusBadge = (agentStatus: string) => {
    switch (agentStatus) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">ACTIVE</Badge>;
      case 'OFFLINE':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">OFFLINE</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">SUSPENDED</Badge>;
      case 'BLOCKED':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">BLOCKED</Badge>;
      case 'DEACTIVATED':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">DEACTIVATED</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{agentStatus}</Badge>;
    }
  };

  const getKycBadge = (vStatus: string) => {
    switch (vStatus) {
      case 'VERIFIED':
        return <Badge className="bg-teal-50 text-teal-700 border-teal-200">VERIFIED</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">PENDING KYC</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">UNDER REVIEW</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">REJECTED</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-600 border-gray-200">{vStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Directory Management</span>
            <span className="text-xs font-bold text-emerald-700 font-mono">({total} Registered Agents)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">All Village Agents</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Search, inspect credentials, moderate status, review earnings, and manage operational eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => {
              setCreatedAgentInfo(null);
              setCreateError(null);
              setIsCreateModalOpen(true);
            }}
            size="sm"
            className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            + Add New Agent
          </Button>

          <Button
            onClick={() => window.open(api.getAdminAgentsCsvUrl(), '_blank')}
            size="sm"
            variant="outline"
            className="text-xs border-gray-200 text-gray-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>

          <Button
            onClick={fetchAgents}
            size="sm"
            variant="outline"
            className="text-xs border-gray-200 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Non-Admin Session Alert */}
      {(!user || user.role !== 'admin' || fetchError) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-sm">
                Admin Session Required to Access Agent Directory
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                {fetchError ? (
                  <>API message: <span className="font-mono font-semibold">{fetchError}</span>. </>
                ) : null}
                You are currently signed in as{' '}
                <strong>{user?.name || 'Guest'}</strong> (Role:{' '}
                <span className="font-mono font-bold uppercase">{user?.role || 'NONE'}</span>).
                All Village Agents (including <strong>Manohar Jha</strong>) are securely stored in MongoDB and accessible under the Administrator role.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              await demoLogin('admin');
              fetchAgents();
            }}
            className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs whitespace-nowrap shadow-xs"
          >
            Switch to Admin (Devendra Pratap)
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by agent name, email, mobile number, village name, or hub code (e.g. VH-UP-0042)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-10 rounded-xl"
            />
          </div>
          <Button type="submit" size="sm" className="w-full sm:w-auto h-10 px-5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-500">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs bg-white text-gray-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="OFFLINE">Offline</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DEACTIVATED">Deactivated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-500">Verification:</span>
            <select
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs bg-white text-gray-800"
            >
              <option value="ALL">All KYC</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs bg-white text-gray-800"
            >
              <option value="createdAt">Date Onboarded</option>
              <option value="rating">Rating (Highest)</option>
              <option value="totalDelivered">Delivered Volume</option>
              <option value="cashInHand">Cash in Hand</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {bulkDeleteSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{bulkDeleteSuccess}</span>
          </div>
          <button onClick={() => setBulkDeleteSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Selection Action Toolbar */}
      {selectedAgentIds.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-3.5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200 border border-emerald-700/50">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-black">
              ✓
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-white">
                {selectedAgentIds.length} {selectedAgentIds.length === 1 ? 'Agent' : 'Agents'} Selected
              </span>
              <span className="text-emerald-300 text-xs">
                (Bulk Mode Active)
              </span>
            </div>
            <button
              onClick={() => setSelectedAgentIds([])}
              className="text-xs text-emerald-200 hover:text-white underline font-semibold ml-2 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 h-9 shadow-sm flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedAgentIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Agents Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={agents.length > 0 && agents.every((a) => selectedAgentIds.includes(a._id))}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all agents on page"
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer accent-emerald-600"
                  />
                </th>
                <th className="py-3 px-4">Agent Profile</th>
                <th className="py-3 px-4">Hub Code & Village</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">KYC Review</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-center">Delivered</th>
                <th className="py-3 px-4 text-right">Cash in Hand</th>
                <th className="py-3 px-4 text-right">Inspection & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && agents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 font-semibold">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                    Querying MongoDB agent collection...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No village agents matched the active search filters.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const isSelected = selectedAgentIds.includes(agent._id);
                  return (
                    <tr
                      key={agent._id}
                      className={`transition ${isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectAgent(agent._id)}
                          aria-label={`Select ${agent.userId?.name || 'agent'}`}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer accent-emerald-600"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                            {agent.userId?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{agent.userId?.name || 'Village Agent'}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{agent.userId?.phone}</div>
                            {agent.userId?.email && (
                              <div className="text-[10px] text-gray-400 font-mono truncate max-w-[160px]">
                                {agent.userId?.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px]">
                          {agent.hubCode}
                        </span>
                        <div className="text-[11px] text-gray-600 font-medium mt-0.5 max-w-[180px] truncate">
                          {agent.villageName}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {agent.hubAddress?.district}, {agent.hubAddress?.state}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(agent.status)}
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {agent.operationalStatus}
                        </div>
                      </td>

                      <td className="py-3 px-4">{getKycBadge(agent.verificationStatus)}</td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 font-mono">
                          ★ {agent.rating || 4.9}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-gray-800 font-mono">
                        {agent.totalDelivered || 0}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-gray-900 font-mono">
                        ₹{agent.cashInHand?.toLocaleString() || 0}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PROMINENT DETAIL BUTTON */}
                          <Link href={`/admin/agents/${agent._id}`}>
                            <Button
                              size="sm"
                              className="text-xs h-7 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-1 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> DETAIL
                            </Button>
                          </Link>

                          {agent.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setModalAction('SUSPEND');
                              }}
                              className="text-[11px] h-7 px-2 text-amber-700 hover:bg-amber-50 font-bold"
                            >
                              Suspend
                            </Button>
                          )}

                          {agent.status === 'SUSPENDED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await api.updateAdminAgentStatus(agent._id, 'ACTIVATE');
                                fetchAgents();
                              }}
                              className="text-[11px] h-7 px-2 text-emerald-700 hover:bg-emerald-50 font-bold"
                            >
                              Unsuspend
                            </Button>
                          )}

                          {agent.status !== 'BLOCKED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setModalAction('BLOCK');
                              }}
                              className="text-[11px] h-7 px-2 text-rose-700 hover:bg-rose-50 font-bold"
                            >
                              Block
                            </Button>
                          )}

                          {agent.status === 'BLOCKED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await api.updateAdminAgentStatus(agent._id, 'UNBLOCK');
                                fetchAgents();
                              }}
                              className="text-[11px] h-7 px-2 text-emerald-700 hover:bg-emerald-50 font-bold"
                            >
                              Unblock
                            </Button>
                          )}

                          {/* Delete agent action */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenSingleDelete(agent)}
                            className="text-[11px] h-7 px-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing Page <span className="font-bold text-gray-900">{page}</span> of{' '}
            <span className="font-bold text-gray-900">{totalPages}</span> ({total} agents total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="text-xs h-8 px-3 border-gray-200"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="text-xs h-8 px-3 border-gray-200"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ================= PROVISION NEW AGENT MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 my-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Provision New Village Agent</h3>
                  <p className="text-xs text-gray-500">Create agent credentials with Email & Password for portal access</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">
                {createError}
              </div>
            )}

            {createdAgentInfo ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Agent Successfully Provisioned in Database!
                  </div>
                  <p className="text-emerald-800">
                    The agent can now log in to the LocalHaat Agent Portal using these credentials:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1 font-mono text-xs">
                    <div><strong>Agent Name:</strong> {createdAgentInfo.userId?.name}</div>
                    <div><strong>Hub Code:</strong> {createdAgentInfo.hubCode}</div>
                    <div><strong>Login Email:</strong> {createdAgentInfo.userId?.email || 'N/A'}</div>
                    <div><strong>Login Mobile:</strong> {createdAgentInfo.userId?.phone}</div>
                    <div><strong>Login Password:</strong> {createdAgentInfo.plainPassword}</div>
                    <div><strong>Portal URL:</strong> <span className="text-indigo-600 underline">http://localhost:3000/auth</span></div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Link href={`/admin/agents/${createdAgentInfo._id}`}>
                    <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Open Agent Details Page
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setCreatedAgentInfo(null);
                    }}
                    className="text-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAgentSubmit} className="space-y-4 text-xs">
                {/* 1. Login & Identity Credentials */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <span className="font-extrabold text-gray-900 block text-xs uppercase tracking-wider text-emerald-900">
                    1. Identity & Login Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Full Name *</label>
                      <Input
                        type="text"
                        placeholder="e.g. Rameshwar Kumar Patel"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        className="text-xs h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Mobile Phone (10 Digits) *</label>
                      <Input
                        type="tel"
                        placeholder="e.g. 9999900021"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        className="text-xs h-9 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-700" /> Login Email Address *
                      </label>
                      <Input
                        type="email"
                        placeholder="e.g. rameshwar.agent@localhaat.in"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        className="text-xs h-9 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-700" /> Account Password *
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Agent@1234"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className="text-xs h-9 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Village Hub & Regional Coverage */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <span className="font-extrabold text-gray-900 block text-xs uppercase tracking-wider text-emerald-900">
                    2. Village Hub & Operational Coverage
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Village Hub Name / Center *</label>
                      <Input
                        type="text"
                        placeholder="e.g. Sonapur Central Haat Center"
                        value={createForm.villageName}
                        onChange={(e) => setCreateForm({ ...createForm, villageName: e.target.value })}
                        className="text-xs h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Hub Code (Optional)</label>
                      <Input
                        type="text"
                        placeholder="e.g. VH-UP-0095 (Auto-generated if blank)"
                        value={createForm.hubCode}
                        onChange={(e) => setCreateForm({ ...createForm, hubCode: e.target.value })}
                        className="text-xs h-9 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-700">Serving Villages (Comma-separated)</label>
                      <Input
                        type="text"
                        placeholder="e.g. Sonapur, Ramnagar Outer, Chunar Gate, Kachhwa"
                        value={createForm.servingVillages}
                        onChange={(e) => setCreateForm({ ...createForm, servingVillages: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Delivery Tariff (₹ / parcel)</label>
                      <Input
                        type="number"
                        value={createForm.commissionPerDelivery}
                        onChange={(e) => setCreateForm({ ...createForm, commissionPerDelivery: Number(e.target.value) })}
                        className="text-xs h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Working Hours</label>
                      <Input
                        type="text"
                        placeholder="08:00 AM - 07:00 PM"
                        value={createForm.workingHours}
                        onChange={(e) => setCreateForm({ ...createForm, workingHours: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Address Details */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <span className="font-extrabold text-gray-900 block text-xs uppercase tracking-wider text-emerald-900">
                    3. Hub Address & District
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-gray-700">Address Line / Landmark</label>
                      <Input
                        type="text"
                        placeholder="e.g. Near Haat Chauraha, Opposite Post Office"
                        value={createForm.addressLine}
                        onChange={(e) => setCreateForm({ ...createForm, addressLine: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">District *</label>
                      <Input
                        type="text"
                        placeholder="e.g. Varanasi"
                        value={createForm.district}
                        onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                        className="text-xs h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">State *</label>
                      <Input
                        type="text"
                        placeholder="e.g. Uttar Pradesh"
                        value={createForm.state}
                        onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                        className="text-xs h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Pincode *</label>
                      <Input
                        type="text"
                        placeholder="e.g. 221001"
                        value={createForm.pincode}
                        onChange={(e) => setCreateForm({ ...createForm, pincode: e.target.value })}
                        className="text-xs h-9 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Bank Account Details */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <span className="font-extrabold text-gray-900 block text-xs uppercase tracking-wider text-emerald-900">
                    4. Settlement Bank Details (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">UPI ID</label>
                      <Input
                        type="text"
                        placeholder="e.g. rameshwar@oksbi"
                        value={createForm.upiId}
                        onChange={(e) => setCreateForm({ ...createForm, upiId: e.target.value })}
                        className="text-xs h-9 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Bank Account Number</label>
                      <Input
                        type="text"
                        placeholder="e.g. 381920019283"
                        value={createForm.accountNumber}
                        onChange={(e) => setCreateForm({ ...createForm, accountNumber: e.target.value })}
                        className="text-xs h-9 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Bank IFSC Code</label>
                      <Input
                        type="text"
                        placeholder="e.g. SBIN0001248"
                        value={createForm.ifscCode}
                        onChange={(e) => setCreateForm({ ...createForm, ifscCode: e.target.value })}
                        className="text-xs h-9 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Bank Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. State Bank of India"
                        value={createForm.bankName}
                        onChange={(e) => setCreateForm({ ...createForm, bankName: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={createLoading}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createLoading}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 h-9 rounded-xl"
                  >
                    {createLoading ? 'Provisioning Account...' : 'Provision Agent Credentials'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Action Dialog / Modal (Suspend / Block) */}
      {modalAction && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  modalAction === 'SUSPEND' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {modalAction === 'SUSPEND' ? <AlertTriangle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {modalAction === 'SUSPEND' ? 'Suspend Village Agent' : 'Block Village Agent Access'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedAgent.userId?.name} ({selectedAgent.hubCode})
                </p>
              </div>
            </div>

            {actionMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                {actionMessage}
              </div>
            )}

            {modalAction === 'SUSPEND' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Suspension Duration (Days):</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={0}>Indefinite</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Mandatory Justification / Reason:</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why this administrative penalty is being enacted..."
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModalAction(null);
                  setSelectedAgent(null);
                  setActionReason('');
                }}
                disabled={actionLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteAction}
                disabled={actionLoading || !actionReason.trim()}
                className={`text-xs font-bold text-white ${
                  modalAction === 'SUSPEND' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${modalAction}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Confirm Bulk Delete</h3>
                  <p className="text-xs text-gray-500">Permanent platform purge</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!bulkDeleteLoading) {
                    setIsBulkDeleteModalOpen(false);
                    setBulkDeleteError(null);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bulkDeleteError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{bulkDeleteError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 text-xs text-rose-950 space-y-1.5">
                <div className="font-extrabold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Irreversible Administrative Action
                </div>
                <p className="text-rose-800 leading-relaxed">
                  You are about to permanently delete{' '}
                  <strong>{selectedAgentIds.length}</strong> village agent
                  {selectedAgentIds.length > 1 ? 's' : ''}. This will remove their
                  hub data, unlink any assigned parcels, and delete their user credentials.
                </p>
              </div>

              {/* List of affected agents */}
              <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100 bg-gray-50/50 p-1">
                {agents
                  .filter((a) => selectedAgentIds.includes(a._id))
                  .map((agent) => (
                    <div key={agent._id} className="p-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{agent.userId?.name || 'Village Agent'}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {agent.hubCode} • {agent.villageName}
                        </div>
                      </div>
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-mono">
                        {agent.userId?.phone}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsBulkDeleteModalOpen(false);
                  setBulkDeleteError(null);
                }}
                disabled={bulkDeleteLoading}
                className="text-xs border-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteBulkDelete}
                disabled={bulkDeleteLoading}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-black px-4 shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {bulkDeleteLoading
                  ? 'Deleting...'
                  : `Confirm Delete (${selectedAgentIds.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllAgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
          <span>Loading Agents Registry...</span>
        </div>
      }
    >
      <AllAgentsContent />
    </Suspense>
  );
}
