'use client';

import { useActionState, useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { cancelRentalAction, RentalFormState } from '@/app/rentals/actions';

const initialState: RentalFormState = {};

interface CancelRentalFormProps {
  rentalId: number;
  paidAmount: number;
  canCancelPaid: boolean;
}

export default function CancelRentalForm({ rentalId, paidAmount, canCancelPaid }: CancelRentalFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(cancelRentalAction, initialState);
  const blocked = paidAmount > 0 && !canCancelPaid;

  return (
    <div className="rounded-3xl border border-rose-300/15 bg-rose-400/[0.06] p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="font-extrabold text-rose-100">إلغاء التأجير</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            يتم حفظ سبب الإلغاء داخل سجل العمليات. التأجيرات التي عليها مدفوعات تحتاج صلاحية مدير.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          disabled={blocked}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/25 px-5 py-3 text-sm font-extrabold text-rose-100 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Ban className="h-4 w-4" />
          إلغاء التأجير
        </button>
      </div>

      {blocked && (
        <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-bold text-amber-100">
          لا يمكن للموظف إلغاء تأجير عليه مدفوعات. يجب تنفيذ الإلغاء بواسطة المدير.
        </p>
      )}

      {open && !blocked && (
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="rental_id" value={rentalId} />
          <textarea
            name="cancel_reason"
            required
            rows={3}
            placeholder="اكتب سبب الإلغاء..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-rose-300/50"
          />
          {state.error && <p className="text-sm font-bold text-rose-100">{state.error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-rose-400 px-5 text-sm font-extrabold text-white transition hover:bg-rose-300 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            تأكيد الإلغاء
          </button>
        </form>
      )}
    </div>
  );
}
