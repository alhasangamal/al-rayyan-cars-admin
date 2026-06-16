'use client';

import { useActionState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { loginAction, LoginState } from './actions';

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-bold text-slate-200">
          اسم المستخدم
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
          placeholder="admin"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-bold text-slate-200">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-bold text-rose-100">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 text-sm font-extrabold text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.32)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
        دخول النظام
      </button>
    </form>
  );
}
