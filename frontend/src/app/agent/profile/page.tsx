'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agent?tab=profile');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-gray-400">
      Redirecting to Village Hub Profile...
    </div>
  );
}
