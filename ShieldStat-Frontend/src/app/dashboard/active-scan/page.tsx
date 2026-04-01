'use client'

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LoadingScan } from '@/components/LoadingScan';
import { Loader2 } from 'lucide-react';

function ActiveScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const domain = searchParams.get('domain') || 'unknown.com';
  const scanId = searchParams.get('scan_id');

  const handleScanComplete = (completedScanId: string) => {
    router.replace(`/dashboard/report?scan_id=${completedScanId}&domain=${encodeURIComponent(domain)}`);
  };

  if (!scanId) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-[#fcfcfc]">
        <div className="text-center p-8 text-red-500 font-bold">Error: No active scan_id provided</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 bg-[#fcfcfc]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-blue-900/5">
           <LoadingScan domain={domain} scanId={scanId} onComplete={handleScanComplete} />
        </div>
      </motion.div>
    </div>
  );
}

export default function ActiveScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-full flex flex-col items-center justify-center bg-[#fcfcfc]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ActiveScanContent />
    </Suspense>
  );
}
