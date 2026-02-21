import { FancyCard } from "@/components/Card";
import { useAccountPositionStats } from "@/hooks/api";
import { formatNumber } from "@/utils/numbers";

export const MainView: React.FC = () => {
  const { positionStats } = useAccountPositionStats();
  return (
    <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-3 md:gap-7 w-full">
      <div className="w-full md:w-1/2 self-stretch">
        <FancyCard>
          <div className="flex flex-col gap-5 lg:gap-7 justify-start items-start pb-4 md:pb-10">
            <div className="flex justify-between items-center gap-4 w-full">
              <h5 className="text-[#94a3b8] font-semibold text-lg md:text-xl">Portfolio Value</h5>
              <span
                className={`${
                  positionStats?.portfolioChangeType === "increase"
                    ? "text-[#00ff9d]"
                    : positionStats?.portfolioChangeType === "decrease"
                    ? "text-[#ff4d4f]"
                    : "text-white"
                } font-semibold text-xs md:text-sm`}
              >
                {`${
                  (positionStats?.portfolioChangeType === "increase"
                    ? "+"
                    : positionStats?.portfolioChangeType === "decrease"
                    ? "-"
                    : "") +
                  formatNumber(positionStats?.portfolioHourlyChange || 0, "en-US", 2, false)
                }`}
                % (24h)
              </span>
            </div>
            <h3 className="font-extrabold text-4xl lg:text-5xl">
              {formatNumber(positionStats?.portfolioValue || 0, "en-US", 3, true)}
            </h3>
          </div>
        </FancyCard>
      </div>

      <div className="w-full md:w-1/2 self-stretch">
        <FancyCard>
          <div className="flex flex-col gap-5 lg:gap-7 justify-start items-start">
            <div className="flex justify-between items-center gap-4 w-full">
              <h5 className="text-[#94a3b8] font-semibold text-lg md:text-xl">Voting Power</h5>
              <span className="text-[#94a3b8] font-semibold text-xs md:text-sm">
                0.042% of total
              </span>
            </div>
            <h3 className="font-extrabold text-4xl lg:text-5xl text-[#00e0ff]">5,240 veMGN</h3>
            <div className="flex justify-between items-center gap-7 w-full mt-4">
              <h5 className="text-[#94a3b8] font-normal text-xs md:text-sm">Claimable Rewards</h5>
              <span className="text-[#00ff9d] font-semibold text-xs md:text-sm">$124.5</span>
            </div>
            <button className="bg-[rgba(0,255,157,0.3)] border border-[#00ff9d] flex justify-center items-center w-full py-4 px-4 text-[#00ff9d]">
              Claim Rewards
            </button>
          </div>
        </FancyCard>
      </div>
    </div>
  );
};
