'use client';

import { useActionState } from 'react';
import { MessageSquare, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sendWhatsAppReminderAction } from '@/app/rentals/actions';

interface SendReminderButtonProps {
  rentalId: number;
  isOverdue: boolean;
}

const initialState = {};

export default function SendReminderButton({ rentalId, isOverdue }: SendReminderButtonProps) {
  const [state, formAction, isPending] = useActionState(sendWhatsAppReminderAction, initialState);

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="rental_id" value={rentalId} />
      <div className="flex flex-col gap-1">
        <button
          type="submit"
          disabled={isPending}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-extrabold transition disabled:opacity-60 ${
            isOverdue
              ? 'border-amber-300/25 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
              : 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
          }`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          {isOverdue ? 'إرسال إنذار تأخير (واتساب)' : 'إرسال تذكير تسليم (واتساب)'}
        </button>
        {state.success && (
          <p className="flex items-center gap-1 text-xs font-bold text-emerald-400 mt-1.5 px-2">
            <CheckCircle2 className="h-3 w-3" /> تم إرسال رسالة الواتساب بنجاح!
          </p>
        )}
        {state.error && (
          <p className="flex items-center gap-1 text-xs font-bold text-rose-400 mt-1.5 px-2">
            <AlertTriangle className="h-3 w-3" /> {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
