import React from 'react';

export const FancyCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`
      relative bg-[#050505]
      border border-[#2962ff]/20
      p-6 md:p-7 w-full h-full
      transition-all duration-300
      hover:border-[#2962ff]/60
      hover:shadow-[0_0_20px_rgba(41,98,255,0.1)]
      ${className}
    `}
  >
    {/* Terminal top bar decoration */}
    <div className="absolute top-0 left-0 w-full h-1 bg-[#2962ff]/20" />
    <div className="absolute top-0 left-0 w-8 h-1 bg-[#2962ff]" />

    {children}
  </div>
);
