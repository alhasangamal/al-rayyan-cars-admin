'use client';

import { Car, Gauge, LucideIcon, TrendingUp, WalletCards } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  label: string;
  value: string;
  numericValue?: number;
  suffix?: string;
  icon?: 'car' | 'gauge' | 'trending' | 'wallet';
  tone?: 'cyan' | 'emerald' | 'amber' | 'blue';
}

const tones = {
  cyan: 'from-cyan-300/18 to-cyan-300/5 text-cyan-100 shadow-cyan-950/20',
  emerald: 'from-emerald-300/16 to-emerald-300/5 text-emerald-100 shadow-emerald-950/20',
  amber: 'from-amber-300/16 to-amber-300/5 text-amber-100 shadow-amber-950/20',
  blue: 'from-blue-300/16 to-blue-300/5 text-blue-100 shadow-blue-950/20',
};

const icons: Record<NonNullable<StatCardProps['icon']>, LucideIcon> = {
  car: Car,
  gauge: Gauge,
  trending: TrendingUp,
  wallet: WalletCards,
};

export default function StatCard({ label, value, numericValue, suffix = '', icon: Icon, tone = 'cyan' }: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const IconComponent = Icon ? icons[Icon] : null;

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${tones[tone]} p-5 shadow-xl backdrop-blur-xl`}
    >
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-extrabold">
            {typeof numericValue === 'number' ? <AnimatedCounter value={numericValue} suffix={suffix} /> : value}
          </p>
        </div>
        {IconComponent && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
