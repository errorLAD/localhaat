'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Truck,
  MapPin,
  Store,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

const ROLES_CONFIG: {
  role: UserRole;
  label: string;
  path: string;
  icon: any;
  color: string;
  badge: string;
}[] = [
  {
    role: 'customer',
    label: 'Customer',
    path: '/marketplace',
    icon: ShoppingCart,
    color: 'hover:bg-emerald-50 text-emerald-800 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    role: 'logistics_partner',
    label: 'Logistics Partner',
    path: '/partner',
    icon: Truck,
    color: 'hover:bg-blue-50 text-blue-800 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'village_agent',
    label: 'Local Hub Agent',
    path: '/agent',
    icon: MapPin,
    color: 'hover:bg-amber-50 text-amber-800 border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    role: 'business',
    label: 'Business / Seller',
    path: '/business',
    icon: Store,
    color: 'hover:bg-orange-50 text-orange-800 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
  },
  {
    role: 'admin',
    label: 'Platform Admin',
    path: '/admin',
    icon: ShieldAlert,
    color: 'hover:bg-purple-50 text-purple-800 border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
  },
];

export const RoleQuickSwitch: React.FC = () => {
  const { user, demoLogin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = async (targetRole: UserRole, targetPath: string) => {
    if (!user || user.role !== targetRole) {
      await demoLogin(targetRole);
    }
    router.push(targetPath);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-amber-900">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Role Tester:</span>
          <span className="hidden sm:inline text-amber-700">
            Switch between the 5 LocalHaat portals with pre-seeded demo accounts:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ROLES_CONFIG.map(({ role, label, path, icon: Icon, color, badge }) => {
            const isActive =
              user?.role === role &&
              (pathname?.startsWith(path) || (role === 'customer' && pathname === '/customer'));
            return (
              <button
                key={role}
                disabled={isLoading}
                onClick={() => handleSwitch(role, path)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-primary-800 text-white border-primary-900 shadow-xs'
                    : `bg-white/80 ${color}`
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
