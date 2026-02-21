import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: { key: keyof T; label: string; format?: (val: any) => string }[];
  pageSize?: number;
}

export default function DataTable<T>({
  data,
  columns,
  pageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = useMemo(
    () => data.slice(page * pageSize, (page + 1) * pageSize),
    [data, page, pageSize],
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-600/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-txt-muted font-display"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={i}
                className="border-b border-base-600/20 hover:bg-base-700/30 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="py-2.5 px-4 text-txt-secondary font-body"
                  >
                    {col.format
                      ? col.format((row as any)[col.key])
                      : String((row as any)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-xs text-txt-muted">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of{' '}
            {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-txt-secondary px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
