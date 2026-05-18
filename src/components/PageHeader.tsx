import React from 'react';

export interface PageHeaderChip {
  label: string;
  /** "green" | "blue" | "amber" | "muted" */
  color?: 'green' | 'blue' | 'amber' | 'muted';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  chips?: PageHeaderChip[];
  className?: string;
}

const CHIP_STYLES: Record<NonNullable<PageHeaderChip['color']>, string> = {
  green: 'border-[#00ff9d]/40 text-[#00ff9d] bg-[#00ff9d]/10 shadow-[0_0_8px_rgba(0,255,157,0.15)]',
  blue: 'border-[#2962ff]/40 text-[#2962ff] bg-[#2962ff]/10 shadow-[0_0_8px_rgba(41,98,255,0.15)]',
  amber:
    'border-[#ffaf52]/40 text-[#ffaf52] bg-[#ffaf52]/10 shadow-[0_0_8px_rgba(255,175,82,0.15)]',
  muted: 'border-white/10 text-[#64748b] bg-white/5',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  chips,
  className = '',
}) => (
  <div className={`flex flex-col gap-2 w-full ${className}`}>
    {/* Title row */}
    <div className="flex items-center gap-4 flex-wrap">
      {/* Corner bracket decoration */}
      <div className="relative">
        <span
          aria-hidden
          className="absolute -top-1 -left-2 w-3 h-3 border-t-2 border-l-2 border-[#2962ff]/60 pointer-events-none"
        />
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide uppercase font-mono">
          {title}
        </h1>
        <span
          aria-hidden
          className="absolute -bottom-1 -right-2 w-3 h-3 border-b-2 border-r-2 border-[#2962ff]/60 pointer-events-none"
        />
      </div>

      {/* Chips */}
      {chips && chips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-widest ${
                CHIP_STYLES[chip.color ?? 'muted']
              }`}
            >
              {chip.color === 'green' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse inline-block" />
              )}
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* Subtitle */}
    {subtitle && (
      <p className="text-[#64748b] font-mono text-xs uppercase tracking-widest">{subtitle}</p>
    )}

    {/* Divider line */}
    <div className="w-full h-px bg-gradient-to-r from-[#2962ff]/30 via-white/5 to-transparent mt-1" />
  </div>
);
