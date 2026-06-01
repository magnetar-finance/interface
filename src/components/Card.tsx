import React from 'react';

export const FancyCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="group relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-7 border border-white/10 transition-all duration-500 hover:border-[#2962ff]/40 hover:shadow-[0_0_40px_rgba(41,98,255,0.1)] hover:bg-white/[0.03] w-full h-full
            before:content-[''] before:absolute before:top-0 before:left-0 before:transition-all before:duration-500
            before:w-4 before:h-4 group-hover:before:w-6 group-hover:before:h-6 group-hover:before:-translate-x-1 group-hover:before:-translate-y-1 before:border-t-2 before:border-l-2 before:border-[#2962ff]/50 group-hover:before:border-[#2962ff] before:rounded-tl-[14px]
            after:content-[''] after:absolute after:bottom-0 after:right-0 after:transition-all after:duration-500
            after:w-4 after:h-4 group-hover:after:w-6 group-hover:after:h-6 group-hover:after:translate-x-1 group-hover:after:translate-y-1 after:border-b-2 after:border-r-2 after:border-[#2962ff]/50 group-hover:after:border-[#2962ff] after:rounded-br-[14px]"
    >
      {children}
    </div>
  );
};
