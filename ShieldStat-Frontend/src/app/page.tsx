'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Activity, Search, ShieldCheck, Shield } from 'lucide-react';
import { LoadingScan } from '@/components/LoadingScan';
import { registerScanTask } from '@/api/scanner';

export default function LandingPage() {
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domain.trim();
    if (cleanDomain) {
      const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainPattern.test(cleanDomain)) {
        setError('Please enter a valid domain name (e.g., example.com)');
        setIsScanning(false);
        return;
      }

      setIsScanning(true);
      setError(null);
      try {
        const res = await registerScanTask(cleanDomain);
        setScanId(res.scan_id);
      } catch (err: any) {
        setError(err.message || 'Failed to start scan');
        setIsScanning(false);
      }
    }
  };

  const handleScanComplete = (completedScanId: string) => {
    router.push(`/dashboard/report?scan_id=${completedScanId}&domain=${encodeURIComponent(domain)}`);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 bg-[#fcfcfc] transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[20%] h-[20%] bg-indigo-50 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl space-y-12"
      >
        {/* Branding & Header Section */}
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100/50"
          >
            <Activity className="w-3 h-3" />
            <span>System Operational</span>
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Security. <span className="text-blue-600">Simplified.</span>
            </h1>
            <p className="text-base text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
              Professional security assessment, threat monitoring, and real-time risk analysis.
            </p>
          </div>
        </div>

        {/* Scan Input Section */}
        <div className="max-w-2xl mx-auto w-full space-y-8">
          <form onSubmit={handleStartScan} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500"></div>
            <div className={`relative flex items-center bg-white border ${isScanning ? 'border-slate-100' : 'border-slate-200'} p-2 rounded-2xl shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all`}>
              <div className="flex items-center flex-1 px-4 text-slate-400">
                <Globe className="w-5 h-5 mr-3" />
                <input 
                  type="text" 
                  placeholder="Enter domain to scan (e.g. example.com)" 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase())}
                  className="bg-transparent flex-1 py-4 text-sm font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
                  required
                  autoFocus
                  disabled={isScanning}
                />
              </div>
              <button 
                type="submit"
                disabled={isScanning}
                className={`${isScanning ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 hover:bg-black text-white'} px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center space-x-2 active:scale-95`}
              >
                <span>{isScanning ? 'Scan in Progress' : 'Start Scan'}</span>
                {!isScanning && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Dynamic Scan Content */}
          <div className="relative min-h-[140px]">
            <AnimatePresence mode="wait">
              {!isScanning ? (
                <motion.div 
                  key="features"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {[
                    { icon: <Shield />, label: 'Real-time' },
                    { icon: <Globe />, label: 'Global DB' },
                    { icon: <ShieldCheck />, label: 'Heuristics' },
                    { icon: <Activity />, label: 'Analysis' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 opacity-60">
                      <div className="text-blue-500 opacity-80">
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="active-scan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-blue-900/5">
                    {error ? (
                      <div className="text-center p-8 text-red-500 font-bold">{error}</div>
                    ) : scanId ? (
                      <LoadingScan domain={domain} scanId={scanId} onComplete={handleScanComplete} />
                    ) : (
                      <div className="text-center p-8 text-slate-500 font-bold flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                        <span>Initializing assessment...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
