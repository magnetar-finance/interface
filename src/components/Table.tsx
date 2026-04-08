import React from "react";

interface TableProps<T> {
  headerLabels: React.ReactNode[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export const Table = <T,>({ headerLabels, data, renderRow, renderEmpty }: TableProps<T>) => (
  <div className="w-full bg-black overflow-auto border-separate border-spacing-x-0 border-spacing-y-3 md:border-spacing-y-6 table table-auto">
    <div className="table-header-group font-bold text-sm md:text-lg">
      <div className="table-row">
        {headerLabels.map((label, index) => (
          <div className="text-[#64748b] text-left uppercase table-cell" key={index}>
            {label}
          </div>
        ))}
      </div>
    </div>
    <div className="overflow-auto table-row-group">
      {data.length > 0 ? (
        data.map((item, index) => (
          <div className="table-row hover:bg-white/10 cursor-pointer" key={index}>
            {renderRow(item)}
          </div>
        ))
      ) : (
        <div className="table-row">{renderEmpty ? renderEmpty() : "No data available"}</div>
      )}
    </div>
  </div>
);
