'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessOrdersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/business/shipments');
  }, [router]);

  return null;
}
