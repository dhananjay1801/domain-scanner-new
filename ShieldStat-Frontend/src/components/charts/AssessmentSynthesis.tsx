'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Globe, 
  Zap, 
  Activity, 
  Target, 
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface AssessmentSynthesisProps {
  onComplete: () => void;
}

type ScanStageType = 
  | 'intake' 
  | 'assets' 
  | 'network' 
  | 'data' 
  | 'governance' 
  | 'response' 
  | 'ai';

export const AssessmentSynthesis: React.FC<AssessmentSynthesisProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState<ScanStageType>('intake');
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showProceed, setShowProceed] = useState(false);

  const stages = [
    { id: 'intake', label: 'Processing Responses', icon: <Search size={18} />, description: 'Ingesting 40-point maturity questionnaire data' },
    { id: 'assets', label: 'Asset Management', icon: <Cpu size={18} />, description: 'Evaluating hardware, software, and access controls' },
    { id: 'network', label: 'Network Protection', icon: <Globe size={18} />, description: 'Scoring boundary defenses and architecture' },
    { id: 'data', label: 'Data Security', icon: <Lock size={18} />, description: 'Analyzing encryption and data loss prevention' },
    { id: 'governance', label: 'Governance Review', icon: <Shield size={18} />, description: 'Auditing policies, training, and compliance' },
    { id: 'response', label: 'Incident Response', icon: <Target size={18} />, description: 'Verifying detection and response capabilities' },
    { id: 'ai', label: 'AI Risk Synthesis', icon: <Zap size={18} />, description: 'Aggregating category scores into final risk grade' },
  ];

  useEffect(() => {
    let currentIdx = 0;
    const intervalTime = 700; // slightly longer interval for assessment synthesis

    const scrollInterval = setInterval(() => {
      if (currentIdx < stages.length - 1) {
        currentIdx++;
        setCurrentStage(stages[currentIdx].id as ScanStageType);
        setProgress(Math.floor((currentIdx / stages.length) * 100));
      } else {
        clearInterval(scrollInterval);
        setProgress(100);
        setIsDone(true);
        setTimeout(() => setShowProceed(true), 600);
      }
    }, intervalTime);

    return () => clearInterval(scrollInterval);
  }, []);

  const activeIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="p-8 md:p-12">
        {/* Progress Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-blue-600">
               <Loader2 className="w-5 h-5 animate-spin" />
               <span className="text-xs font-black uppercase tracking-[0.2em]">Live Synthesis</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Calculating <span className="text-blue-600">Security Posture</span>
            </h2>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{progress}%</span>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]"
              />
            </div>
          </div>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {stages.map((stage, index) => {
            const isActive = index === activeIndex && !isDone;
            const isCompleted = index < activeIndex || isDone;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all duration-500 ${
                  isActive ? 'bg-blue-50 border-blue-200 shadow-sm' :
                  isCompleted ? 'bg-slate-50 border-slate-100' :
                  'bg-transparent border-transparent opacity-40 grayscale'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-white text-blue-600 shadow-sm' :
                    isCompleted ? 'bg-white text-emerald-500 shadow-sm' :
                    'bg-white text-slate-300'
                  }`}>
                    {isCompleted ? <ShieldCheck size={20} /> : stage.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[11px] font-black uppercase tracking-tight truncate ${
                      isActive ? 'text-blue-900' : 
                      isCompleted ? 'text-slate-600' : 
                      'text-slate-400'
                    }`}>
                      {stage.label}
                    </h4>
                    <span className={`text-[9px] font-bold uppercase tracking-tight ${
                      isActive ? 'text-blue-600/60' :
                      isCompleted ? 'text-emerald-600/60' :
                      'text-slate-400/60'
                    }`}>
                      {isActive ? 'Analyzing' : isCompleted ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Action */}
        <AnimatePresence>
          {showProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <button 
                onClick={onComplete}
                className="group bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
