import { FancyCard } from "@/components/Card";
import { ArrowLeftIcon } from "lucide-react";
import React from "react";

export const MainView: React.FC = () => {
  return (
    <div className="w-full flex justify-center items-center mt-20">
      <div className="w-full md:w-1/3">
        <FancyCard>
          <div className="flex flex-col justify-start items-center w-full">
            <div className="flex border-b-[0.3px] border-[#64748b] justify-start items-center gap-7 w-full py-3">
              <button className="bg-transparent">
                <ArrowLeftIcon color="#64748b" size={16} />
              </button>
              <h3 className="text-[#2962ff] font-bolder text-xl">Add Liquidity</h3>
            </div>
          </div>
        </FancyCard>
      </div>
    </div>
  );
};
