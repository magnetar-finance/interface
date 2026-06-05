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
}) => (
  <div className="flex justify-center items-center gap-2">
    <button
      disabled={currentPage === 1}
      onClick={() => onPageChange?.(currentPage - 1)}
      className="w-8 h-8 flex justify-center items-center rounded-full bg-white/[0.05] text-white/60 border border-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:bg-white/[0.10] hover:text-white active:scale-90"
    >
      <ChevronLeft size={14} />
    </button>

    <span className="text-xs text-white/40 px-2 tabular-nums">
      <span className="text-white font-medium">{currentPage}</span>
      {' / '}
      {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => onPageChange?.(currentPage + 1)}
      className="w-8 h-8 flex justify-center items-center rounded-full bg-white/[0.05] text-white/60 border border-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:bg-white/[0.10] hover:text-white active:scale-90"
    >
      <ChevronRight size={14} />
    </button>
  </div>
);
