import React from 'react';

export const FancyCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`
      relative bg-[#131525]/75 backdrop-blur-2xl rounded-xl
      border border-[#2962ff]/15
      p-6 md:p-7 w-full h-full
      transition-all duration-300
      hover:border-[#2962ff]/35
      hover:shadow-[0_0_50px_rgba(41,98,255,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]
      shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
      ${className}
    `}
  >
    {/* Animated top gradient bar */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#2962ff]/80 via-[#9d4edd]/50 to-transparent animate-gradient-shift" />

    {/* Corner accents — all four corners */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-[1.5px] border-l-[1.5px] border-t-[#2962ff]/70 border-l-[#2962ff]/70 rounded-tl-xl" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-[1.5px] border-r-[1.5px] border-t-[#9d4edd]/30 border-r-[#9d4edd]/30 rounded-tr-xl" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[1.5px] border-l-[1.5px] border-b-[#2962ff]/25 border-l-[#2962ff]/25 rounded-bl-xl" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[1.5px] border-r-[1.5px] border-b-[#9d4edd]/15 border-r-[#9d4edd]/15 rounded-br-xl" />

    {children}
  </div>
);
