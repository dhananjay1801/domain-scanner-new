'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewScanRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <div className="min-h-full bg-[#fcfcfc]" />;
}
