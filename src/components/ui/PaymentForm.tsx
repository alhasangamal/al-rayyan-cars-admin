'use client';

import { useActionState, useMemo, useState } from 'react';
import { Loader2, WalletCards } from 'lucide-react';
import { createPaymentAction, PaymentFormState } from '@/app/payments/actions';
import { RentalListItem } from '@/types';

const initialState: PaymentFormState = {};

export default function PaymentForm({ rentals }: { rentals: RentalListItem[] }) {
  const [state, formAction, isPending] = useActionState(createPaymentAction, initialState);
  const [rentalId, setRentalId] = useState(rentals[0]?.id ? String(rentals[0].id) : '');
  const selectedRental = useMemo(() => rentals.find((rental) => String(rental.id) === rentalId), [rentalId, rentals]);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="rental_id" className="block text-sm font-bold text-slate-200">التأجير</label>
          <select id="rental_id" name="rental_id" value={rentalId} onChange={(event) => setRentalId(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50">
            <option value="">اختر التأجير</option>
            {rentals.map((rental) => (
              <option key={rental.id} value={rental.id}>
                {rental.rental_number} - {rental.customer_name} - متبقي {rental.remaining_amount.toLocaleString('en-US')} جنيه
              </option>
            ))}
          </select>
        </div>
        <Field name="amount" label="المبلغ" type="number" max={selectedRental?.remaining_amount} />
        <div className="space-y-2">
          <label htmlFor="payment_method" className="block text-sm font-bold text-slate-200">طريقة الدفع</label>
          <select id="payment_method" name="payment_method" className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50">
            <option value="cash">نقدي</option>
            <option value="card">بطاقة</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="wallet">محفظة</option>
          </select>
        </div>
      </div>

      {selectedRental && (
        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm font-bold text-cyan-100">
          المتبقي على التأجير: {selectedRental.remaining_amount.toLocaleString('en-US')} جنيه
        </div>
      )}

      <div className="mt-4 space-y-2">
        <label htmlFor="notes" className="block text-sm font-bold text-slate-200">ملاحظات</label>
        <textarea id="notes" name="notes" rows={2} className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50" />
      </div>

      {state.error && (
        <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">{state.error}</div>
      )}

      <button type="submit" disabled={isPending || rentals.length === 0} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <WalletCards className="h-5 w-5" />}
        تسجيل دفعة
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', max }: { name: string; label: string; type?: string; max?: number }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-200" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        min={type === 'number' ? 1 : undefined}
        max={max}
        required
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50"
      />
    </div>
  );
}
