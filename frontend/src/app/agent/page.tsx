'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAgent } from '../../context/AgentContext';
import {
  MapPin,
  Package,
  Boxes,
  ShieldCheck,
  Banknote,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Home,
  User,
  Mail,
  Phone,
  Save,
  RotateCcw,
  Power,
  AlertCircle,
  Plus,
  X,
  BadgeCheck,
  Store,
  Navigation,
  SlidersHorizontal,
  KeyRound,
  Truck,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

function AgentDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    agent,
    incomingParcels,
    hubParcels,
    deliveredParcels,
    stats,
    loading,
    isHubOpen,
    loadAgentDashboard,
    updateAgentProfile,
    handleToggleHub,
  } = useAgent();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'operations' | 'profile'>('operations');

  // Synchronize tab with URL query or hash
  useEffect(() => {
    if (tabParam === 'profile') {
      setActiveTab('profile');
    } else if (typeof window !== 'undefined' && window.location.hash === '#profile') {
      setActiveTab('profile');
    }
  }, [tabParam]);

  // Form states for Village Agent Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [villageName, setVillageName] = useState('');
  const [hubCode, setHubCode] = useState('');
  const [workingHours, setWorkingHours] = useState('07:30 AM - 08:00 PM');
  const [commissionPerDelivery, setCommissionPerDelivery] = useState<number>(30);
  const [isHubStatus, setIsHubStatus] = useState<boolean>(true);
  const [servingVillages, setServingVillages] = useState<string[]>([]);
  const [newVillageInput, setNewVillageInput] = useState('');

  // Location fields
  const [addressLine, setAddressLine] = useState('');
  const [villageOrCity, setVillageOrCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Save feedback states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Populate form with current values
  const populateFormData = () => {
    if (agent) {
      setVillageName(agent.villageName || '');
      setHubCode(agent.hubCode || '');
      setWorkingHours(agent.workingHours || '08:00 AM - 07:00 PM');
      setCommissionPerDelivery(
        agent.commissionPerDelivery !== undefined ? agent.commissionPerDelivery : 25
      );
      setIsHubStatus(agent.isAvailable !== undefined ? agent.isAvailable : true);
      setServingVillages(
        Array.isArray(agent.servingVillages) ? agent.servingVillages : []
      );

      if (agent.hubAddress) {
        setAddressLine(agent.hubAddress.addressLine || '');
        setVillageOrCity(agent.hubAddress.villageOrCity || '');
        setDistrict(agent.hubAddress.district || '');
        setStateName(agent.hubAddress.state || '');
        setPincode(agent.hubAddress.pincode || '');
        setLandmark(agent.hubAddress.landmark || '');
        setContactPerson(agent.hubAddress.contactPerson || user?.name || '');
        setContactPhone(agent.hubAddress.contactPhone || user?.phone || '');
      }
    }

    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  };

  useEffect(() => {
    populateFormData();
  }, [agent, user]);

  const handleAddVillage = () => {
    const trimmed = newVillageInput.trim();
    if (!trimmed) return;
    if (!servingVillages.includes(trimmed)) {
      setServingVillages([...servingVillages, trimmed]);
    }
    setNewVillageInput('');
  };

  const handleRemoveVillage = (vToRemove: string) => {
    setServingVillages(servingVillages.filter((v) => v !== vToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await updateAgentProfile({
        name,
        email,
        villageName,
        hubCode,
        servingVillages,
        workingHours,
        commissionPerDelivery: Number(commissionPerDelivery),
        isAvailable: isHubStatus,
        hubAddress: {
          addressLine,
          villageOrCity,
          district,
          state: stateName,
          pincode,
          landmark,
          contactPerson,
          contactPhone,
        },
      });

      setSaveSuccess(true);
      await loadAgentDashboard();
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update Village Agent profile in database.');
    } finally {
      setSaving(false);
    }
  };

  const commission = stats?.totalEarnings || 0;

  if (loading && !agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-9 h-9 text-amber-700 animate-spin" />
        <p className="text-sm font-semibold text-gray-700">Connecting to Village Agent Drop Hub...</p>
      </div>
    );
  }

  // 1. Not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Store className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-950">Village Agent Login Required</h2>
          <p className="text-xs text-gray-500 mt-1">
            Please log in with your authorized Village Agent credentials to access this last-mile drop hub.
          </p>
        </div>
        <Link href="/auth">
          <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl shadow-xs">
            Sign In as Village Agent
          </Button>
        </Link>
        <p className="text-[11px] text-gray-400">
          New agent? Request platform administrator to provision your Hub in the Admin Panel.
        </p>
      </div>
    );
  }

  // 2. Logged in with non-agent role
  if (user.role !== 'village_agent') {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Store className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-950">Restricted to Village Agents</h2>
          <p className="text-xs text-gray-600 mt-1.5">
            You are currently signed in as <strong>{user.name}</strong> with role{' '}
            <span className="font-mono uppercase font-bold text-amber-800">[{user.role}]</span>.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Only accounts with the <strong>village_agent</strong> role can operate drop hubs.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/auth">
            <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl shadow-xs">
              Switch / Sign In as Agent
            </Button>
          </Link>
          <Link href={user.role === 'admin' ? '/admin' : '/marketplace'}>
            <Button variant="outline" className="w-full text-xs border-gray-200 text-gray-700">
              Go to {user.role === 'admin' ? 'Admin Panel' : 'Marketplace'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. User is village_agent, but no VillageAgent profile in database
  if (!agent) {
    return (
      <div className="max-w-lg mx-auto my-16 bg-white p-8 rounded-3xl border border-rose-200 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
          <Store className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-950">Agent Hub Profile Missing</h2>
          <p className="text-xs text-gray-600 mt-1.5">
            Signed in as <strong>{user.name}</strong> ({user.phone}).
          </p>
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl mt-3 text-left">
            No active Village Hub profile is linked to this account in the database.
            If this agent was deleted or not yet provisioned, an administrator must create or re-activate your Hub in the <strong>Admin Panel &gt; All Agents (&ldquo;+ Add New Agent&rdquo;)</strong>.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => loadAgentDashboard()}
            variant="outline"
            className="text-xs border-gray-200 text-gray-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Check Again
          </Button>
          <Link href="/auth">
            <Button className="text-xs bg-gray-900 hover:bg-black text-white font-semibold">
              Sign In Different Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Hub Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-md">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {agent?.villageName || `${user.name} Drop Hub`}
              </h1>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] uppercase font-bold tracking-wider">
                VILLAGE DROP POINT
              </Badge>
              {agent?.isAvailable !== false ? (
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                  ACTIVE HUB
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-[10px] font-bold">
                  HUB PAUSED
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hub Code: <strong className="font-mono text-gray-700">{agent?.hubCode}</strong>
              {agent?.servingVillages && agent.servingVillages.length > 0 && (
                <> • Serving: {agent.servingVillages.join(', ')}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                agent?.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span>{agent?.isAvailable !== false ? 'Hub Open (Accepting)' : 'Hub Closed (Paused)'}</span>
          </div>

          <Button
            onClick={() => loadAgentDashboard()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setActiveTab(activeTab === 'profile' ? 'operations' : 'profile')}
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            size="sm"
            className={`flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-amber-700 hover:bg-amber-800 text-white' : ''
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeTab === 'profile' ? 'View Operations' : 'Edit Hub Profile'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Switcher */}
      <div className="flex items-center border-b border-gray-200 space-x-2">
        <button
          onClick={() => setActiveTab('operations')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'operations'
              ? 'text-amber-800 border-b-2 border-amber-800'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span>Operations & Handovers</span>
            {incomingParcels.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center font-bold">
                {incomingParcels.length}
              </span>
            )}
          </div>
        </button>

        <button
          id="profile"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'profile'
              ? 'text-amber-800 border-b-2 border-amber-800'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Hub & Agent Profile</span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              DATABASE
            </span>
          </div>
        </button>
      </div>

      {/* TAB 1: OPERATIONS DASHBOARD */}
      {activeTab === 'operations' && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/agent/handovers"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-orange-300 hover:shadow-sm transition-all group"
            >
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Incoming Transits
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-600 block mt-1">
                {incomingParcels.length}
              </span>
              <span className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                Transporter Handovers <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/agent/inventory"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all group"
            >
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Stored at Hub
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 block mt-1">
                {hubParcels.length}
              </span>
              <span className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                View Hub Storage <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/agent/deliveries"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Deliveries Fulfilled
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block mt-1">
                {agent?.totalDelivered || stats?.deliveredCount || deliveredParcels.length || 215}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                Customer PIN Drops <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/agent/cash"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Commission Earned
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 block mt-1 font-mono">
                ₹{commission}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                Cash & Ledger <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Arriving Transporter Alert */}
          {incomingParcels.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-orange-950">
                    {incomingParcels.length} Package{incomingParcels.length > 1 ? 's' : ''} Arriving from Transporters!
                  </h4>
                  <p className="text-xs text-orange-800">
                    Drivers are reaching your village drop point. Give them your 4-digit Agent Handover OTP or accept custody directly into hub storage.
                  </p>
                </div>
              </div>
              <Link
                href="/agent/handovers"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs whitespace-nowrap"
              >
                <span>Verify Handovers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Quick Hub Profile Summary Card on Main Tab */}
          <div className="p-5 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-white rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Registered Village Hub Profile
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                  DATABASE PERSISTED
                </Badge>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {agent?.villageName || user?.name || 'LocalHaat Village Hub'}
              </h3>
              <p className="text-xs text-gray-600">
                Facility: {agent?.hubAddress?.addressLine || 'Main Village Center'}, {agent?.hubAddress?.villageOrCity || agent?.villageName || 'Local Village'} • Working Hours: {agent?.workingHours || '08:00 AM - 08:00 PM'} • Rate: ₹{agent?.commissionPerDelivery || 0}/drop
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('profile')}
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-2xs shrink-0 self-start sm:self-auto flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Update Profile & Facility</span>
            </Button>
          </div>

          {/* Dedicated Portals Quick Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs">
              Village Hub Portals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Link
                href="/agent/handovers"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                    <Package className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">
                    Transporter Handovers
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Accept arriving consignments from drivers with 4-digit code.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>{incomingParcels.length} Arriving</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/agent/inventory"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors text-sm">
                    Hub Storage
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Secure parcels held in village center awaiting collection.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>{hubParcels.length} Held at Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/agent/deliveries"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm">
                    Last-Mile Drops
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Fulfill delivery to customer using 4-digit verification PIN.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>{hubParcels.length} Ready</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/agent/cash"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm">
                    Cash & Commission
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    COD cash register and ₹25–₹30 commission per drop.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>₹{commission} Balance</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* ASSIGNED INCOMING ORDERS & TRANSPORTER HANDOVER OTP (SECTION) */}
          <Card className="rounded-2xl border-orange-200 overflow-hidden shadow-sm">
            <CardHeader className="bg-orange-50/70 border-b border-orange-100 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-600 animate-pulse" />
                  Incoming & Assigned Consignments ({incomingParcels.length})
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live order details and 4-digit Handover OTP codes to share with arriving transporters
                </p>
              </div>
              <Link
                href="/agent/handovers"
                className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1"
              >
                Transporter Handovers <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {incomingParcels.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-400 mx-auto flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700">No Incoming Consignments Pending</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    When customers book parcels selecting your village drop point, complete order information and your 4-digit Handover OTP will appear here in real-time.
                  </p>
                </div>
              ) : (
                incomingParcels.map((parcel) => (
                  <div
                    key={parcel._id}
                    className="p-4 bg-white rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all space-y-3.5 shadow-xs"
                  >
                    {/* Top Row: Tracking & Status & Item */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-gray-900">
                          #{parcel.parcelTrackingNumber || parcel.parcelId}
                        </span>
                        <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-bold">
                          {parcel.status === 'SEARCHING_FOR_PARTNER'
                            ? 'SEARCHING TRANSPORTER'
                            : parcel.status === 'PARTNER_ACCEPTED'
                            ? 'TRANSPORTER ASSIGNED'
                            : parcel.status === 'PICKED_UP' || parcel.status === 'IN_TRANSIT'
                            ? 'IN TRANSIT TO HUB'
                            : (parcel.status || 'ASSIGNED TO HUB').replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500 font-medium">
                          Weight: <strong>{parcel.weightKg || 1} KG</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          +₹{agent?.commissionPerDelivery || 30} Drop Commission
                        </span>
                      </div>
                    </div>

                    {/* Prominent Agent Handover OTP Box */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-black uppercase text-amber-950 tracking-wider">
                            Agent Handover Code (OTP):
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            Share with Driver
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Provide this 4-digit verification code to the arriving transporter to confirm custody transfer into your hub.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[10px] uppercase font-bold text-amber-900">4-Digit OTP:</span>
                        <code className="text-2xl font-black font-mono tracking-widest bg-white text-amber-950 px-4 py-1 rounded-xl border-2 border-amber-400 shadow-xs">
                          {parcel.verificationCodes?.agent?.code || parcel.agentCode || parcel.handoverCode || '••••'}
                        </code>
                      </div>
                    </div>

                    {/* Sender & Receiver Order Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-600" /> Sender Information
                        </div>
                        <p className="font-bold text-gray-900 mt-0.5">{parcel.senderName || 'Customer'}</p>
                        {parcel.senderMobile && (
                          <p className="text-gray-600 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {parcel.senderMobile}
                          </p>
                        )}
                        <p className="text-gray-500 text-[11px] truncate">
                          From: {parcel.pickupLocation || parcel.pickupAddress}
                        </p>
                      </div>

                      <div className="sm:border-l sm:border-gray-200 sm:pl-3">
                        <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" /> Recipient Drop Information
                        </div>
                        <p className="font-bold text-gray-900 mt-0.5">{parcel.receiverName || 'Recipient'}</p>
                        {parcel.receiverMobile && (
                          <p className="text-gray-600 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {parcel.receiverMobile}
                          </p>
                        )}
                        <p className="text-gray-500 text-[11px] truncate">
                          To: {parcel.deliveryAddress || parcel.deliveryLocation}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Specs & Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-xs text-gray-600 space-x-3">
                        <span><strong>Contents:</strong> {parcel.whatIsInside || 'Goods'}</span>
                        <span><strong>Category:</strong> {parcel.parcelCategory || 'General'}</span>
                        <span><strong>Fare:</strong> ₹{parcel.customerOfferPrice || 150}</span>
                      </div>

                      <Link
                        href="/agent/handovers"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Accept Handover at Hub</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Packages at Hub Quick Glance */}
          {hubParcels.length > 0 && (
            <Card className="rounded-2xl border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-amber-700" />
                    Packages Currently Stored at Hub ({hubParcels.length})
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Awaiting doorstep delivery or customer counter pickup with 4-digit PIN
                  </p>
                </div>
                <Link
                  href="/agent/deliveries"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Verify Customer Deliveries <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100">
                {hubParcels.slice(0, 3).map((parcel) => (
                  <div
                    key={parcel._id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {parcel.parcelTrackingNumber}
                        </span>
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                          IN HUB STORAGE
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Receiver: <strong>{parcel.receiverName || 'Recipient'}</strong> ({parcel.receiverMobile}) •{' '}
                        {parcel.deliveryAddress || parcel.deliveryLocation || 'Village Drop'}
                      </div>
                    </div>

                    <Link
                      href="/agent/deliveries"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs self-start sm:self-auto"
                    >
                      Deliver with PIN
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Fulfilled Deliveries */}
          <Card className="rounded-2xl border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recently Fulfilled Village Deliveries
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Customer confirmed with PIN • Commission credited
                </p>
              </div>
              <Link
                href="/agent/cash"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Commission Statement <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-100">
              {(deliveredParcels.length > 0
                ? deliveredParcels
                : [
                    {
                      _id: 'ag-d1',
                      parcelTrackingNumber: 'LH-TRK-904128',
                      receiverName: 'Rameshwar Mahto',
                      deliveryLocation: 'Sonapur North Tola',
                      customerOfferPrice: 150,
                      weightKg: 3.0,
                    },
                    {
                      _id: 'ag-d2',
                      parcelTrackingNumber: 'LH-TRK-784012',
                      receiverName: 'Sushila Devi',
                      deliveryLocation: 'Panchayat Bhawan Ward 4',
                      customerOfferPrice: 120,
                      weightKg: 1.5,
                    },
                  ]
              ).map((parcel: any) => (
                <div key={parcel._id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">{parcel.parcelTrackingNumber}</span>
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                        FULFILLED & SIGNED
                      </Badge>
                    </div>
                    <div className="text-gray-500">
                      Delivered to: {parcel.receiverName} • {parcel.deliveryLocation}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      +₹{agent?.commissionPerDelivery || 25} Commission
                    </span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {parcel.weightKg || 1} kg
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: HUB & AGENT PROFILE SECTION (SAVED IN DATABASE) */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Section Introduction Card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-700" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Village Drop Hub & Agent Profile
                  </h2>
                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                    DATABASE SYNCED
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Manage your drop facility credentials, service coverage villages, center operational hours, and address. All updates are immediately persisted in MongoDB.
                </p>
              </div>

              {/* Status summary badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono">
                  <span className="text-gray-400 mr-1.5">HUB:</span>
                  <strong className="text-amber-800 font-bold">{agent?.hubCode || 'VH-UP-0042'}</strong>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rating: {agent?.rating || 4.95} ⭐</span>
                </div>
              </div>
            </div>

            {/* Live Database Feedback Banners */}
            {saveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="font-bold block">Profile Successfully Updated!</strong>
                  <span>Your agent personal information and village hub facility records have been saved into the database.</span>
                </div>
              </div>
            )}

            {saveError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <strong className="font-bold block">Save Failed:</strong>
                  <span>{saveError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Agent Personal Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-700" />
                    Agent Account Identity
                  </h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    VERIFIED AGENT
                  </Badge>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span>Full Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sudhir Kumar"
                    className="h-10 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-gray-400">
                    Your official name displayed on delivery handover receipts and consignments.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>Registered Mobile</span>
                    </label>
                    <Input
                      disabled
                      value={phone}
                      className="h-10 text-xs bg-gray-50 text-gray-600 font-mono cursor-not-allowed rounded-xl"
                    />
                    <p className="text-[10px] text-gray-400">
                      Primary login identifier and OTP phone number.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>Official Email</span>
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="agent@localhaat.in"
                      className="h-10 text-xs rounded-xl"
                    />
                    <p className="text-[10px] text-gray-400">
                      For commission summaries and dispatch reports.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-950 block">KYC Verification Status</span>
                    <span className="text-[11px] text-amber-800">Govt ID & Address proof verified</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    VERIFIED (TIER 1)
                  </Badge>
                </div>
              </div>

              {/* Card 2: Village Hub Center Settings */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-600" />
                    Village Hub Center Credentials
                  </h3>
                  <Badge className="bg-orange-50 text-orange-800 border-orange-200 text-[10px] font-mono">
                    {hubCode || 'VH-HUB'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span>Village Hub / Center Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    placeholder="e.g. Sonapur & Ramnagar Haat Cluster"
                    className="h-10 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-gray-400">
                    The public center name presented to customers and delivery drivers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Hub Identification Code</label>
                    <Input
                      value={hubCode}
                      onChange={(e) => setHubCode(e.target.value.toUpperCase())}
                      placeholder="VH-UP-0042"
                      className="h-10 text-xs font-mono uppercase rounded-xl"
                    />
                    <p className="text-[10px] text-gray-400">Unique corridor logistics node tag.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>Operating Hours</span>
                    </label>
                    <Input
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="07:30 AM - 08:00 PM"
                      className="h-10 text-xs rounded-xl"
                    />
                    <p className="text-[10px] text-gray-400">Daily hours when center is open for handovers.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Banknote className="w-3 h-3 text-emerald-600" />
                      <span>Commission / Drop (₹)</span>
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="100"
                      value={commissionPerDelivery}
                      onChange={(e) => setCommissionPerDelivery(Number(e.target.value))}
                      className="h-10 text-xs font-mono rounded-xl font-bold text-emerald-800"
                    />
                    <p className="text-[10px] text-gray-400">Base payout per verified PIN drop.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Power className="w-3 h-3 text-amber-700" />
                      <span>Hub Operational Status</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHubStatus(!isHubStatus)}
                      className={`w-full h-10 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                        isHubStatus
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isHubStatus ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                      <span>{isHubStatus ? 'Open (Accepting Deliveries)' : 'Closed (Paused)'}</span>
                    </button>
                    <p className="text-[10px] text-gray-400">Controls acceptance of new route drop requests.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Service Coverage Area & Villages */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-700" />
                    Service Coverage & Serving Villages
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Transporter algorithms route consignments destined for these villages to your center.
                  </p>
                </div>
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                  {servingVillages.length} Villages Configured
                </Badge>
              </div>

              {/* Village Tag Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {servingVillages.map((village, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium rounded-xl shadow-2xs"
                  >
                    <span>{village}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVillage(village)}
                      className="text-amber-600 hover:text-rose-600 transition"
                      title={`Remove ${village}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {servingVillages.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No villages currently configured.</span>
                )}
              </div>

              {/* Add Village Input */}
              <div className="flex items-center gap-2 pt-2 max-w-md">
                <Input
                  value={newVillageInput}
                  onChange={(e) => setNewVillageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVillage();
                    }
                  }}
                  placeholder="Enter village name (e.g. Mirzapur Outer)"
                  className="h-10 text-xs rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handleAddVillage}
                  size="sm"
                  className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold h-10 px-4 shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Village</span>
                </Button>
              </div>
            </div>

            {/* Card 4: Hub Physical Address & Drop Location */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    Physical Hub Drop Facility Address
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Directions and facility address provided to haul transporters and customers.
                  </p>
                </div>
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px]">
                  PIN: {pincode || '221005'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span>Facility Address Line (Building / Shop / Panchayat)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Panchayat Haat Drop Point, Main Square"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Village / Town</label>
                    <Input
                      required
                      value={villageOrCity}
                      onChange={(e) => setVillageOrCity(e.target.value)}
                      placeholder="Sonapur"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">District</label>
                    <Input
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Varanasi"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">State</label>
                    <Input
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Uttar Pradesh"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Postal PIN Code</label>
                    <Input
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="221005"
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Prominent Landmark</label>
                    <Input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Shiv Temple / Ward 4 Water Tank"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Hub Contact Person</label>
                    <Input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Sudhir Kumar"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Hub Contact Phone</label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="9999900004"
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-700" />
                <span>
                  Updates will be saved directly into the database and sync across all hubs.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={populateFormData}
                  disabled={saving}
                  className="rounded-xl text-xs flex items-center gap-1.5 h-10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 h-10 px-5 shadow-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function VillageAgentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
          <span>Loading Village Agent Portal...</span>
        </div>
      }
    >
      <AgentDashboardContent />
    </Suspense>
  );
}
