'use client';

import { useActionState, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, CarFront, Loader2, Save, UserRound, WalletCards } from 'lucide-react';
import { createRentalAction, RentalFormState } from '@/app/rentals/actions';
import { Car, Customer } from '@/types';

interface RentalFormProps {
  customers: Customer[];
  cars: Car[];
  initialCustomerId?: string;
  initialCarId?: string;
}

const initialState: RentalFormState = {};

export default function RentalForm({ customers, cars, initialCustomerId = '', initialCarId }: RentalFormProps) {
  const [state, formAction, isPending] = useActionState(createRentalAction, initialState);
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [carId, setCarId] = useState(initialCarId || (cars[0]?.id ? String(cars[0].id) : ''));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');

  const selectedCar = cars.find((car) => String(car.id) === carId);
  const selectedCustomer = customers.find((customer) => String(customer.id) === customerId);
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    return Math.max(diff, 1);
  }, [endDate, startDate]);
  const totalCost = (selectedCar?.daily_rental_price || 0) * totalDays;
  const remainingAmount = Math.max(totalCost - Number(paidAmount || 0), 0);

  return (
    <form action={formAction} className="max-w-6xl space-y-6">
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="car_id" value={carId} />
      <input type="hidden" name="start_date" value={startDate} />
      <input type="hidden" name="end_date" value={endDate} />
      <input type="hidden" name="paid_amount" value={paidAmount} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Step icon={UserRound} label="اختيار العميل" active={step === 0} completed={Boolean(customerId)} onClick={() => setStep(0)} />
        <Step icon={CarFront} label="اختيار السيارة" active={step === 1} completed={Boolean(carId)} onClick={() => setStep(1)} />
        <Step icon={CalendarDays} label="المدة والتكلفة" active={step === 2} completed={Boolean(startDate && endDate)} onClick={() => setStep(2)} />
        <Step icon={WalletCards} label="الدفع والفاتورة" active={step === 3} completed={Boolean(startDate && endDate)} onClick={() => setStep(3)} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      {step === 0 && (
        <div className="space-y-4">
        <Select name="customer_id_display" label="العميل" required value={customerId} onChange={setCustomerId}>
          <option value="">اختر العميل</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.full_name} - {customer.phone}</option>
          ))}
        </Select>
        <WizardActions canNext={Boolean(customerId)} onNext={() => setStep(1)} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <label htmlFor="car_id" className="block text-sm font-bold text-slate-200">السيارة المتاحة</label>
          <select
            id="car_id"
            name="car_id_display"
            value={carId}
            onChange={(event) => setCarId(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
          >
            <option value="">اختر السيارة</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>{car.car_name} {car.car_model || ''} - {car.daily_rental_price} جنيه/يوم</option>
            ))}
          </select>
          <div className="pt-4">
            <WizardActions canNext={Boolean(carId)} onPrev={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="start_date" label="تاريخ البداية" type="date" value={startDate} onChange={setStartDate} required />
        <Field name="end_date" label="تاريخ النهاية" type="date" value={endDate} onChange={setEndDate} required />
        </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Summary label="عدد الأيام" value={String(totalDays)} />
        <Summary label="إجمالي التكلفة" value={`${totalCost.toLocaleString('en-US')} جنيه`} />
        <Summary label="المتبقي" value={`${remainingAmount.toLocaleString('en-US')} جنيه`} />
      </div>
      <WizardActions canNext={Boolean(startDate && endDate)} onPrev={() => setStep(1)} onNext={() => setStep(3)} />
      </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
        <Field name="paid_amount" label="المدفوع مقدمًا" type="number" value={paidAmount} onChange={setPaidAmount} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FileField name="before_photo" label="صورة السيارة قبل التسليم" />
          <FileField name="after_photo" label="صورة السيارة بعد الاستلام (اختياري)" />
        </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-200" htmlFor="notes">ملاحظات</label>
        <textarea id="notes" name="notes" rows={3} className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50" />
      </div>

      {state.error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">{state.error}</div>
      )}

      <button type="submit" disabled={isPending} className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        إنشاء التأجير والفاتورة
      </button>
      <button type="button" onClick={() => setStep(2)} className="mr-3 inline-flex h-12 items-center gap-2 rounded-full border border-white/10 px-7 text-sm font-extrabold text-white transition hover:bg-white/10">
        السابق
      </button>
      </div>
      )}
        </div>

        <motion.aside
          key={selectedCar?.id || 'empty'}
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="h-fit overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-xl"
        >
          <div className="relative h-52 bg-gradient-to-br from-slate-900 to-black">
            {selectedCar?.image_url ? (
              <Image src={selectedCar.image_url} alt={selectedCar.car_name} fill sizes="360px" className="object-contain p-5" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🚘</div>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-extrabold text-cyan-200">ملخص التأجير</p>
            <h3 className="mt-2 text-xl font-black text-white">{selectedCar ? `${selectedCar.car_name} ${selectedCar.car_model || ''}` : 'اختر سيارة'}</h3>
            <p className="mt-2 text-sm font-bold text-slate-400">{selectedCustomer ? `${selectedCustomer.full_name} - ${selectedCustomer.phone}` : 'اختر العميل'}</p>
            <div className="mt-5 space-y-3">
              <Summary label="عدد الأيام" value={String(totalDays)} />
              <Summary label="إجمالي التكلفة" value={`${totalCost.toLocaleString('en-US')} جنيه`} />
              <Summary label="المتبقي" value={`${remainingAmount.toLocaleString('en-US')} جنيه`} />
            </div>
          </div>
        </motion.aside>
      </div>
    </form>
  );
}

function Step({ icon: Icon, label, active, completed, onClick }: { icon: typeof UserRound; label: string; active?: boolean; completed?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${active ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100' : completed ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-white/10 bg-white/[0.035] text-slate-500'}`}>
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function Select({ name, label, children, required, value, onChange }: { name: string; label: string; children: React.ReactNode; required?: boolean; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-bold text-slate-200">{label}</label>
      <select id={name} name={name} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50">
        {children}
      </select>
    </div>
  );
}

function Field({ name, label, type, value, onChange, required = false }: { name: string; label: string; type: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={type === 'number' ? 0 : undefined}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-cyan-100">{value}</p>
    </div>
  );
}

function WizardActions({ canNext, onNext, onPrev }: { canNext: boolean; onNext: () => void; onPrev?: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {onPrev && (
        <button type="button" onClick={onPrev} className="rounded-full border border-white/10 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10">
          السابق
        </button>
      )}
      <button type="button" disabled={!canNext} onClick={onNext} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
        التالي
      </button>
    </div>
  );
}

function FileField({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input id={name} name={name} type="file" accept="image/*" className="block w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-300 file:ml-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-slate-950" />
    </div>
  );
}
