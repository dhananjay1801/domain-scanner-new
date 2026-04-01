'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Globe, ArrowRight, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getScanHistory } from '@/api/scanner';

export default function ScanHistoryPage() {
  const [previousScans, setPreviousScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScanHistory().then(data => {
      // Map data to the expected format
      const formatted = data.map(item => ({
        scanId: item.scan_id,
        domain: item.domain,
        date: item.time ? new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
        score: item.score || 0,
        status: item.status || 'Pending'
      }));
      setPreviousScans(formatted);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-full flex flex-col gap-8 p-8 bg-[#fcfcfc]">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Scan History</h1>
        <p className="text-sm text-slate-500 font-medium">Review and access detailed reports of previous security assessments.</p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500 font-bold">Loading history...</div>
      ) : previousScans.length === 0 ? (
        <div className="text-center p-8 text-slate-500 font-bold">No previous scans found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {previousScans.map((scan, i) => (
          <motion.div
            key={scan.scanId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link 
              href={scan.status === 'Pending' ? `/dashboard/active-scan?scan_id=${scan.scanId}&domain=${scan.domain}` : `/dashboard/report?scan_id=${scan.scanId}&domain=${scan.domain}`}
              className="group flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{scan.domain}</h3>
                  <p className="text-xs text-slate-400 font-medium">{scan.date} • Security Audit</p>
                </div>
              </div>

              <div className="flex items-center space-x-12">
                <div className="text-right">
                  <div className="flex items-center space-x-2 justify-end mb-1">
                    {scan.status === 'Pending' ? (
                      <Loader2 size={14} className="text-blue-500 animate-spin" />
                    ) : scan.status === 'Failed' ? (
                      <AlertTriangle size={14} className="text-red-500" />
                    ) : scan.status === 'Healthy' ? (
                      <ShieldCheck size={14} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={14} className="text-orange-500" />
                    )}
                    <span className="text-xs font-black text-slate-900">
                      {scan.status === 'Pending' ? 'In Progress' : scan.status === 'Failed' ? 'Failed' : scan.score}
                    </span>
                  </div>
                  {scan.status !== 'Pending' && scan.status !== 'Failed' && (
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${scan.score > 80 ? 'bg-green-500' : scan.score > 60 ? 'bg-orange-500' : 'bg-red-500'}`} 
                      style={{ width: `${scan.score}%` }}
                    />
                  </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
