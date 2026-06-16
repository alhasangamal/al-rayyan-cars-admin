interface StatusBadgeProps {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

const tones = {
  success: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
  warning: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
  danger: 'border-rose-300/30 bg-rose-400/10 text-rose-200',
  neutral: 'border-slate-300/20 bg-slate-400/10 text-slate-200',
};

export default function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${tones[tone]}`}>
      {label}
    </span>
  );
}
