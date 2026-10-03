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
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const pages = getPages();

  const btn =
    'w-8 h-8 flex justify-center items-center border border-white/10 text-muted rounded-xl text-xs transition-colors duration-150 disabled:opacity-25 disabled:cursor-not-allowed hover:border-accent/40 hover:text-accent hover:bg-accent/10';

  return (
    <div className="flex items-center gap-1 font-mono">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className={btn}
      >
        <ChevronLeft size={12} />
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange?.(1)} className={btn}>
            1
          </button>
          {pages[0] > 2 && (
            <span className="flex h-8 w-8 items-center justify-center text-xs text-dim">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange?.(p)}
          className={`${btn} ${
            p === currentPage ? 'border-accent/50 bg-accent/15 text-accent font-bold' : ''
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="flex h-8 w-8 items-center justify-center text-xs text-dim">…</span>
          )}
          <button onClick={() => onPageChange?.(totalPages)} className={btn}>
            {totalPages}
          </button>
        </>
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className={btn}
      >
        <ChevronRight size={12} />
      </button>
    </div>
  );
};
