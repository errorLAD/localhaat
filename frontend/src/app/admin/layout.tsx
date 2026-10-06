'use client';

import React from 'react';
import { AdminProvider } from '../../context/AdminContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { ShieldAlert } from 'lucide-react';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, demoLogin } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {user && user.role !== 'admin' && (
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900">
                Non-Admin Account Detected
              </div>
              <div className="text-xs text-amber-900 mt-0.5">
                You are currently signed in as <strong>{user.name}</strong> ({user.phone}, role:{' '}
                <span className="font-mono font-bold uppercase">{user.role}</span>). Admin pages and agent directory are protected and require the Admin role.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => window.location.href = '/login?role=admin'}
            className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs whitespace-nowrap shadow-xs shrink-0"
          >
            Sign In with Admin Account
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
