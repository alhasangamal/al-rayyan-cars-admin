export default function InvoiceTemplate({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-right text-slate-300">
      {children}
    </div>
  );
}
