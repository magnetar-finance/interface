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
  <div className="w-full overflow-x-auto rounded-xl">
    {/* Top border accent with glow */}
    <div className="w-full h-[2px] bg-gradient-to-r from-[#2962ff]/90 via-[#9d4edd]/60 to-transparent shadow-[0_1px_8px_rgba(41,98,255,0.3)]" />
    <table className="w-full text-xs font-mono border border-white/[0.06] border-t-0 rounded-b-xl overflow-hidden">
      <thead>
        <tr className="bg-gradient-to-r from-[#2962ff]/[0.04] to-transparent">
          {headers.map((header, index) => (
            <th
              key={index}
              className={`
                pb-3 pt-3.5 pr-4 text-[#2962ff]/70 uppercase tracking-widest text-[10px] font-bold
                border-b border-white/[0.07]
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
                border-b border-white/[0.04]
                transition-all duration-200
                ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}
                hover:bg-[#2962ff]/[0.06]
                hover:border-b-[#2962ff]/20
                hover:shadow-[inset_3px_0_0_#2962ff,inset_0_0_30px_rgba(41,98,255,0.04)]
                ${onRowClick ? 'cursor-pointer group' : ''}
              `}
            >
              {renderRow(item, index)}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={headers.length}
              className="py-16 text-center text-[#64748b] uppercase tracking-widest"
            >
              {renderEmpty ? (
                renderEmpty()
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                    <span className="text-[#2962ff]/40 font-mono text-lg">∅</span>
                  </div>
                  <span className="text-[#334155] font-mono text-xs">
                    <span className="text-[#2962ff]/40">{'>'}</span>
                    {' --- NO DATA FOUND ---'}
                  </span>
                </div>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
