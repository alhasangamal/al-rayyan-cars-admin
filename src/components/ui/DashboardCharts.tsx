'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MotionPanel from './MotionPanel';

interface DashboardChartsProps {
  monthlyData: { name: string; value: number }[];
  dailyData: { name: string; value: number }[];
}

export default function DashboardCharts({ monthlyData, dailyData }: DashboardChartsProps) {
  const [view, setView] = useState<'monthly' | 'daily'>('monthly');
  const data = view === 'monthly' ? monthlyData : dailyData;

  return (
    <MotionPanel className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">إحصائيات الإيجار</h2>
          <p className="mt-1 text-sm text-slate-400">نظرة عامة على أداء {view === 'monthly' ? 'الأشهر الأخيرة' : 'الأيام الأخيرة'}</p>
        </div>
        <div className="flex gap-2 rounded-xl bg-white/5 p-1">
          <button onClick={() => setView('monthly')} className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${view === 'monthly' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>شهري</button>
          <button onClick={() => setView('daily')} className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${view === 'daily' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>يومي</button>
        </div>
      </div>
      <div className="h-[300px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip 
              cursor={{ fill: '#ffffff0a' }}
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #22d3ee40', borderRadius: '16px' }}
              itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
            />
            <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </MotionPanel>
  );
}
