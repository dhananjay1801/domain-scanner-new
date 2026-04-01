'use client'

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RiskRadarChartProps {
  data: { category: string; value: number }[];
}

export const RiskRadarChart: React.FC<RiskRadarChartProps> = ({ data }) => {
  // Use data from props or falling back to default categories from the image
  const chartData = data && data.length > 0 ? data : [
    { category: 'Network Security', value: 80 },
    { category: 'Application Security', value: 60 },
    { category: 'DNS Health', value: 90 },
    // { category: 'Patching Cadence', value: 70 },
    { category: 'Endpoint Security', value: 50 },
    { category: 'IP Reputation', value: 85 },
    // { category: 'Cubit Score', value: 75 },
    // { category: 'Hacker Chatter', value: 40 },
    // { category: 'Information Leak', value: 65 },
    // { category: 'Social Engineering', value: 55 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Risk Level"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.1}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
