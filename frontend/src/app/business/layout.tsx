'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BusinessProvider } from '../../context/BusinessContext';
import { BusinessSidebar } from '../../components/BusinessSidebar';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/business/login' || pathname === '/business/signup';

  if (isAuthPage) {
    return <>{children}</>;
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
