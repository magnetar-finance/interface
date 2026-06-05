import React from 'react';

export interface PageHeaderChip {
  label: string;
  color?: 'green' | 'blue' | 'amber' | 'muted';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  chips?: PageHeaderChip[];
  className?: string;
}

const CHIP_STYLES: Record<NonNullable<PageHeaderChip['color']>, string> = {
  green: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40',
  blue: 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/40',
  amber: 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/40',
  muted: 'bg-white/5 text-[#94a3b8] border-white/20',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  chips,
  className = '',
}) => (
  <div className={`flex flex-col gap-2 w-full mb-4 ${className}`}>
    <div className="flex items-center gap-4 flex-wrap">
      <h1 className="text-white text-2xl font-mono font-bold uppercase tracking-widest">
        <span className="text-[#2962ff] mr-2">/root/</span>
        {title}
      </h1>
      {chips && chips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-mono uppercase tracking-widest ${
                CHIP_STYLES[chip.color ?? 'muted']
              }`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </div>
    {subtitle && (
      <p className="text-[#94a3b8] text-xs font-mono uppercase tracking-widest flex items-center gap-2">
        <span className="text-[#2962ff]">&gt;</span> {subtitle}
      </p>
    )}
    <div className="w-full h-px bg-gradient-to-r from-[#2962ff]/50 to-transparent mt-2" />
  </div>
);
