import React from 'react';

export const FancyCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`
      relative bg-[#131525]/80 backdrop-blur-md rounded-xl
      border border-[#2962ff]/15
      p-6 md:p-7 w-full h-full
      transition-all duration-300
      hover:border-[#2962ff]/40
      hover:shadow-[0_0_40px_rgba(41,98,255,0.08)]
      ${className}
    `}
  >
    {/* Terminal top bar */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#2962ff] via-[#2962ff]/30 to-transparent" />

    {/* Corner accents */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-t-[#2962ff]/60 border-l-[#2962ff]/60 rounded-tl-xl" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-t-[#2962ff]/20 border-r-[#2962ff]/20 rounded-tr-xl" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-b-[#2962ff]/20 border-l-[#2962ff]/20 rounded-bl-xl" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-b-[#2962ff]/10 border-r-[#2962ff]/10 rounded-br-xl" />

    {children}
  </div>
);
