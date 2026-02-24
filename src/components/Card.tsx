import React from "react";

export const FancyCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="relative bg-black/80 p-6 border border-gray-800
            before:content-[''] before:absolute before:top-0 before:left-0 
            before:w-4 before:h-4 before:border-t-2 before:border-l-2 before:border-[#2962ff]
            after:content-[''] after:absolute after:bottom-0 after:right-0 
            after:w-4 after:h-4 after:border-b-2 after:border-r-2 after:border-[#2962ff] w-full h-full"
    >
      {children}
    </div>
  );
};
