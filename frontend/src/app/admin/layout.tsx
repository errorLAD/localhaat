'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminProvider } from '../../context/AdminContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

const getDashboardUrl = (role?: string) => {
  switch (role) {
    case 'logistics_partner':
      return '/partner/dashboard';
    case 'village_agent':
      return '/agent/dashboard';
    case 'business':
      return '/business/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/customer/dashboard';
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const redirectTarget = pathname ? encodeURIComponent(pathname) : '%2Fadmin';
        router.replace(`/login?role=admin&redirect=${redirectTarget}`);
      } else if (user.role !== 'admin') {
        router.replace('/login?role=admin&reason=forbidden');
      }
    }
  }, [isLoading, user, router, pathname]);

  // 1. Loading state while checking localStorage/session
  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-4 shadow-xs">
          <ShieldAlert className="w-7 h-7 animate-pulse" />
        </div>
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-bold text-gray-900">Verifying Admin Authorization</h3>
        <p className="text-xs text-gray-500 mt-1">Please wait while we verify your administrative session...</p>
      </div>
    );
  }

  // 2. Unauthenticated user - strictly block rendering of admin pages and sidebar
  if (!user) {
    const redirectTarget = pathname ? encodeURIComponent(pathname) : '%2Fadmin';
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Administrator Access Required</h2>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          The Platform Administrative Control Center is strictly restricted. You must log in with authorized Administrator credentials to access this area.
        </p>
        <Button
          onClick={() => router.replace(`/login?role=admin&redirect=${redirectTarget}`)}
          className="w-full h-11 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
        >
          Sign In as Administrator <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // 3. Authenticated but non-admin user (e.g. customer, business, agent, partner)
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Administrative Privileges Required</h2>
        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
          You are currently signed in as <strong>{user.name}</strong> with role{' '}
          <span className="font-mono font-bold uppercase text-amber-800">[{user.role}]</span>.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          This portal is reserved strictly for Platform Administrators.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => router.replace(getDashboardUrl(user.role))}
            className="w-full h-10 border-gray-300 text-gray-700 text-xs font-semibold rounded-xl"
          >
            Go to My Portal
          </Button>
          <Button
            onClick={() => router.replace('/login?role=admin')}
            className="w-full h-10 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Switch to Admin Account
          </Button>
        </div>
      </div>
    );
  }

  // 4. Authorized administrator - render the full Admin panel
  return (
    <AdminProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AdminSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
