'use client';

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/5 bg-white/5 p-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-6 w-32 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-[2rem] border border-white/5 bg-white/5 p-6">
      <div className="h-6 w-48 rounded bg-white/10" />
      <div className="space-y-2">
        <div className="h-10 w-full rounded bg-white/5" />
        <div className="h-10 w-full rounded bg-white/5" />
        <div className="h-10 w-full rounded bg-white/5" />
      </div>
    </div>
  );
}
