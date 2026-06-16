'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, Fuel, Gauge, Users } from 'lucide-react';
import { Car } from '@/types';
import StatusBadge from './StatusBadge';

interface AdminCarShowcaseProps {
  cars: Car[];
}

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  rented: 'warning',
  maintenance: 'neutral',
  reserved: 'warning',
};

const statusLabel: Record<string, string> = {
  available: 'متاحة',
  rented: 'مؤجرة',
  maintenance: 'صيانة',
  reserved: 'محجوزة',
};

export default function AdminCarShowcase({ cars }: AdminCarShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const availableCars = cars.filter((car) => car.status === 'available');

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-extrabold text-cyan-200">Showcase</p>
        <h2 className="mt-1 text-2xl font-black text-white">السيارات الجاهزة للتسليم</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {availableCars.map((car, index) => (
          <motion.article
            key={car.id}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(34,211,238,0.16),transparent_35%)] opacity-0 transition group-hover:opacity-100" />
            <div className="relative h-48 bg-gradient-to-br from-slate-900 to-black">
              {car.image_url ? (
                <Image src={car.image_url} alt={car.car_name} fill sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🚘</div>
              )}
              <div className="absolute right-4 top-4">
                <StatusBadge label={statusLabel[car.status] || car.status} tone={statusTone[car.status] || 'neutral'} />
              </div>
            </div>
            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">{car.car_name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-400">{car.car_model || '-'} - {car.model_year || '-'}</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-left">
                  <p className="text-lg font-black text-cyan-100">{car.daily_rental_price.toLocaleString('en-US')}</p>
                  <p className="text-[11px] font-bold text-slate-400">جنيه / يوم</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-bold text-slate-300">
                <Spec icon={Gauge} value={car.transmission || '-'} />
                <Spec icon={Users} value={`${car.seats} مقاعد`} />
                <Spec icon={Fuel} value={car.fuel_type || '-'} />
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/cars/${car.id}/edit`} className="flex-1 rounded-full border border-white/10 px-4 py-2 text-center text-xs font-extrabold text-white transition hover:bg-white/10">
                  تعديل
                </Link>
                {car.status === 'available' && (
                  <Link href={`/rentals/new?carId=${car.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-cyan-300">
                    <CalendarPlus className="h-4 w-4" />
                    تأجير سريع
                  </Link>
                )}
              </div>
            </div>
          </motion.article>
        ))}
        {availableCars.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 text-center text-sm font-bold text-slate-400">
            لا توجد سيارات متاحة مطابقة حالياً.
          </div>
        )}
      </div>
    </section>
  );
}

function Spec({ icon: Icon, value }: { icon: typeof Gauge; value: string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
      <Icon className="h-4 w-4 text-cyan-200" />
      <span className="truncate">{value}</span>
    </div>
  );
}
