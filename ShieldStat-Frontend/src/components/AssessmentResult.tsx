'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, BarChart, AlertTriangle } from 'lucide-react';

interface AssessmentResultProps {
  summary: {
    score: number;
    total_questions: number;
    max_possible_score: number;
    percentage: number;
    grade: string;
    risk_level: string;
    risk_color: string;
  };
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({ summary }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'B': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'C': return 'text-orange-500 bg-orange-50 border-orange-100';
      default: return 'text-red-500 bg-red-50 border-red-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Grade Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2"
      >
        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl font-black ${getGradeColor(summary.grade)}`}>
          {summary.grade}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maturity Grade</p>
          <p className="text-sm font-bold text-slate-900">{summary.grade === 'A' ? 'Exceptional' : summary.grade === 'B' ? 'Good' : 'Needs Improvement'}</p>
        </div>
      </motion.div>

      {/* Score Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
            <Target size={20} />
          </div>
          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
            {summary.percentage}%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Score</p>
          <h2 className="text-3xl font-black text-slate-900">{summary.score} <span className="text-sm text-slate-300">/ {summary.max_possible_score}</span></h2>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${summary.percentage}%` }}
            className="bg-blue-500 h-full"
          />
        </div>
      </motion.div>

      {/* Compliance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
            <ShieldCheck size={20} />
          </div>
          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
            Verified
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questions Attempted</p>
          <h2 className="text-3xl font-black text-slate-900">{summary.total_questions} <span className="text-sm text-slate-300">Total</span></h2>
        </div>
        <p className="text-[10px] font-medium text-slate-400">Comprehensive security posture survey completed.</p>
      </motion.div>

      {/* Risk Level Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">
            <AlertTriangle size={20} />
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-orange-50 text-orange-600`}>
             Attention Required
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Maturity</p>
          <h2 className="text-3xl font-black text-slate-900">{summary.risk_level}</h2>
        </div>
        <p className="text-[10px] font-medium text-slate-400">Organization-wide security maturity level.</p>
      </motion.div>
    </div>
  );
};
