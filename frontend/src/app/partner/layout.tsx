'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PartnerProvider } from '../../context/PartnerContext';
import { PartnerSidebar } from '../../components/PartnerSidebar';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignupPage = pathname?.startsWith('/partner/signup');

  // If on signup or onboarding pages, render without dashboard sidebar
  if (isSignupPage) {
    return <>{children}</>;
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
