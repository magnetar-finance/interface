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
  <div className="w-full overflow-x-auto rounded-lg">
    {/* Top border accent */}
    <div className="w-full h-[2px] bg-gradient-to-r from-[#2962ff]/80 via-[#9d4edd]/50 to-transparent" />
    <table className="w-full text-xs font-mono border border-white/[0.06] border-t-0">
      <thead>
        <tr className="bg-[#2962ff]/[0.02]">
          {headers.map((header, index) => (
            <th
              key={index}
              className={`
                pb-2.5 pt-3 pr-4 text-[#2962ff]/80 uppercase tracking-widest text-[10px] font-bold
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
                transition-all duration-150
                ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.012]'}
                hover:bg-[#2962ff]/[0.05] hover:border-b-[#2962ff]/30
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
                <span className="text-[#334155] font-mono">
                  <span className="text-[#2962ff]/40">{'>'}</span>
                  {' --- NO DATA FOUND ---'}
                </span>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
