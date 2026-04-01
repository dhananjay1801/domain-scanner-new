'use client'

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreCircularGaugeProps {
  score: number; // 0-100
  grade: string; // A, B, C, D, F
  label?: string;
}

export const ScoreCircularGauge: React.FC<ScoreCircularGaugeProps> = ({ score, grade, label = "AVERAGE PORTFOLIO SCORE" }) => {
  // Map score to 0-100 for the gauge
  const data = [
    { value: score },
    { value: 100 - score }
  ];

  const getGradeColor = (g: string) => {
    switch (g) {
      case 'A': return '#10b981'; // emerald-500
      case 'B': return '#3b82f6'; // blue-500
      case 'C': return '#f59e0b'; // amber-500
      case 'D': return '#ef4444'; // red-500
      default: return '#991b1b'; // red-800
    }
  };

  const gradeColor = getGradeColor(grade);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
        {label}
      </p>
      
      <div className="relative w-full aspect-square max-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="75%"
              outerRadius="95%"
              startAngle={225}
              endAngle={-45}
              dataKey="value"
              stroke="none"
              paddingAngle={0}
            >
              <Cell fill={gradeColor} />
              <Cell fill="#f1f5f9" /> {/* slate-100 */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Central Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
          <span className="text-5xl font-black text-slate-900 leading-none">{grade}</span>
          <span className="text-sm font-bold text-slate-400 mt-1">{score}</span>
        </div>
      </div>
      
      <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-wider">
        Across monitored domains
      </p>
    </div>
  );
};
