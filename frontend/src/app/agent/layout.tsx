'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AgentProvider } from '../../context/AgentContext';
import { AgentSidebar } from '../../components/AgentSidebar';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignupPage = pathname?.startsWith('/agent/signup');

  // If on signup or onboarding pages, render without dashboard sidebar
  if (isSignupPage) {
    return <>{children}</>;
  }

  return (
    <AgentProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AgentSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </AgentProvider>
  );
}
