'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { usePartner } from '../context/PartnerContext';
import {
  Truck,
  Radio,
  Package,
  Compass,
  Bike,
  DollarSign,
  Power,
  UserCheck,
} from 'lucide-react';
import { Badge } from './ui/badge';

export const PartnerSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  const {
    partner,
    incomingRequests,
    bookingRequests,
    activeParcels,
    routes,
    vehicles,
    locations,
    shops,
    stats,
    isOnline,
    togglingOnline,
    handleToggleOnline,
  } = usePartner();

  const totalEarnings = stats?.totalEarnings || partner?.walletBalance || 0;
  const pendingOffersCount = (bookingRequests || []).filter(
    (b) => b.status === 'PENDING_PARTNER_RESPONSE' && new Date(b.expiresAt).getTime() > Date.now()
  ).length;
  const totalRequestsCount = (incomingRequests?.length || 0) + pendingOffersCount;

  const menuItems = [
    {
      title: 'Partner Dashboard',
      href: '/partner',
      icon: Truck,
      color: 'text-blue-700',
      activeCheck: pathname === '/partner',
      badge: null,
    },
    {
      title: 'New Requests',
      href: '/partner/requests',
      icon: Radio,
      color: 'text-orange-600',
      activeCheck: pathname === '/partner/requests',
      badge:
        totalRequestsCount > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-orange-500 text-white flex items-center justify-center animate-pulse">
            {totalRequestsCount}
          </span>
        ) : null,
    },
    {
      title: 'Active Deliveries',
      href: '/partner/deliveries',
      icon: Package,
      color: 'text-indigo-600',
      activeCheck: pathname === '/partner/deliveries',
      badge:
        activeParcels.length > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-indigo-600 text-white flex items-center justify-center">
            {activeParcels.length}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono font-bold">0</span>
        ),
    },
    {
      title: 'My Travel Routes',
      href: '/partner/routes',
      icon: Compass,
      color: 'text-emerald-600',
      activeCheck: pathname === '/partner/routes',
      badge: (
        <span className="text-[10px] text-gray-400 font-mono font-bold">
          {routes.length}
        </span>
      ),
    },
    {
      title: 'Registered Transport',
      href: '/partner/vehicles',
      icon: Bike,
      color: 'text-purple-600',
      activeCheck: pathname === '/partner/vehicles',
      badge: (
        <span className="text-[10px] text-gray-400 font-mono font-bold">
          {vehicles.length}
        </span>
      ),
    },
    {
      title: 'Profit & Wallet',
      href: '/partner/wallet',
      icon: DollarSign,
      color: 'text-emerald-600',
      activeCheck: pathname === '/partner/wallet',
      badge: (
        <span className="text-[11px] font-mono text-emerald-900 font-extrabold">
          ₹{totalEarnings}
        </span>
      ),
    },
    {
      title: 'Partner Profile',
      href: '/partner/profile',
      icon: UserCheck,
      color: 'text-amber-600',
      activeCheck: pathname === '/partner/profile',
      badge: (locations?.length || 0) + (shops?.length || 0) > 0 ? (
        <span className="text-[10px] text-gray-400 font-mono font-bold">
          {(locations?.length || 0) + (shops?.length || 0)}
        </span>
      ) : null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-20 space-y-3">
      {/* Mobile Toggle Banner */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-700" />
          <span className="text-xs font-bold text-gray-900">Partner Fleet Navigation</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition"
        >
          {mobileMenuOpen ? 'Hide Menu' : 'Fleet Menu ▾'}
        </button>
      </div>

      <div className={`${mobileMenuOpen ? 'block' : 'hidden lg:block'} bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm space-y-4`}>
        {/* Sidebar Header */}
        <div className="px-2 pt-1 pb-2 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-700" />
              Transporter Fleet
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Navigation Menu</span>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] uppercase font-bold tracking-wider">
            PARTNER
          </Badge>
        </div>

        {/* Navigation Menu Items with Dedicated Links */}
        <nav className="space-y-1 text-xs font-semibold">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activeCheck;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : item.color}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge}
              </Link>
            );
          })}
        </nav>

        {/* Transporter Profile Box */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          <Link
            href="/partner/profile"
            className="block p-3 bg-gray-50 hover:bg-blue-50/50 transition-colors rounded-xl border border-gray-100 text-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 group-hover:text-blue-700 uppercase font-semibold tracking-wider">
                TRANSPORTER
              </span>
              <span className="text-[10px] text-blue-700 font-semibold group-hover:underline">
                Profile →
              </span>
            </div>
            <div className="font-bold text-gray-900 truncate mt-0.5">
              {partner?.businessName || user?.name || 'LocalHaat Partner'}
            </div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              {partner?.phone || user?.phone || ''}
            </div>
          </Link>

          {/* Online / Offline Switch */}
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Online (Accepting)' : 'Offline (Paused)'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
