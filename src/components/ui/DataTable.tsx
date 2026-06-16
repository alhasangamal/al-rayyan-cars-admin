interface DataTableProps {
  columns: string[];
  emptyMessage?: string;
}

export default function DataTable({ columns, emptyMessage = 'لا توجد بيانات للعرض.' }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
      <table className="w-full min-w-[720px] text-right text-sm">
        <thead className="bg-white/5 text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-5 py-4 font-extrabold">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
