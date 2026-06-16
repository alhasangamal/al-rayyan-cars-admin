'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, Plus } from 'lucide-react';
import { Car } from '@/types';
import AdminCarShowcase from './AdminCarShowcase';
import MotionPanel from './MotionPanel';
import SearchInput from './SearchInput';
import StatusBadge from './StatusBadge';

interface CarsWorkspaceProps {
  cars: Car[];
}

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  rented: 'warning',
  maintenance: 'neutral',
  reserved: 'warning',
  inactive: 'danger',
};

const statusLabel: Record<string, string> = {
  available: 'متاحة',
  rented: 'مؤجرة',
  maintenance: 'صيانة',
  reserved: 'محجوزة',
  inactive: 'غير نشطة',
};

export default function CarsWorkspace({ cars }: CarsWorkspaceProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredCars = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cars.filter((car) => {
      if (statusFilter !== 'all' && car.status !== statusFilter) return false;
      if (!normalized) return true;
      return [
      car.car_name,
      car.car_model,
      car.plate_number,
      car.color,
      car.body_type,
      car.status,
    ].filter(Boolean).join(' ').toLowerCase().includes(normalized);
    });
  }, [cars, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchInput placeholder="بحث باسم السيارة، اللوحة، اللون، الحالة..." value={query} onChange={setQuery} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-cyan-100">
            المعروض: {filteredCars.length} / {cars.length}
          </div>
          <Link href="/cars/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
            <Plus className="h-4 w-4" />
            إضافة سيارة
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ['all', 'كل السيارات'],
          ['available', 'متاحة'],
          ['rented', 'مؤجرة'],
          ['maintenance', 'صيانة'],
          ['reserved', 'محجوزة'],
          ['inactive', 'غير نشطة'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition ${
              statusFilter === value ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AdminCarShowcase cars={filteredCars} />

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredCars.map((car) => (
          <div key={car.id} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{car.car_name}</p>
                <p className="mt-1 text-sm text-slate-400">{car.car_model || '-'} - {car.plate_number || '-'}</p>
              </div>
              <StatusBadge label={statusLabel[car.status] || car.status} tone={statusTone[car.status] || 'neutral'} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Mini label="السنة" value={String(car.model_year || '-')} />
              <Mini label="السعر" value={`${car.daily_rental_price.toLocaleString('en-US')} جنيه`} />
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/cars/${car.id}/edit`} className="flex-1 rounded-full border border-white/10 px-4 py-2 text-center text-xs font-extrabold text-white">
                تعديل
              </Link>
              {car.status === 'available' && (
                <Link href={`/rentals/new?carId=${car.id}`} className="flex-1 rounded-full bg-cyan-400 px-4 py-2 text-center text-xs font-extrabold text-slate-950">
                  تأجير
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <MotionPanel className="hidden overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-4 font-extrabold">السيارة</th>
                <th className="px-5 py-4 font-extrabold">الموديل</th>
                <th className="px-5 py-4 font-extrabold">السنة</th>
                <th className="px-5 py-4 font-extrabold">اللوحة</th>
                <th className="px-5 py-4 font-extrabold">النوع</th>
                <th className="px-5 py-4 font-extrabold">الناقل</th>
                <th className="px-5 py-4 font-extrabold">المقاعد</th>
                <th className="px-5 py-4 font-extrabold">اليومي</th>
                <th className="px-5 py-4 font-extrabold">الحالة</th>
                <th className="px-5 py-4 font-extrabold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCars.map((car) => (
                <tr key={car.id} className="transition hover:bg-white/[0.035]">
                  <td className="px-5 py-4 font-extrabold text-white">{car.car_name}</td>
                  <td className="px-5 py-4 text-slate-300">{car.car_model || '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{car.model_year || '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{car.plate_number || '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{car.body_type || '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{car.transmission || '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{car.seats}</td>
                  <td className="px-5 py-4 font-bold text-cyan-100">{car.daily_rental_price.toLocaleString('en-US')} جنيه</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={statusLabel[car.status] || car.status} tone={statusTone[car.status] || 'neutral'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/cars/${car.id}/edit`} className="rounded-full border border-white/10 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-white/10">
                        تعديل
                      </Link>
                      {car.status === 'available' ? (
                        <Link href={`/rentals/new?carId=${car.id}`} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 px-4 py-2 text-xs font-extrabold text-cyan-100 transition hover:bg-cyan-300/10">
                          <CalendarPlus className="h-4 w-4" />
                          تأجير
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">غير متاحة للتأجير</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-500">لا توجد سيارات مطابقة للبحث.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MotionPanel>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold text-cyan-100">{value}</p>
    </div>
  );
}
