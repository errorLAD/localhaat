'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BusinessProvider } from '../../context/BusinessContext';
import { BusinessSidebar } from '../../components/BusinessSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Lock } from 'lucide-react';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPage = pathname === '/business/login' || pathname === '/business/signup';

  useEffect(() => {
    if (!isAuthPage && !isLoading && !user) {
      router.replace('/business/login');
    }
  }, [isAuthPage, isLoading, user, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-600">Verifying Business Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Business Account Required</h2>
        <p className="text-xs text-gray-500 mb-5">Please sign in with your enterprise business credentials.</p>
        <Button
          onClick={() => router.replace('/business/login')}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-6 h-10 rounded-xl"
        >
          Sign In as Business
        </Button>
      </div>
    );
  }

  return (
    <BusinessProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <BusinessSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </BusinessProvider>
  );
}
