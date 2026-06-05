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
  <div className="w-full overflow-x-auto border border-white/10 p-1 bg-black">
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="border-b border-dashed border-white/30">
          {headers.map((header, index) => (
            <th
              key={index}
              className={`
                pb-2 pt-1 pr-4 text-[#2962ff] uppercase tracking-widest
                ${
                  header.align === 'right'
                    ? 'text-right'
                    : header.align === 'center'
                    ? 'text-center'
                    : 'text-left'
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
                border-b border-white/5
                transition-colors duration-150
                hover:bg-white/[0.03] hover:text-[#2962ff]
                ${onRowClick ? 'cursor-pointer' : ''}
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
              {renderEmpty ? renderEmpty() : '--- NO DATA FOUND ---'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
