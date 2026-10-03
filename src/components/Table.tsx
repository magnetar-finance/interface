import React from 'react';

export interface TableHeader {
  label: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  headers: TableHeader[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export const Table = <T,>({ headers, data, renderRow, renderEmpty, onRowClick }: TableProps<T>) => (
  <div className="w-full overflow-x-auto rounded-2xl">
    <table className="w-full overflow-hidden rounded-2xl border border-white/[0.06] text-sm">
      <thead>
        <tr className="bg-white/[0.02]">
          {headers.map((header, index) => (
            <th
              key={index}
              className={`
                border-b border-white/[0.06] pb-3 pt-3.5 pr-4 text-[11px] font-semibold
                uppercase tracking-[0.12em] text-muted
                ${
                  header.align === 'right'
                    ? 'text-right'
                    : header.align === 'center'
                    ? 'text-center'
                    : 'text-left pl-3'
                }
              `}
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={`
                border-b border-white/[0.04] transition-colors duration-150
                ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}
                hover:bg-accent/[0.06]
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {renderRow(item, index)}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="py-16 text-center text-muted">
              {renderEmpty ? (
                renderEmpty()
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
                    <span className="font-mono text-lg text-accent/50">∅</span>
                  </div>
                  <span className="font-mono text-xs text-dim">No data found</span>
                </div>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
