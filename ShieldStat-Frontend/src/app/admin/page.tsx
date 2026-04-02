'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, ShieldCheck, LineChart, Search, Filter, CalendarCheck } from 'lucide-react';

// Central Scan Volume Data
const SCAN_VOLUME_DATA = {
  today: { value: '4,102', change: '+14% vs yesterday' },
  month: { value: '89,441', change: '+2% vs last month' },
  year: { value: '1.2M', change: 'On track' },
};

// MOCK DATA for Users
const USER_KPIs = [
  { label: 'Total Users', value: '14,293', change: 'Platform Wide', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
  { label: 'Active Users', value: '3,842', change: 'Online past 24h', icon: LineChart, color: 'text-amber-600', bg: 'bg-amber-50' },
];

// MOCK DATA for Organizations & their Health Scores (Percentage)
const ORG_HEALTH_DATA = [
  { id: '1', name: 'Vanguard Dynamics', industry: 'Finance', score: 92, lastScan: '2 mins ago', daysAgo: 0 },
  { id: '2', name: 'Citadel Group', industry: 'Government', score: 84, lastScan: '1 hr ago', daysAgo: 0 },
  { id: '3', name: 'Swarm Security', industry: 'Tech', score: 72, lastScan: '14 hrs ago', daysAgo: 0 },
  { id: '4', name: 'Shadow Broker Corp', industry: 'Data Broker', score: 58, lastScan: '1 day ago', daysAgo: 1 },
  { id: '5', name: 'Aperture Science', industry: 'Research', score: 45, lastScan: '3 days ago', daysAgo: 3 },
  { id: '6', name: 'Black Mesa', industry: 'Research', score: 38, lastScan: '1 week ago', daysAgo: 7 },
  { id: '7', name: 'Weyland-Yutani', industry: 'Manufacturing', score: 12, lastScan: '14 days ago', daysAgo: 14 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<{ min: number, max: number }>({ min: 0, max: 100 });
  const [dateFilter, setDateFilter] = useState<number>(30); // days
  const [timeFrame, setTimeFrame] = useState<'today' | 'month' | 'year'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const globalAverageScore = Math.round(ORG_HEALTH_DATA.reduce((acc, curr) => acc + curr.score, 0) / ORG_HEALTH_DATA.length);

  const filteredOrgs = useMemo(() => {
    return ORG_HEALTH_DATA.filter(org => {
      const matchScore = org.score >= scoreFilter.min && org.score <= scoreFilter.max;
      const matchDate = org.daysAgo <= dateFilter;
      const matchSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.industry.toLowerCase().includes(searchQuery.toLowerCase());
      return matchScore && matchDate && matchSearch;
    });
  }, [scoreFilter, dateFilter, searchQuery]);

  if (!mounted) return null;

  return (
    <div className="p-8 md:p-12 min-h-screen flex flex-col gap-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">BUSINESS TELEMETRY</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Platform usage analytics and global security posture health.</p>
        </div>
      </motion.div>

      {/* Row 1: High Level SaaS Usage & Adoption KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dynamic Scan Volume Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-[#3b2a8d]/20 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-tight">Total<br/>Scans</p>
            </div>
            
            {/* Time Frame Selector */}
            <div className="bg-slate-50 p-1 rounded-xl flex items-center border border-slate-100">
              {(['today', 'month', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFrame(t)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                    timeFrame === t ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative h-[80px]">
             <AnimatePresence mode="wait">
               <motion.div
                 key={timeFrame}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="absolute inset-0 flex flex-col justify-end"
               >
                 <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight tabular-nums">
                   {SCAN_VOLUME_DATA[timeFrame].value}
                 </span>
                 <p className="text-xs font-bold text-slate-500 mt-1">{SCAN_VOLUME_DATA[timeFrame].change}</p>
               </motion.div>
             </AnimatePresence>
          </div>
        </motion.div>

        {/* User Analytics Cards */}
        {USER_KPIs.map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i + 1) * 0.05 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-[#3b2a8d]/20 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-tight">{kpi.label.replace(' ', '\n')}</p>
              </div>
            </div>
            
            <div className="h-[80px] flex flex-col justify-end">
              <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{kpi.value}</span>
              <p className="text-xs font-bold text-slate-500 mt-1">{kpi.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Security Health Filtering & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Global Average & Component Controls */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          {/* Average Score Card */}
          <div className="bg-[#3b2a8d] rounded-[2.5rem] p-8 shadow-xl shadow-[#3b2a8d]/20 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <ShieldCheck className="w-8 h-8 text-white/50 mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Global Avg Health Score</p>
            <div className="flex items-baseline gap-2 mb-4">
               <span className="text-7xl font-black text-white">{globalAverageScore}</span>
               <span className="text-3xl font-bold text-white/50">%</span>
            </div>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Overall computational mean calculated from active scans within the selected parameters.
            </p>
          </div>

          {/* Filter Controls Panel */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex-1">
             <div className="flex items-center gap-2 mb-8">
               <Filter className="w-5 h-5 text-slate-400" />
               <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">Analysis Filters</h2>
             </div>

             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Timeframe (Date)</p>
             <div className="relative mb-6">
               <CalendarCheck className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
               <select 
                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3b2a8d] focus:ring-2 focus:ring-[#3b2a8d]/10 transition-all appearance-none cursor-pointer"
                 value={dateFilter}
                 onChange={(e) => setDateFilter(Number(e.target.value))}
               >
                  <option value={999}>All Time</option>
                  <option value={1}>Last 24 Hours</option>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
               </select>
               {/* Custom dropdown arrow */}
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </div>
             </div>

             <div className="h-px w-full bg-slate-100 mb-6" />

             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Score Brackets</p>
             <div className="space-y-3">
               {[
                 { label: 'Secure (80-100%)', range: { min: 80, max: 100 }, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
                 { label: 'Moderate (50-79%)', range: { min: 50, max: 79 }, color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300' },
                 { label: 'Critical (0-49%)', range: { min: 0, max: 49 }, color: 'bg-red-50 text-red-600 border-red-100 hover:border-red-300' },
                 { label: 'Show All (0-100%)', range: { min: 0, max: 100 }, color: 'bg-slate-50 text-slate-600 border-slate-100 hover:border-[#3b2a8d]' }
               ].map((btn) => {
                 const count = ORG_HEALTH_DATA.filter(o => o.score >= btn.range.min && o.score <= btn.range.max && o.daysAgo <= dateFilter).length;
                 return (
                   <button
                     key={btn.label}
                     onClick={() => setScoreFilter(btn.range)}
                     className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex justify-between items-center ${btn.color} ${scoreFilter.min === btn.range.min && scoreFilter.max === btn.range.max ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70 hover:opacity-100'}`}
                   >
                     <span className="text-xs font-bold tracking-tight">{btn.label}</span>
                     <span className="text-[10px] font-black tracking-widest">{count} Orgs</span>
                   </button>
                 );
               })}
             </div>
          </div>
        </motion.div>

        {/* Right Column: Filtered Organization Table */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">Filtered Organizations</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Showing scores between {scoreFilter.min}% and {scoreFilter.max}% • {dateFilter === 999 ? 'All Time' : `Last ${dateFilter} Days`}
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search org or industry..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#3b2a8d] transition-colors shadow-sm" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[400px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                  <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry</th>
                  <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Scan (Date)</th>
                  <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-5 px-8">
                      <p className="text-sm font-bold text-slate-900">{org.name}</p>
                    </td>
                    <td className="py-5 px-8">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">{org.industry}</span>
                    </td>
                    <td className="py-5 px-8">
                      <span className="text-xs font-bold text-slate-600">{org.lastScan}</span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Miniature progress bar */}
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full transition-all duration-1000 ${org.score >= 80 ? 'bg-emerald-500' : org.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${org.score}%` }} />
                        </div>
                        <span className={`text-sm font-black w-10 text-right ${org.score >= 80 ? 'text-emerald-600' : org.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {org.score}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                       <Search className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                         No organizations found matching current filters.
                       </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
