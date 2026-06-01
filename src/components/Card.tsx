import React from 'react';

export const FancyCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="group relative bg-black p-6 border border-white/5 transition-all duration-500 hover:border-[#2962ff]/30 hover:shadow-[0_0_30px_rgba(41,98,255,0.05)] hover:bg-[#2962ff]/[0.02] w-full h-full
            before:content-[''] before:absolute before:top-0 before:left-0 before:transition-all before:duration-300
            before:w-4 before:h-4 group-hover:before:w-6 group-hover:before:h-6 before:border-t-2 before:border-l-2 before:border-[#2962ff]/50 group-hover:before:border-[#2962ff]
            after:content-[''] after:absolute after:bottom-0 after:right-0 after:transition-all after:duration-300
            after:w-4 after:h-4 group-hover:after:w-6 group-hover:after:h-6 after:border-b-2 after:border-r-2 after:border-[#2962ff]/50 group-hover:after:border-[#2962ff]"
    >
      {children}
    </div>
  );
};
