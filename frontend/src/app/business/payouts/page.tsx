'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessPayoutsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/business/invoices');
  }, [router]);

  return null;
}
