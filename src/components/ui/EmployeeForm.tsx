'use client';

import { useActionState } from 'react';
import { Loader2, Save, UserPlus } from 'lucide-react';
import { createEmployeeAction, updateEmployeeAction, EmployeeFormState } from '@/app/employees/actions';
import { Employee } from '@/types';

const initialState: EmployeeFormState = {};

export default function EmployeeForm({ employee, canManageRole = true }: { employee?: Employee; canManageRole?: boolean }) {
  const action = employee ? updateEmployeeAction.bind(null, employee.id) : createEmployeeAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isEdit = Boolean(employee);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field name="full_name" label="اسم الموظف" defaultValue={employee?.full_name} required />
        <Field name="username" label="اسم المستخدم" defaultValue={employee?.username} required />
        <Field name="password" label={isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'} type="password" required={!isEdit} />
        <Field name="phone" label="الهاتف" defaultValue={employee?.phone} />
        <Field name="email" label="البريد الإلكتروني" type="email" defaultValue={employee?.email} />
        {canManageRole && (
          <>
            <Select name="role" label="الصلاحية" defaultValue={employee?.role || 'employee'}>
              <option value="employee">موظف</option>
              <option value="admin">مدير</option>
            </Select>
            {isEdit && (
              <Select name="status" label="الحالة" defaultValue={employee?.status || 'active'}>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </Select>
            )}
          </>
        )}
      </div>

      {state.error && <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">{state.error}</div>}
      {state.success && <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">{state.success}</div>}

      <button type="submit" disabled={isPending} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
        {isEdit ? 'حفظ التعديلات' : 'إضافة موظف'}
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue || ''} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50" />
    </div>
  );
}

function Select({ name, label, defaultValue, children }: { name: string; label: string; defaultValue: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-bold text-slate-200">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50">
        {children}
      </select>
    </div>
  );
}
