'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertCircle,
  ChevronRight,
  Globe,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMemberIssues, type IssueAssignment } from '@/api/assignment';

const factorIcons: Record<string, React.ReactNode> = {
  'Network Security': <Globe size={14} />,
  'Application Security': <Shield size={14} />,
  'DNS Health': <Zap size={14} />,
  'TLS Security': <Lock size={14} />,
  'IP Reputation': <Search size={14} />,
};

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: React.ReactNode }> = {
  open: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Open', icon: <AlertCircle className="w-3 h-3" /> },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'In Progress', icon: <Clock className="w-3 h-3" /> },
  resolved: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Resolved', icon: <CheckCircle2 className="w-3 h-3" /> },
};

export default function MyIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<IssueAssignment[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      setIssues(getMemberIssues(user.id));
    }
  }, [user]);

  const filteredIssues = filter === 'all' ? issues : issues.filter((i) => i.status === filter);
  const counts = {
    all: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  };

  if (!user) return null;

  return (
    <div className="min-h-full flex flex-col gap-6 p-8 bg-[#f8fbff]">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">My Assigned Issues</h1>
        <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Issues assigned to you by the team owner</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(counts).map(([key, count]) => {
          const config = key === 'all'
            ? { bg: 'bg-slate-900', text: 'text-white', label: 'Total' }
            : { bg: statusConfig[key].bg, text: statusConfig[key].text, label: statusConfig[key].label };
          return (
            <div key={key} className={`${config.bg} rounded-xl p-5 border ${key === 'all' ? 'border-slate-800' : 'border-transparent'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${key === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>{config.label}</p>
              <p className={`text-3xl font-black mt-1 ${config.text}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
        {['all', 'open', 'in_progress', 'resolved'].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap ${
              filter === key
                ? 'bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-900/10'
                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="text-[13px] font-black capitalize">{key === 'all' ? 'All' : key.replace('_', ' ')}</span>
            <span className={`text-[10px] font-bold ${filter === key ? 'text-white/70' : 'text-slate-500'}`}>({counts[key as keyof typeof counts]})</span>
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const status = statusConfig[issue.status];
            return (
              <motion.div
                key={issue.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-[24px] border border-slate-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${status.bg} ${status.text} border ${status.border}`}>
                        {status.icon} {status.label}
                      </span>
                      <h5 className="text-sm font-black text-slate-900 tracking-tight uppercase">{issue.issueTitle}</h5>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Scan: {issue.scanId.slice(0, 8)}...
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Assigned {issue.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black">
                      {issue.assignedToName[0].toUpperCase()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h5 className="text-lg font-black text-slate-900 uppercase">All Clear</h5>
              <p className="text-sm text-slate-400 font-medium">No issues assigned to you{filter !== 'all' ? ` with status "${filter.replace('_', ' ')}"` : ''}.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
