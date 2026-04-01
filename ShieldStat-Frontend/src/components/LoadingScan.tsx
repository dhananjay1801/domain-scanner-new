'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScanResult } from '@/api/scanner';
import { submitForAnalyzer } from '@/api/analyzer';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Search, 
  Globe, 
  Activity, 
  Target, 
  ShieldCheck,
  Lock,
  Cpu,
  Loader2,
  Bug,
  Server,
  Network,
  CheckCircle2,
  TerminalSquare
} from 'lucide-react';

interface LoadingScanProps {
  domain: string;
  scanId: string;
  onComplete: (scanId: string) => void;
}

const PARTICLES = [
  { icon: <Lock size={12} />, label: 'SSL' },
  { icon: <ShieldCheck size={12} />, label: 'HSTS' },
  { icon: <Search size={12} />, label: 'DNS' },
  { icon: <Globe size={12} />, label: 'GEO' },
  { icon: <Cpu size={12} />, label: 'CORE' },
  { icon: <Target size={12} />, label: 'PORT' },
  { icon: <Activity size={12} />, label: 'RECO' },
  { icon: <Bug size={12} />, label: 'VULN' },
  { icon: <Server size={12} />, label: 'HOST' },
  { icon: <Network size={12} />, label: 'NET' },
];

export const LoadingScan: React.FC<LoadingScanProps> = ({ domain, scanId, onComplete }) => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [realScanDone, setRealScanDone] = useState(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [activeParticles, setActiveParticles] = useState<any[]>([]);

  // Handle "Back" navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
      router.replace('/dashboard/scan-history');
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);


  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + Math.random() * 2;
        if (realScanDone && prev < 99) return prev + 1;
        return prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [realScanDone]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDone) return;
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 80;
      const newParticle = {
        id: Math.random(),
        ...PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: Math.random() * 360
      };
      setActiveParticles(prev => [...prev.slice(-12), newParticle]);
    }, 800);
    return () => clearInterval(interval);
  }, [isDone]);

  useEffect(() => {
    let isMounted = true;
    const pollScan = async () => {
      try {
        const result = await getScanResult(scanId);
        if (result && result.status !== 'pending' && result.data) {
          if (isMounted) setRealScanDone(true);
        } else {
          if (isMounted) setTimeout(pollScan, 3000);
        }
      } catch (e) {
        if (isMounted) setTimeout(pollScan, 3000);
      }
    };
    pollScan();
    return () => { isMounted = false; };
  }, [scanId]);

  useEffect(() => {
    if (progress >= 95 && realScanDone && !isDone && !analyzerError) {
      submitForAnalyzer(scanId)
        .then(() => {
          setProgress(100);
          setIsDone(true);
          setTimeout(() => onComplete(scanId), 2500);
        })
        .catch(err => {
          setAnalyzerError(err.message || 'Analysis failed');
        });
    }
  }, [progress, realScanDone, isDone, scanId, onComplete, analyzerError]);

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center h-full min-h-[calc(100vh-8rem)] bg-[#fcfcfc] overflow-hidden rounded-3xl py-2 selection:bg-[#3b2a8d]/10">
      
      {/* 🌌 Atmospheric Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], opacity: [0.15, 0.2, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-br from-[#3b2a8d]/10 to-transparent rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-[#5f42d6]/10 to-transparent rounded-full blur-[140px]" 
        />
      </div>

      {/* 📐 Subtle Architecture Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,42,141,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,42,141,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-4xl flex flex-col items-center z-10">
        
        {/* Header Badges */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-1 mb-2"
        >
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-[#3b2a8d]/10 px-3 py-1 rounded-full shadow-[0_4px_15px_rgba(59,42,141,0.03)] scale-90">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b2a8d] animate-pulse" />
            <span className="text-[9px] font-black text-[#3b2a8d] uppercase tracking-[0.3em]">Quantum Security Core</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#3b2a8d] to-[#7f64ea]">Scanning</span> {domain}
          </h2>
        </motion.div>

        {/* ⚛️ Central Animation: Quantum Security Core */}
        <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center my-2">
          
          {/* Orbital Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer Thick Dashed Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border-[1px] border-dashed border-[#3b2a8d]/20"
            />
            {/* Middle Thin Ring */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[25%] rounded-full border border-[#3b2a8d]/10 shadow-[inset_0_0_20px_rgba(59,42,141,0.02)]"
            />
            {/* Inner Glowing Ring */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[35%] rounded-full border-[2px] border-[#3b2a8d]/15 bg-white/30 backdrop-blur-sm"
            />
          </div>

          {/* Sweeping Radar Conic Gradient */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,42,141,0)_0%,rgba(59,42,141,0.02)_25%,rgba(95,66,214,0.1)_50%,rgba(59,42,141,0)_50%)]"
            style={{ filter: "blur(4px)" }}
          />

          {/* Core Shield Floating Hub */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 w-32 h-32 bg-white rounded-3xl border border-white/50 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(59,42,141,0.15)] overflow-hidden"
          >
            {/* Inner glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent" />
            <Shield className="w-14 h-14 text-[#3b2a8d] drop-shadow-md z-10" />
            {isDone && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-md z-20"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </motion.div>
            )}
            
            {/* Subtle inner pulse */}
            {!isDone && (
              <motion.div 
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-12 h-12 bg-[#3b2a8d]/20 rounded-full"
              />
            )}
          </motion.div>

          {/* Dynamic Floating Particles */}
          <AnimatePresence>
            {activeParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0.5, 1, 0.8],
                  x: p.x,
                  y: p.y,
                  rotate: p.rotation
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="absolute z-10 flex flex-col items-center gap-1.5"
                style={{ originX: 0.5, originY: 0.5 }}
              >
                <div className="p-2.5 bg-white/80 backdrop-blur-md border border-[#3b2a8d]/15 rounded-xl text-[#3b2a8d] shadow-[0_8px_16px_rgba(59,42,141,0.06)]">
                  {p.icon}
                </div>
                <div className="px-2 py-0.5 bg-white/90 border border-[#3b2a8d]/10 rounded-full">
                   <span className="text-[8px] font-black text-[#3b2a8d]/70 uppercase tracking-widest">{p.label}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>

        {/* 🎛️ HUD Telemetry & Progress */}
        <div className="w-full max-w-xl mt-2 space-y-3">
          
          {/* Active Log Panel */}
          <div className="flex flex-col items-center justify-center space-y-2 h-12">
          </div>

          {/* Premium Progress Bar */}
          <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-[0_8px_30px_rgba(59,42,141,0.04)] backdrop-blur-xl relative overflow-hidden group scale-95 origin-bottom">
            
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   {isDone ? 'Deployment Complete' : 'Network Integrity Check'}
                 </span>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-slate-800 tracking-tighter tabular-nums">{Math.floor(progress)}</span>
                 <span className="text-sm font-black text-[#3b2a8d]/50">%</span>
              </div>
            </div>
            
            <div className="h-2 w-full bg-slate-100/80 rounded-full relative overflow-hidden ring-1 ring-inset ring-slate-200/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.5 }}
                className={`h-full rounded-full relative shadow-[0_0_15px_rgba(59,42,141,0.3)] ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#3b2a8d] to-[#7f64ea]'}`}
              >
                {/* Glowing edge highlight */}
                {!isDone && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/60 to-transparent blur-sm mix-blend-overlay animate-pulse" />}
              </motion.div>
            </div>
          </div>
          
        </div>

      </div>

      {analyzerError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 px-6 py-3 bg-red-50/90 backdrop-blur-md border border-red-200/50 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 z-50"
        >
           <Bug className="w-4 h-4" />
           Critical Fault: {analyzerError}
        </motion.div>
      )}

    </div>
  );
};
