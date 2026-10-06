'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  Receipt,
  Building2,
  PlusCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Badge } from './ui/badge';

export const BusinessSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { business, stats } = useBusiness();

  const menuItems = [
    {
      title: 'Dashboard Overview',
      href: '/business',
      icon: LayoutDashboard,
      color: 'text-indigo-600',
      activeCheck: pathname === '/business',
      badge: null,
    },
    {
      title: 'Shipments & Tracking',
      href: '/business/shipments',
      icon: Package,
      color: 'text-blue-600',
      activeCheck: pathname.startsWith('/business/shipments'),
      badge:
        stats.activeShipments > 0 ? (
          <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center justify-center animate-pulse">
            {stats.activeShipments}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono font-bold">
            {stats.totalShipments}
          </span>
        ),
    },
    {
      title: 'Pickup Requests',
      href: '/business/pickups',
      icon: Truck,
      color: 'text-amber-600',
      activeCheck: pathname.startsWith('/business/pickups'),
      badge: null,
    },
    {
      title: 'Invoices & Billing',
      href: '/business/invoices',
      icon: Receipt,
      color: 'text-emerald-600',
      activeCheck: pathname.startsWith('/business/invoices'),
      badge: (
        <span className="text-[10px] font-mono text-emerald-700 font-bold">
          ₹{stats.totalSpend}
        </span>
      ),
    },
    {
      title: 'Locations & Profile',
      href: '/business/profile',
      icon: Building2,
      color: 'text-purple-600',
      activeCheck: pathname.startsWith('/business/profile'),
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-20 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm space-y-4">
        {/* Sidebar Header */}
        <div className="px-2 pt-1 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              B2B Logistics Portal
            </span>
            <p className="text-[11px] text-gray-500 font-medium">Enterprise & Cargo</p>
          </div>
          <Badge
            variant="outline"
            className={
              business?.status === 'suspended'
                ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] uppercase font-bold'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-bold'
            }
          >
            {business?.status === 'suspended' ? 'Suspended' : 'Active Account'}
          </Badge>
        </div>

        {/* Business Entity Info */}
        <div className="p-3 bg-gradient-to-br from-indigo-50/60 to-blue-50/40 rounded-xl border border-indigo-100/70">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
            <h4 className="text-xs font-bold text-gray-900 truncate">
              {business?.businessName || user?.name || 'Business Client'}
            </h4>
          </div>
          <p className="text-[11px] text-gray-600 truncate pl-6">
            Contact: {business?.contactPerson || 'Authorized Manager'}
          </p>
          <div className="mt-2.5 pt-2 border-t border-indigo-100/60 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">Credit Limit:</span>
            <span className="font-bold text-indigo-900">₹{stats.creditLimit.toLocaleString()}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activeCheck;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.color
                    } transition-colors`}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge}
              </Link>
            );
          })}
        </nav>

        {/* Fast Action */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            href="/business/shipments?action=new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200/80 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            Book New Shipment
          </Link>
        </div>
      </div>

      {/* Credit & Security Notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Enterprise Freight Service
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Full corridor logistics network with driver GPS tracking, OTP handovers, and monthly billing statements.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Available Credit:</span>
          <span className="font-bold text-emerald-400">₹{stats.availableCredit.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  );
};
