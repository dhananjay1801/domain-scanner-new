'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

const MOCK_ASSETS = [
  { id: '1', domain: 'vanguard.io', owner: 'jshepard@vanguard.io', lastScan: '10 mins ago', status: 'SECURE', score: 'A-', threats: 0 },
  { id: '2', domain: 'api.vanguard.io', owner: 'jshepard@vanguard.io', lastScan: '12 hrs ago', status: 'WARNING', score: 'C+', threats: 4 },
  { id: '3', domain: 'swarm.sec', owner: 'skerrigan@swarm.sec', lastScan: '1 day ago', status: 'CRITICAL', score: 'F', threats: 15 },
  { id: '4', domain: 'citadel.gov', owner: 'dander@citadel.gov', lastScan: '2 days ago', status: 'SECURE', score: 'B+', threats: 1 },
  { id: '5', domain: 'shadowbroker.io', owner: 'liara@shadowbroker.io', lastScan: '5 mins ago', status: 'SECURE', score: 'A', threats: 0 },
];

export default function AdminDomainsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState<string | null>(null);

  const filtered = MOCK_ASSETS.filter(a => 
    a.domain.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleForceScan = (id: string) => {
    setScanning(id);
    setTimeout(() => {
      setScanning(null);
    }, 2000); // mock scan duration
  };

  return (
    <div className="p-8 md:p-12 min-h-screen flex flex-col gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">SYS_ASSETS</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Global Infrastructure Monitor.</p>
        </div>

        {/* Global Search Interface */}
        <div className="relative w-full md:w-96 shadow-sm">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search asset or owner..." 
             className="w-full bg-white border border-slate-200 text-slate-900 font-medium text-sm rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#3b2a8d] focus:ring-4 focus:ring-[#3b2a8d]/10 transition-all placeholder:text-slate-400"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </motion.div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((asset, i) => (
          <motion.div 
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all relative overflow-hidden group hover:border-[#3b2a8d]/20 flex flex-col"
          >
            {/* Status indicator bar top */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${asset.status === 'CRITICAL' ? 'bg-red-500' : asset.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[#3b2a8d] transition-colors tracking-tight">{asset.domain}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{asset.owner}</p>
                 </div>
                 <div className={`text-4xl font-black ${asset.score.startsWith('A') || asset.score.startsWith('B') ? 'text-emerald-500' : asset.score.startsWith('C') ? 'text-amber-500' : 'text-red-500'} tracking-tighter`}>
                   {asset.score}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-100 flex-1">
                 <div>
                   <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">State</p>
                   <div className="flex items-center gap-2">
                     {asset.status === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                     <span className={`text-[11px] font-black uppercase tracking-widest ${asset.status === 'CRITICAL' ? 'text-red-500' : asset.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'}`}>{asset.status}</span>
                   </div>
                 </div>
                 <div>
                   <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Threats</p>
                   <p className={`text-sm font-black ${asset.threats > 0 ? 'text-red-500' : 'text-slate-900'}`}>{asset.threats}</p>
                 </div>
                 <div className="col-span-2 mt-2">
                   <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Last Scan</p>
                   <p className="text-[11px] font-medium text-slate-600">{asset.lastScan}</p>
                 </div>
              </div>

              <button 
                onClick={() => handleForceScan(asset.id)}
                disabled={scanning === asset.id}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${scanning === asset.id ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#3b2a8d] hover:text-[#3b2a8d] hover:bg-white active:scale-95'}`}
              >
                <RefreshCw className={`w-4 h-4 ${scanning === asset.id ? 'animate-spin' : ''}`} />
                {scanning === asset.id ? 'SCANNING...' : 'FORCE SCAN NOW'}
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 p-16 text-center text-slate-400 font-black text-sm tracking-widest uppercase bg-white border border-slate-100 rounded-[3rem]">
            NO ASSETS DETECTED MATCHING QUERY
          </div>
        )}
      </div>
    </div>
  );
}
