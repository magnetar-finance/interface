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
  align?: 'left' | 'center';
}

const CHIP_STYLES: Record<NonNullable<PageHeaderChip['color']>, string> = {
  green: 'bg-success/10 text-success border-success/30',
  blue: 'bg-accent-2/10 text-accent-2 border-accent-2/30',
  amber: 'bg-accent/10 text-accent border-accent/30',
  muted: 'bg-white/5 text-muted border-white/10',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  chips,
  className = '',
  align = 'left',
}) => (
  <div
    className={`mb-5 flex w-full flex-col gap-1.5 animate-slide-up ${
      align === 'center' ? 'items-center text-center' : ''
    } ${className}`}
  >
    <p className="font-mono text-[11px] text-dim">
      <span className="text-accent">~</span>
      <span className="mx-1 text-white/20">/</span>
      {title.toLowerCase()}
    </p>
    <div
      className={`flex flex-wrap items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}
    >
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                CHIP_STYLES[chip.color ?? 'muted']
              }`}
            >
              {chip.color === 'green' && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              )}
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </div>
    {subtitle && (
      <p className={`max-w-2xl text-[13px] text-muted ${align === 'center' ? 'mx-auto' : ''}`}>
        {subtitle}
      </p>
    )}
  </div>
);
