'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  DollarSign,
  Truck,
  ShoppingBag,
  PlusCircle,
  Layers,
  Boxes,
  ClipboardList,
  CreditCard,
  Percent,
  Star,
  Settings,
  Store,
  ChevronDown,
  ChevronRight,
  GitBranch,
  UserCheck,
  Radio,
  Clock,
  CheckCircle2,
  Moon,
  AlertTriangle,
  Ban,
  Package,
  MessageSquareWarning,
  History,
  Sliders,
  Award,
  Search,
  Inbox,
  Navigation,
  XCircle,
  RotateCcw,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import { Badge } from './ui/badge';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { users, businesses, kycDocs, payouts, shipments } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const [storeExpanded, setStoreExpanded] = useState(pathname.startsWith('/admin/store'));
  const [agentsExpanded, setAgentsExpanded] = useState(pathname.startsWith('/admin/agents'));
  const [parcelsExpanded, setParcelsExpanded] = useState(pathname.startsWith('/admin/parcels'));
  const [logisticsExpanded, setLogisticsExpanded] = useState(pathname.startsWith('/admin/logistics') || pathname === '/admin');

  const pendingKycCount = kycDocs.filter((d) => d.verificationStatus === 'PENDING').length;
  const pendingPayoutCount = payouts.filter((p) => p.status === 'pending').length;
  const activeShipmentCount = shipments.filter((s) =>
    ['CREATED', 'PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'].includes(s.status)
  ).length;

  const isStoreActive = pathname.startsWith('/admin/store');

  const storeMenuItems = [
    {
      title: 'Dashboard',
      href: '/admin/store',
      icon: Store,
      activeCheck: pathname === '/admin/store' || pathname === '/admin/store/dashboard',
    },
    {
      title: 'Categories',
      href: '/admin/store/categories',
      icon: Layers,
      activeCheck: pathname.startsWith('/admin/store/categories'),
    },
    {
      title: 'Subcategories',
      href: '/admin/store/subcategories',
      icon: GitBranch,
      activeCheck: pathname.startsWith('/admin/store/subcategories'),
    },
    {
      title: 'Products',
      href: '/admin/store/products',
      icon: ShoppingBag,
      activeCheck: pathname.startsWith('/admin/store/products'),
    },
    {
      title: 'Inventory',
      href: '/admin/store/inventory',
      icon: Boxes,
      activeCheck: pathname.startsWith('/admin/store/inventory'),
    },
    {
      title: 'Orders',
      href: '/admin/store/orders',
      icon: ClipboardList,
      activeCheck: pathname.startsWith('/admin/store/orders'),
    },
    {
      title: 'Payments',
      href: '/admin/store/payments',
      icon: CreditCard,
      activeCheck: pathname.startsWith('/admin/store/payments'),
    },
    {
      title: 'Customers',
      href: '/admin/store/customers',
      icon: UserCheck,
      activeCheck: pathname.startsWith('/admin/store/customers'),
    },
    {
      title: 'Coupons / Discounts',
      href: '/admin/store/coupons',
      icon: Percent,
      activeCheck: pathname.startsWith('/admin/store/coupons'),
    },
    {
      title: 'Reviews',
      href: '/admin/store/reviews',
      icon: Star,
      activeCheck: pathname.startsWith('/admin/store/reviews'),
    },
    {
      title: 'Shipping & Delivery',
      href: '/admin/store/shipping',
      icon: Truck,
      activeCheck: pathname.startsWith('/admin/store/shipping'),
    },
    {
      title: 'Store Settings',
      href: '/admin/store/settings',
      icon: Settings,
      activeCheck: pathname.startsWith('/admin/store/settings'),
    },
  ];

  const isAgentsActive = pathname.startsWith('/admin/agents');

  const agentsMenuItems = [
    {
      title: 'Agent Dashboard',
      href: '/admin/agents',
      icon: LayoutDashboard,
      activeCheck: pathname === '/admin/agents',
    },
    {
      title: 'Live Agents',
      href: '/admin/agents/live',
      icon: Radio,
      activeCheck: pathname === '/admin/agents/live',
      badge: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />,
    },
    {
      title: 'All Agents',
      href: '/admin/agents/all',
      icon: Users,
      activeCheck: pathname === '/admin/agents/all',
    },
    {
      title: 'Pending Verification',
      href: '/admin/agents/verification',
      icon: Clock,
      activeCheck: pathname === '/admin/agents/verification',
    },
    {
      title: 'Active Agents',
      href: '/admin/agents/active',
      icon: CheckCircle2,
      activeCheck: pathname === '/admin/agents/active',
    },
    {
      title: 'Offline Agents',
      href: '/admin/agents/offline',
      icon: Moon,
      activeCheck: pathname === '/admin/agents/offline',
    },
    {
      title: 'Suspended Agents',
      href: '/admin/agents/suspended',
      icon: AlertTriangle,
      activeCheck: pathname === '/admin/agents/suspended',
    },
    {
      title: 'Blocked Agents',
      href: '/admin/agents/blocked',
      icon: Ban,
      activeCheck: pathname === '/admin/agents/blocked',
    },
    {
      title: 'Agent Packages',
      href: '/admin/agents/packages',
      icon: Package,
      activeCheck: pathname.startsWith('/admin/agents/packages'),
    },
    {
      title: 'Agent Earnings',
      href: '/admin/agents/earnings',
      icon: DollarSign,
      activeCheck: pathname.startsWith('/admin/agents/earnings'),
    },
    {
      title: 'Agent Payouts',
      href: '/admin/agents/payouts',
      icon: CreditCard,
      activeCheck: pathname.startsWith('/admin/agents/payouts'),
    },
    {
      title: 'Agent Reviews',
      href: '/admin/agents/reviews',
      icon: Star,
      activeCheck: pathname.startsWith('/admin/agents/reviews'),
    },
    {
      title: 'Agent Complaints',
      href: '/admin/agents/complaints',
      icon: MessageSquareWarning,
      activeCheck: pathname.startsWith('/admin/agents/complaints'),
    },
    {
      title: 'Agent Documents',
      href: '/admin/agents/documents',
      icon: FileText,
      activeCheck: pathname.startsWith('/admin/agents/documents'),
    },
    {
      title: 'Agent Activity Logs',
      href: '/admin/agents/activity',
      icon: History,
      activeCheck: pathname.startsWith('/admin/agents/activity'),
    },
    {
      title: 'Agent Settings',
      href: '/admin/agents/settings',
      icon: Sliders,
      activeCheck: pathname.startsWith('/admin/agents/settings'),
    },
  ];

  const isParcelsActive = pathname.startsWith('/admin/parcels');

  const parcelsMenuItems = [
    {
      title: 'Parcel Dashboard',
      href: '/admin/parcels',
      icon: LayoutDashboard,
      activeCheck: pathname === '/admin/parcels',
    },
    {
      title: 'All Parcels',
      href: '/admin/parcels/all',
      icon: Package,
      activeCheck: pathname === '/admin/parcels/all',
    },
    {
      title: 'New / Unbooked',
      href: '/admin/parcels/unbooked',
      icon: Inbox,
      activeCheck: pathname === '/admin/parcels/unbooked',
      badge: <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />,
    },
    {
      title: 'Searching Partner',
      href: '/admin/parcels/searching',
      icon: Search,
      activeCheck: pathname === '/admin/parcels/searching',
    },
    {
      title: 'Partner Accepted',
      href: '/admin/parcels/accepted',
      icon: CheckCircle2,
      activeCheck: pathname === '/admin/parcels/accepted',
    },
    {
      title: 'Pickup Pending',
      href: '/admin/parcels/pickup-pending',
      icon: Clock,
      activeCheck: pathname === '/admin/parcels/pickup-pending',
    },
    {
      title: 'Picked Up',
      href: '/admin/parcels/picked-up',
      icon: Truck,
      activeCheck: pathname === '/admin/parcels/picked-up',
    },
    {
      title: 'In Transit',
      href: '/admin/parcels/in-transit',
      icon: Navigation,
      activeCheck: pathname === '/admin/parcels/in-transit',
    },
    {
      title: 'At Hub',
      href: '/admin/parcels/at-hub',
      icon: Layers,
      activeCheck: pathname === '/admin/parcels/at-hub',
    },
    {
      title: 'At Village Agent',
      href: '/admin/parcels/at-agent',
      icon: Store,
      activeCheck: pathname === '/admin/parcels/at-agent',
    },
    {
      title: 'Out for Delivery',
      href: '/admin/parcels/out-for-delivery',
      icon: Radio,
      activeCheck: pathname === '/admin/parcels/out-for-delivery',
    },
    {
      title: 'Delivered',
      href: '/admin/parcels/delivered',
      icon: CheckCircle2,
      activeCheck: pathname === '/admin/parcels/delivered',
    },
    {
      title: 'Failed',
      href: '/admin/parcels/failed',
      icon: XCircle,
      activeCheck: pathname === '/admin/parcels/failed',
    },
    {
      title: 'Returned',
      href: '/admin/parcels/returned',
      icon: RotateCcw,
      activeCheck: pathname === '/admin/parcels/returned',
    },
    {
      title: 'Cancelled',
      href: '/admin/parcels/cancelled',
      icon: Ban,
      activeCheck: pathname === '/admin/parcels/cancelled',
    },
    {
      title: 'Disputed',
      href: '/admin/parcels/disputed',
      icon: ShieldAlert,
      activeCheck: pathname === '/admin/parcels/disputed',
      badge: <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded">ALERT</span>,
    },
    {
      title: 'Payments',
      href: '/admin/parcels/payments',
      icon: CreditCard,
      activeCheck: pathname === '/admin/parcels/payments',
    },
    {
      title: 'Partner Earnings',
      href: '/admin/parcels/partner-earnings',
      icon: DollarSign,
      activeCheck: pathname === '/admin/parcels/partner-earnings',
    },
    {
      title: 'Parcel Analytics',
      href: '/admin/parcels/analytics',
      icon: BarChart3,
      activeCheck: pathname === '/admin/parcels/analytics',
    },
  ];

  const isLogisticsActive = pathname.startsWith('/admin/logistics');

  const logisticsMenuItems = [
    {
      title: 'Logistics Dashboard',
      href: '/admin/logistics',
      icon: LayoutDashboard,
      activeCheck: pathname === '/admin/logistics',
    },
    {
      title: 'Live Moving Now',
      href: '/admin/logistics/live',
      icon: Radio,
      activeCheck: pathname.startsWith('/admin/logistics/live') || pathname.startsWith('/admin/logistics/trips'),
      badge: (
        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      ),
    },
    {
      title: 'Partners Directory',
      href: '/admin/logistics/partners',
      icon: Users,
      activeCheck: pathname === '/admin/logistics/partners' || (pathname.startsWith('/admin/logistics/partners') && !pathname.includes('/verification')),
    },
    {
      title: 'Partner Verification',
      href: '/admin/logistics/verification',
      icon: ShieldCheck,
      activeCheck: pathname.startsWith('/admin/logistics/verification'),
    },
    {
      title: 'Routes & Trips',
      href: '/admin/logistics/routes',
      icon: Navigation,
      activeCheck: pathname.startsWith('/admin/logistics/routes'),
    },
    {
      title: 'Parcel Assignment',
      href: '/admin/logistics/assignment',
      icon: Search,
      activeCheck: pathname.startsWith('/admin/logistics/assignment'),
    },
    {
      title: 'Custody & Handovers',
      href: '/admin/logistics/handovers',
      icon: Layers,
      activeCheck: pathname.startsWith('/admin/logistics/handovers'),
    },
    {
      title: 'Partner Earnings',
      href: '/admin/logistics/earnings',
      icon: DollarSign,
      activeCheck: pathname.startsWith('/admin/logistics/earnings'),
    },
    {
      title: 'Partner Payouts',
      href: '/admin/logistics/payouts',
      icon: CreditCard,
      activeCheck: pathname.startsWith('/admin/logistics/payouts'),
    },
    {
      title: 'Complaints & Issues',
      href: '/admin/logistics/complaints',
      icon: MessageSquareWarning,
      activeCheck: pathname.startsWith('/admin/logistics/complaints'),
    },
    {
      title: 'Activity Logs',
      href: '/admin/logistics/activity',
      icon: History,
      activeCheck: pathname.startsWith('/admin/logistics/activity'),
    },
    {
      title: 'Logistics Analytics',
      href: '/admin/logistics/analytics',
      icon: BarChart3,
      activeCheck: pathname.startsWith('/admin/logistics/analytics'),
    },
  ];

  const platformMenuItems = [
    {
      title: 'Platform Overview',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'text-purple-700',
      activeCheck: pathname === '/admin',
      badge: null,
    },
    {
      title: 'Business Accounts',
      href: '/admin/businesses',
      icon: Building2,
      color: 'text-indigo-600',
      activeCheck: pathname.startsWith('/admin/businesses'),
      badge: (
        <span className="text-[10px] text-gray-500 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 text-indigo-700">
          {businesses.length}
        </span>
      ),
    },
    {
      title: 'Users Directory',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-600',
      activeCheck: pathname.startsWith('/admin/users'),
      badge: (
        <span className="text-[10px] text-gray-500 font-mono font-bold">
          {users.length}
        </span>
      ),
    },
    {
      title: 'KYC Reviews',
      href: '/admin/kyc',
      icon: FileText,
      color: 'text-amber-600',
      activeCheck: pathname.startsWith('/admin/kyc'),
      badge:
        pendingKycCount > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center justify-center animate-pulse">
            {pendingKycCount}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono font-bold">0</span>
        ),
    },
    {
      title: 'Payout Disbursals',
      href: '/admin/payouts',
      icon: DollarSign,
      color: 'text-emerald-600',
      activeCheck: pathname.startsWith('/admin/payouts'),
      badge:
        pendingPayoutCount > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center justify-center animate-pulse">
            {pendingPayoutCount}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono font-bold">0</span>
        ),
    },
    {
      title: 'Corridor Logistics',
      href: '/admin/shipments',
      icon: Truck,
      color: 'text-sky-600',
      activeCheck: pathname.startsWith('/admin/shipments'),
      badge:
        activeShipmentCount > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-sky-600 text-white flex items-center justify-center">
            {activeShipmentCount}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono font-bold">
            {shipments.length}
          </span>
        ),
    },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-20 space-y-3">
      {/* Mobile Toggle Banner */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          <span className="text-xs font-bold text-gray-900">Admin Control Panel</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition"
        >
          {mobileOpen ? 'Hide Menu' : 'Admin Menu ▾'}
        </button>
      </div>

      <div className={`${mobileOpen ? 'block' : 'hidden lg:block'} bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm space-y-4`}>
        {/* Sidebar Header */}
        <div className="px-2 pt-1 pb-2 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Platform Admin
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Control Center</span>
          </div>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] uppercase font-bold tracking-wider">
            ROOT
          </Badge>
        </div>

        {/* ================= PRIMARY SECTION: E-COMMERCE / STORE ================= */}
        <div>
          <button
            onClick={() => setStoreExpanded(!storeExpanded)}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isStoreActive
                ? 'bg-amber-500/10 text-amber-900 border border-amber-200/60'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Store className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight uppercase text-[11px] font-extrabold text-amber-950">
                E-Commerce / Store
              </span>
            </div>
            {storeExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {storeExpanded && (
            <div className="mt-1.5 ml-2 pl-3 border-l-2 border-amber-200/60 space-y-0.5">
              {storeMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activeCheck;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-amber-700'}`} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PRIMARY SECTION: AGENTS ================= */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setAgentsExpanded(!agentsExpanded)}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isAgentsActive
                ? 'bg-emerald-500/10 text-emerald-950 border border-emerald-200/60'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight uppercase text-[11px] font-extrabold text-emerald-950">
                Village Agents
              </span>
            </div>
            {agentsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-emerald-800" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {agentsExpanded && (
            <div className="mt-1.5 ml-2 pl-3 border-l-2 border-emerald-200/60 space-y-0.5 max-h-[360px] overflow-y-auto pr-1">
              {agentsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activeCheck;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PRIMARY SECTION: PARCELS ================= */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setParcelsExpanded(!parcelsExpanded)}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isParcelsActive
                ? 'bg-blue-500/10 text-blue-950 border border-blue-200/60'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight uppercase text-[11px] font-extrabold text-blue-950">
                Parcels
              </span>
            </div>
            {parcelsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-blue-800" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {parcelsExpanded && (
            <div className="mt-1.5 ml-2 pl-3 border-l-2 border-blue-200/60 space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
              {parcelsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activeCheck;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-700'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PRIMARY SECTION: LOGISTICS ================= */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setLogisticsExpanded(!logisticsExpanded)}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isLogisticsActive
                ? 'bg-sky-500/10 text-sky-950 border border-sky-200/60'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight uppercase text-[11px] font-extrabold text-sky-950">
                Logistics
              </span>
            </div>
            {logisticsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-sky-800" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {logisticsExpanded && (
            <div className="mt-1.5 ml-2 pl-3 border-l-2 border-sky-200/60 space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
              {logisticsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activeCheck;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-sky-700'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= SECONDARY SECTION: PLATFORM ADMIN ================= */}
        <div className="pt-2 border-t border-gray-100">
          <div className="px-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
            Platform Infrastructure
          </div>
          <nav className="space-y-1 text-xs font-semibold">
            {platformMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeCheck;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200 shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-700' : item.color}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Button */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            href="/admin/businesses?action=new"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl transition border border-purple-200 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-700" />
            + Provision Business
          </Link>
        </div>

        {/* Admin Operator Profile Box */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              COMPANY STORE ADMIN
            </div>
            <div className="font-bold text-gray-900 truncate mt-0.5">
              {user?.name || 'Devendra Pratap (Admin)'}
            </div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              {user?.phone || '9999900001'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
