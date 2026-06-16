'use client';

import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateOfficeSettingsAction, SettingsFormState } from '@/app/settings/actions';
import { OfficeSettings } from '@/types';

const initialState: SettingsFormState = {};

export default function SettingsForm({ settings }: { settings: OfficeSettings }) {
  const [state, formAction, isPending] = useActionState(updateOfficeSettingsAction, initialState);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <h2 className="text-xl font-extrabold text-white">بيانات المكتب</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="office_name" label="اسم المكتب" defaultValue={settings.office_name} required />
        <Field name="tagline" label="الشعار" defaultValue={settings.tagline} required />
        <Field name="phone" label="رقم الهاتف" defaultValue={settings.phone} />
        <Field name="whatsapp" label="واتساب" defaultValue={settings.whatsapp} />
        <Field name="email" label="البريد الإلكتروني" type="email" defaultValue={settings.email} />
        <Field name="logo_path" label="مسار اللوجو داخل public" defaultValue={settings.logo_path} required />
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="address" className="block text-sm font-bold text-slate-200">العنوان</label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={settings.address || ''}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
        />
      </div>

      {state.error && <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">{state.error}</div>}
      {state.success && <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">{state.success}</div>}

      <button type="submit" disabled={isPending} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        حفظ في قاعدة البيانات
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
