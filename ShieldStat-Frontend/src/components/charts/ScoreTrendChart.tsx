'use client'

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface ScoreTrendChartProps {
  history?: { date: string; score: number }[];
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ history }) => {
  const [days, setDays] = useState(30);

  // Default data for the trend if none provided
  const defaultData = [
    { date: 'Mar 14', score: 10 },
    { date: 'Mar 15', score: 15 },
    { date: 'Mar 16', score: 35 },
    { date: 'Mar 17', score: 25 },
    { date: 'Mar 18', score: 45 },
    { date: 'Mar 19', score: 5 },
  ];

  const chartData = history && history.length > 0 ? history : defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-slate-900">Risk Score: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-none">Score Trend</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Risk score over time</p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                days === d ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
