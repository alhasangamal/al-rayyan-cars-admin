'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { createCustomerAction, updateCustomerAction, CustomerFormState } from '@/app/customers/actions';
import { Customer } from '@/types';

const initialState: CustomerFormState = {};

export default function CustomerForm({ customer }: { customer?: Customer }) {
  const action = customer ? updateCustomerAction.bind(null, customer.id) : createCustomerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-4xl space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="full_name" label="اسم العميل" defaultValue={customer?.full_name} required />
        <Field name="phone" label="رقم الهاتف" defaultValue={customer?.phone} required />
        <Field name="alternate_phone" label="رقم إضافي" defaultValue={customer?.alternate_phone} />
        <Field name="email" label="البريد الإلكتروني" type="email" defaultValue={customer?.email} />
        <Field name="national_id" label="رقم البطاقة" defaultValue={customer?.national_id} />
        <Field name="driver_license_number" label="رقم رخصة القيادة" defaultValue={customer?.driver_license_number} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-200" htmlFor="address">العنوان</label>
        <textarea id="address" name="address" rows={3} defaultValue={customer?.address || ''} className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FileField name="id_image" label="صورة البطاقة" />
        <FileField name="license_image" label="صورة الرخصة" />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-200" htmlFor="notes">ملاحظات</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={customer?.notes || ''} className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50" />
      </div>

      {customer && (
        <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-200">
          <input name="is_active" type="checkbox" defaultChecked={customer.is_active} className="h-4 w-4 accent-cyan-300" />
          العميل نشط
        </label>
      )}

      {state.error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">{state.error}</div>
      )}

      <button type="submit" disabled={isPending} className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        حفظ العميل
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue || ''}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
      />
    </div>
  );
}

function FileField({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*,application/pdf"
        className="block w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-300 file:ml-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-slate-950"
      />
    </div>
  );
}
