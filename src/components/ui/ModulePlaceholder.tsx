interface ModulePlaceholderProps {
  title: string;
}

export default function ModulePlaceholder({ title }: ModulePlaceholderProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-8 text-right shadow-2xl shadow-black/25 backdrop-blur-xl">
      <h2 className="mt-3 text-2xl font-extrabold text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        لا توجد بيانات متاحة حالياً.
      </p>
    </section>
  );
}
