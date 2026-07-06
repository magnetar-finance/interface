import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}) => {
  // Build visible page numbers (max 5 shown)
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const pages = getPages();

  return (
    <div className="flex items-center gap-1 font-mono">
      {/* Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="w-7 h-7 flex justify-center items-center border border-white/10 text-[#64748b] rounded-md
          disabled:opacity-25 disabled:cursor-not-allowed
          hover:border-[#2962ff]/50 hover:text-[#2962ff] hover:bg-[#2962ff]/5 hover:shadow-[0_0_8px_rgba(41,98,255,0.15)]
          transition-all duration-150 active:scale-90"
      >
        <ChevronLeft size={12} />
      </button>

      {/* Page numbers */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange?.(1)}
            className="w-7 h-7 flex justify-center items-center text-[10px] border border-white/10 rounded-md
              text-[#64748b] hover:border-[#2962ff]/50 hover:text-[#2962ff] hover:bg-[#2962ff]/5 hover:shadow-[0_0_8px_rgba(41,98,255,0.15)] transition-all duration-150"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="w-7 h-7 flex items-center justify-center text-[#334155] text-[10px]">
              …
            </span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange?.(p)}
          className={`w-7 h-7 flex justify-center items-center text-[10px] border rounded-md transition-all duration-150 ${
            p === currentPage
              ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10 shadow-[0_0_12px_rgba(41,98,255,0.3)] font-bold'
              : 'border-white/10 text-[#64748b] hover:border-[#2962ff]/50 hover:text-[#2962ff] hover:bg-[#2962ff]/5 hover:shadow-[0_0_8px_rgba(41,98,255,0.15)]'
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="w-7 h-7 flex items-center justify-center text-[#334155] text-[10px]">
              …
            </span>
          )}
          <button
            onClick={() => onPageChange?.(totalPages)}
            className="w-7 h-7 flex justify-center items-center text-[10px] border border-white/10 rounded-md
              text-[#64748b] hover:border-[#2962ff]/50 hover:text-[#2962ff] hover:bg-[#2962ff]/5 hover:shadow-[0_0_8px_rgba(41,98,255,0.15)] transition-all duration-150"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="w-7 h-7 flex justify-center items-center border border-white/10 text-[#64748b] rounded-md
          disabled:opacity-25 disabled:cursor-not-allowed
          hover:border-[#2962ff]/50 hover:text-[#2962ff] hover:bg-[#2962ff]/5 hover:shadow-[0_0_8px_rgba(41,98,255,0.15)]
          transition-all duration-150 active:scale-90"
      >
        <ChevronRight size={12} />
      </button>
    </div>
  );
};
