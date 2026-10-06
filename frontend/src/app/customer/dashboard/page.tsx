'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarketplacePage from '../../marketplace/page';

export default function CustomerDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/marketplace');
  }, [router]);

  return <MarketplacePage />;
}
