'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [toggles, setToggles] = useState({
    autoSuspend: true,
    globalScans: true,
    debugMode: false,
    newSignups: false
  });
  
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 md:p-12 min-h-screen max-w-5xl flex flex-col gap-6">
       <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">SYS_CONFIG</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Modify core registry variables. Warning: System-wide impact.</p>
        </div>
      </motion.div>

      <div className="space-y-8">
        
        {/* Toggle Configs Group */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-slate-100 bg-white rounded-[2.5rem] p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-slate-900 font-black tracking-tight text-lg uppercase">Global Variables</h2>
          </div>

          <div className="space-y-2">
            <ToggleRow 
              label="ALLOW_PUBLIC_REGISTRATION" 
              description="Enable or disable new organizational signups across the master platform."
              enabled={toggles.newSignups}
              onClick={() => handleToggle('newSignups')}
              danger
            />
            <ToggleRow 
              label="AUTO_SUSPEND_CRITICAL" 
              description="Automatically suspend API tokens for assets exceeding threat threshold CVSS 9.0+."
              enabled={toggles.autoSuspend}
              onClick={() => handleToggle('autoSuspend')}
            />
            <ToggleRow 
              label="SYSTEM_WIDE_SCANS" 
              description="Master toggle for the global scanning engine. If disabled, all background jobs halt."
              enabled={toggles.globalScans}
              onClick={() => handleToggle('globalScans')}
              danger
            />
            <ToggleRow 
              label="DEBUG_VERBOSITY_MODE" 
              description="Inject granular trace logs into standard output. High performance cost."
              enabled={toggles.debugMode}
              onClick={() => handleToggle('debugMode')}
            />
          </div>
        </motion.div>

        {/* Database Configs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-slate-100 bg-white rounded-[2.5rem] p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-slate-900 font-black tracking-tight text-lg uppercase">Vector Constraints</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <label className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Max Scan Threads</label>
               <input type="number" defaultValue={64} className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-2xl py-4 px-5 focus:outline-none focus:border-[#3b2a8d] focus:ring-4 focus:ring-[#3b2a8d]/10 transition-all" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] text-slate-500 font-black tracking-widest uppercase">History Retention (Days)</label>
               <input type="number" defaultValue={90} className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-2xl py-4 px-5 focus:outline-none focus:border-[#3b2a8d] focus:ring-4 focus:ring-[#3b2a8d]/10 transition-all" />
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between py-4"
        >
          <p className={`text-[10px] font-black tracking-widest uppercase transition-all ${saved ? 'opacity-100 text-emerald-600 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            VARIABLES COMMITTED TO REGISTRY
          </p>
          <button 
            onClick={handleSave}
            className="flex items-center gap-3 px-8 py-4 bg-[#3b2a8d] hover:bg-[#2d1f70] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#3b2a8d]/20 active:scale-95 group"
          >
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Commit Changes
          </button>
        </motion.div>

      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onClick, danger = false }: { label: string, description: string, enabled: boolean, onClick: () => void, danger?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={onClick}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-bold tracking-tight ${danger ? 'text-red-500' : 'text-slate-900'}`}>{label}</span>
          {danger && <AlertTriangle className="w-3 h-3 text-red-500" />}
        </div>
        <p className="text-slate-500 text-xs font-medium">{description}</p>
      </div>
      
      <div 
        className={`relative w-[60px] h-8 flex-shrink-0 rounded-full transition-colors duration-300 ease-in-out border-2 ${enabled ? (danger ? 'bg-red-500 border-red-500' : 'bg-emerald-500 border-emerald-500') : 'bg-slate-200 border-slate-200'}`}
      >
        <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out ${enabled ? 'left-[30px]' : 'left-0.5'}`} />
      </div>
    </div>
  );
}
