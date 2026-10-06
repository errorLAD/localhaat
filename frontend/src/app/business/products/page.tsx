'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessProductsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/business');
  }, [router]);

  return null;
}
