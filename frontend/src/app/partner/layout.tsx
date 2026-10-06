'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PartnerProvider } from '../../context/PartnerContext';
import { PartnerSidebar } from '../../components/PartnerSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Lock } from 'lucide-react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isSignupPage = pathname?.startsWith('/partner/signup');

  useEffect(() => {
    if (!isSignupPage && !isLoading && !user) {
      router.replace('/login?role=logistics_partner&redirect=' + encodeURIComponent(pathname || '/partner/dashboard'));
    }
  }, [isSignupPage, isLoading, user, router, pathname]);

  // If on signup or onboarding pages, render without dashboard sidebar
  if (isSignupPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-600">Verifying Partner Fleet Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Logistics Partner Access Required</h2>
        <p className="text-xs text-gray-500 mb-5">Please sign in with your Logistics Partner account.</p>
        <Button
          onClick={() => router.replace('/login?role=logistics_partner&redirect=' + encodeURIComponent(pathname || '/partner/dashboard'))}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-6 h-10 rounded-xl"
        >
          Sign In as Partner
        </Button>
      </div>
    );
  }

  return (
    <PartnerProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <PartnerSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </PartnerProvider>
  );
}
