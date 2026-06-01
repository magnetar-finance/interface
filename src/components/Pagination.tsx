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
  return (
    <div className="flex justify-center items-center gap-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="w-8 h-8 flex justify-center items-center rounded border border-white/10 bg-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-white/10 hover:border-[#2962ff]/50 active:scale-95 disabled:hover:border-white/10 disabled:active:scale-100"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-xs font-mono text-[#94a3b8]">
        Page <span className="text-white">{currentPage}</span> of{' '}
        <span className="text-white">{totalPages}</span>
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="w-8 h-8 flex justify-center items-center rounded border border-white/10 bg-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-white/10 hover:border-[#2962ff]/50 active:scale-95 disabled:hover:border-white/10 disabled:active:scale-100"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
