'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import {
  MapPin,
  Package,
  Boxes,
  ShieldCheck,
  Banknote,
  Power,
  Home,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Badge } from './ui/badge';

export const AgentSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const {
    agent,
    incomingParcels,
    hubParcels,
    stats,
    isHubOpen,
    togglingHub,
    handleToggleHub,
  } = useAgent();

  const cashInHand = agent?.cashInHand ?? 0;
  const commission = stats?.totalEarnings ?? (agent?.totalDelivered ? agent.totalDelivered * (agent.commissionPerDelivery || 10) : 0);

  const menuItems = [
    {
      title: 'Hub Dashboard',
      href: '/agent',
      icon: Home,
      color: 'text-amber-700',
      activeCheck: pathname === '/agent',
      badge: null,
    },
    {
      title: 'Hub & Agent Profile',
      href: '/agent?tab=profile',
      icon: UserCheck,
      color: 'text-amber-800',
      activeCheck: false,
      badge: (
        <span className="text-[10px] text-amber-700 font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
          {agent?.hubCode || 'VH-HUB'}
        </span>
      ),
    },
    {
      title: 'Transporter Handovers',
      href: '/agent/handovers',
      icon: Package,
      color: 'text-orange-600',
      activeCheck: pathname === '/agent/handovers',
      badge:
        incomingParcels.length > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-orange-500 text-white flex items-center justify-center animate-pulse">
            {incomingParcels.length}
          </span>
        ) : null,
    },
    {
      title: 'Hub Storage Inventory',
      href: '/agent/inventory',
      icon: Boxes,
      color: 'text-amber-700',
      activeCheck: pathname === '/agent/inventory',
      badge: (
        <span className="text-[10px] text-gray-400 font-mono font-bold">
          {hubParcels.length}
        </span>
      ),
    },
    {
      title: 'Last-Mile Deliveries',
      href: '/agent/deliveries',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      activeCheck: pathname === '/agent/deliveries',
      badge:
        hubParcels.length > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center justify-center">
            {hubParcels.length}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono font-bold">0</span>
        ),
    },
    {
      title: 'Cash & Commission',
      href: '/agent/cash',
      icon: Banknote,
      color: 'text-emerald-700',
      activeCheck: pathname === '/agent/cash',
      badge: (
        <span className="text-[11px] font-mono text-emerald-900 font-extrabold">
          ₹{commission}
        </span>
      ),
    },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-20 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm space-y-4">
        {/* Sidebar Header */}
        <div className="px-2 pt-1 pb-2 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              Village Drop Hub
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Navigation Menu</span>
          </div>
          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] uppercase font-bold tracking-wider">
            AGENT
          </Badge>
        </div>

        {/* Navigation Menu Links */}
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
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-800' : item.color}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge}
              </Link>
            );
          })}
        </nav>

        {/* Village Hub Profile Box */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          <Link
            href="/agent?tab=profile"
            className="block p-3 bg-gray-50 hover:bg-amber-50/60 rounded-xl border border-gray-100 hover:border-amber-200 text-xs transition-all group"
            title="Click to view & edit Village Hub Profile"
          >
            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider flex items-center justify-between">
              <span>VILLAGE HUB</span>
              <span className="font-mono text-amber-800 font-bold">{agent?.hubCode || ''}</span>
            </div>
            <div className="font-bold text-gray-900 group-hover:text-amber-900 truncate mt-1 flex items-center justify-between">
              <span>{agent?.villageName || user?.name || 'Village Drop Hub'}</span>
              <span className="text-[10px] text-amber-700 font-medium group-hover:underline">Profile</span>
            </div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              {agent?.hubAddress?.contactPhone || user?.phone || ''}
            </div>
          </Link>

          {/* Hub Status Switch */}
          <button
            onClick={handleToggleHub}
            disabled={togglingHub}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              isHubOpen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isHubOpen ? 'Hub Open (Accepting)' : 'Hub Closed (Paused)'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
