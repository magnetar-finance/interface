import React from 'react';

export const FancyCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`
      relative w-full h-full rounded-2xl p-4 md:p-5
      bg-surface
      border border-white/[0.08]
      shadow-[0_16px_40px_rgba(0,0,0,0.28)]
      transition-colors duration-300
      hover:border-white/15
      ${className}
    `}
  >
    {children}
  </div>
);
