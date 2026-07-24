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
  green: 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/40',
  blue: 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/40',
  amber: 'bg-[#ffaf52]/10 text-[#ffaf52] border-[#ffaf52]/40',
  muted: 'bg-white/5 text-[#94a3b8] border-white/20',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  chips,
  className = '',
}) => (
  <div className={`flex flex-col gap-2.5 w-full mb-4 animate-slide-up ${className}`}>
    <div className="flex items-center gap-4 flex-wrap">
      <h1 className="text-white text-3xl font-bold uppercase tracking-widest font-sans flex items-center gap-2">
        <span
          className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] via-[#9d4edd] to-[#2962ff] animate-shimmer"
          style={{ backgroundSize: '200% auto' }}
        >
          /root/
        </span>
        {title}
        <span className="font-mono text-[#2962ff]/60 text-2xl animate-blink ml-1">▋</span>
      </h1>
      {chips && chips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[10px] font-mono uppercase tracking-widest ${
                CHIP_STYLES[chip.color ?? 'muted']
              }`}
            >
              {chip.color === 'green' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_6px_rgba(0,255,157,0.8)] animate-pulse shrink-0" />
              )}
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </div>
    {subtitle && (
      <p className="text-[#64748b] text-xs font-mono uppercase tracking-widest flex items-center gap-2">
        <span className="text-[#2962ff]">{'>'}</span> {subtitle}
      </p>
    )}
    {/* Glowing divider */}
    <div className="relative w-full h-[2px] mt-1 overflow-hidden rounded-full">
      <div className="absolute inset-0 bg-gradient-to-r from-[#2962ff]/70 via-[#9d4edd]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2962ff]/30 via-transparent to-transparent blur-sm" />
    </div>
  </div>
);
