'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShieldCheck, 
  Loader2,
  CheckCircle2,
  Shield,
  ArrowRight,
  ClipboardCheck,
  Zap,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getLatestAssessment, getAssessmentHistory } from '@/api/assessment';
import { AssessmentResult } from '@/components/AssessmentResult';
import { ScoreCircularGauge } from '@/components/charts/ScoreCircularGauge';
import { RiskRadarChart } from '@/components/charts/RiskRadarChart';
import { ScoreTrendChart } from '@/components/charts/ScoreTrendChart';



function AssessmentOverviewContent() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyData = await getAssessmentHistory(10);
        setHistory(historyData || []);
      } catch (err: any) {
        if (!err.message?.includes('Not Found')) {
          console.error('Failed to fetch assessment history:', err);
        }
        setHistory([]);
      }

      try {
        const latestData = await getLatestAssessment();
        if (latestData && latestData.summary) {
          setAssessment(latestData);
        }
      } catch (err: any) {
        if (!err.message?.includes('No assessment results found')) {
          console.error('Failed to fetch latest assessment:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);




  return (
    <div className="min-h-full flex flex-col gap-6 p-8 bg-[#fcfcfc]">
      
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Security Assessment</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Enterprise-wide security posture and maturity monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/">
              <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center space-x-2 rounded-xl active:scale-95 shadow-sm">
                <Search className="w-4 h-4" />
                <span>New Quick Scan</span>
              </button>
           </Link>
          {assessment && (
            <Link href="/dashboard/assessment/questionnaire">
              <button className="px-5 py-2.5 bg-[#3b2a8d] text-white text-xs font-black uppercase tracking-widest hover:bg-[#2d1f70] transition-all flex items-center space-x-2 rounded-xl shadow-lg shadow-[#3b2a8d]/20 active:scale-95">
                <Plus className="w-4 h-4" />
                <span>Retake Assessment</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Security Data...</p>
          </div>
        ) : assessment ? (
          <div className="space-y-8">
             
             {/* High-Level KPIs */}
             <AssessmentResult summary={assessment.summary} />

             {/* Top Analytics Row */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                
                {/* 1. Gauge Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden"
                >
                   {/* Background visual flair */}
                   <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />
                   
                   <div className="flex-1 flex items-center justify-center relative z-10 w-full">
                      <ScoreCircularGauge 
                        score={assessment.summary.percentage} 
                        grade={assessment.summary.grade} 
                        label="MATURITY SCORE"
                      />
                   </div>
                </motion.div>

                {/* 2. Radar Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Shield size={100} />
                   </div>
                   
                   <div className="text-center mb-2 relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Web</p>
                      <h3 className="text-lg font-black text-slate-900">Category Analysis</h3>
                   </div>
                   
                   <div className="flex-1 w-full relative z-10 min-h-0 flex items-center justify-center">
                      {assessment.summary.category_scores ? (
                        <RiskRadarChart data={Object.entries(assessment.summary.category_scores).map(([name, stats]: any) => ({
                          category: name.replace(' & ', ' / '),
                          value: stats.percentage
                        }))} />
                      ) : (
                        <RiskRadarChart data={[]} /> // Uses defaults
                      )}
                   </div>
                </motion.div>
             </div>

             {/* Secondary Analytics Row - Theme matches top components */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden w-full"
             >
                <div className="w-full min-h-[300px]">
                   <ScoreTrendChart history={[...history].reverse().map((entry) => ({
                     date: new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                     score: entry.summary.percentage,
                   }))} />
                </div>
             </motion.div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center py-20 px-8"
          >
            <div className="max-w-2xl w-full bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm text-center space-y-8 relative overflow-hidden group">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors duration-700" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-blue-600 mb-4 transition-transform group-hover:rotate-12 duration-500">
                  <ClipboardCheck size={40} />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Unlock Your Security Score</h2>
                  <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md mx-auto">
                    Evaluate your organization&apos;s digital safety through a comprehensive 40-question maturity assessment based on enterprise security benchmarks.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link href="/dashboard/assessment/questionnaire">
                    <button className="px-10 py-4 bg-[#3b2a8d] hover:bg-[#2a1d6a] text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-blue-900/10 flex items-center gap-3 active:scale-95 group/btn uppercase tracking-widest">
                      Start Assessment
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-50 opacity-50">
                   {[
                     { label: '40 Questions', sub: 'Guided review' },
                     { label: 'A-F Rating', sub: 'Maturity grade' },
                     { label: 'Risk Analysis', sub: 'Instant feedback' },
                   ].map((feature, i) => (
                     <div key={i} className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{feature.label}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{feature.sub}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}

export default function AssessmentOverview() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center p-8 text-slate-500 uppercase font-bold tracking-widest text-xs">Loading Dashboard...</div>}>
      <AssessmentOverviewContent />
    </Suspense>
  );
}
