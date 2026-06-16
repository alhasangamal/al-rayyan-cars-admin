'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { createCarAction, updateCarAction, CarFormState } from '@/app/cars/actions';
import { Car } from '@/types';

interface CarFormProps {
  car?: Car;
}

const initialState: CarFormState = {};

export default function CarForm({ car }: CarFormProps) {
  const action = car ? updateCarAction.bind(null, car.id) : createCarAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-5xl space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="car_name" label="اسم السيارة" defaultValue={car?.car_name} required />
        <Field name="car_model" label="الموديل" defaultValue={car?.car_model} />
        <Field name="model_year" label="سنة الموديل" type="number" defaultValue={car?.model_year} />
        <Field name="color" label="اللون" defaultValue={car?.color} />
        <Field name="plate_number" label="رقم اللوحة" defaultValue={car?.plate_number} required />
        <Field name="body_type" label="نوع السيارة" defaultValue={car?.body_type} />
        <Field name="fuel_type" label="نوع الوقود" defaultValue={car?.fuel_type} />
        <Field name="transmission" label="ناقل الحركة" defaultValue={car?.transmission || 'Automatic'} />
        <Field name="current_km" label="عداد الكيلومترات" type="number" defaultValue={car?.current_km} />
        <Field name="seats" label="عدد المقاعد" type="number" defaultValue={car?.seats || 5} />
        <Field name="daily_rental_price" label="السعر اليومي" type="number" defaultValue={car?.daily_rental_price} required />
        <Field name="weekly_rental_price" label="السعر الأسبوعي" type="number" defaultValue={car?.weekly_rental_price} />
        <Field name="monthly_rental_price" label="السعر الشهري" type="number" defaultValue={car?.monthly_rental_price} />
        <Field name="image_url" label="مسار صورة السيارة" defaultValue={car?.image_url} />
        <Select name="status" label="حالة السيارة" defaultValue={car?.status || 'available'}>
          <option value="available">متاحة</option>
          <option value="rented">مؤجرة</option>
          <option value="maintenance">صيانة</option>
          <option value="reserved">محجوزة</option>
          <option value="inactive">غير نشطة</option>
        </Select>
        {car && <Field name="status_change_reason" label="سبب تغيير الحالة" defaultValue="" />}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-200" htmlFor="notes">ملاحظات</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={car?.notes || ''} className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50" />
      </div>

      {state.error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">{state.error}</div>
      )}

      <button type="submit" disabled={isPending} className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        حفظ السيارة
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue?: string | number | null; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ''}
        min={type === 'number' ? 0 : undefined}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
      />
    </div>
  );
}

function Select({ name, label, defaultValue, children }: { name: string; label: string; defaultValue?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50">
        {children}
      </select>
    </div>
  );
}
