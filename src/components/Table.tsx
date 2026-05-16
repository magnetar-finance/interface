import React from "react";

export interface TableHeader {
  label: React.ReactNode;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  headers: TableHeader[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export const Table = <T,>({ headers, data, renderRow, renderEmpty, onRowClick }: TableProps<T>) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-[#64748b] border-b border-white/5">
          {headers.map((header, index) => (
            <th
              className={`py-2 pr-4 uppercase tracking-widest ${
                header.align === "right"
                  ? "text-right"
                  : header.align === "center"
                  ? "text-center"
                  : "text-left"
              }`}
              key={index}
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
              className={`border-b border-white/5 transition-colors ${
                onRowClick ? "hover:bg-white/5 cursor-pointer" : ""
              }`}
              key={index}
              onClick={() => onRowClick?.(item)}
            >
              {renderRow(item, index)}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="py-4 text-center">
              {renderEmpty ? renderEmpty() : "No data available"}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
