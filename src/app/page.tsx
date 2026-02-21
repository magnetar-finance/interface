"use client";

import { PrimaryButton, WalletConnectButton } from "@/components/Button";
import { FancyCard } from "@/components/Card";
import { Table } from "@/components/Table";
import { SCREEN_WIDTHS } from "@/constants";
import { useAccountPositions, useAccountPositionStats } from "@/hooks/api";
import { useDimensions } from "@/hooks/app";
import { LiquidityPosition } from "@/utils/http-api";
import { mockUserLPPositions } from "@/utils/mock-data";
import { formatNumber } from "@/utils/numbers";
import { DropletIcon, MoreVerticalIcon, PlusIcon, WalletMinimalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useConnection } from "wagmi";

function positionToUSD(position: LiquidityPosition) {
  const { totalSupply, reserveUSD } = position.pool;

  if (totalSupply === 0) return 0;

  const positionUSDValue = (position.position * reserveUSD) / totalSupply;
  return positionUSDValue;
}

export default function Home() {
  const { isConnected } = useConnection();
  const { positionStats } = useAccountPositionStats();
  const dimesions = useDimensions();
  const isMobile = useMemo(() => dimesions.width <= SCREEN_WIDTHS.mobile, [dimesions.width]);

  // const [positionsPage, setPositionsPage] = useState<number>(1);
  // const { positions } = useAccountPositions(positionsPage, 10, 60000);
  return (
    <main className="w-full flex justify-center items-center">
      {isConnected ? (
        <div className="flex flex-col justify-center items-start gap-5 md:gap-12 w-full">
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-3 md:gap-7 w-full">
            <div className="w-full md:w-1/2 self-stretch">
              <FancyCard>
                <div className="flex flex-col gap-5 lg:gap-7 justify-start items-start pb-4 md:pb-10">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <h5 className="text-[#94a3b8] font-semibold text-lg md:text-xl">
                      Portfolio Value
                    </h5>
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
                    <h5 className="text-[#94a3b8] font-semibold text-lg md:text-xl">
                      Voting Power
                    </h5>
                    <span className="text-[#94a3b8] font-semibold text-xs md:text-sm">
                      0.042% of total
                    </span>
                  </div>
                  <h3 className="font-extrabold text-4xl lg:text-5xl text-[#00e0ff]">
                    5,240 veMGN
                  </h3>
                  <div className="flex justify-between items-center gap-7 w-full mt-4">
                    <h5 className="text-[#94a3b8] font-normal text-xs md:text-sm">
                      Claimable Rewards
                    </h5>
                    <span className="text-[#00ff9d] font-semibold text-xs md:text-sm">$124.5</span>
                  </div>
                  <button className="bg-[rgba(0,255,157,0.3)] border border-[#00ff9d] flex justify-center items-center w-full py-4 px-4 text-[#00ff9d]">
                    Claim Rewards
                  </button>
                </div>
              </FancyCard>
            </div>
          </div>
          <div className="w-full">
            <FancyCard>
              <div className="flex flex-col gap-3 py-3 w-full justify-start items-center">
                <div className="w-full flex justify-between items-center gap-6">
                  <h4 className="text-white font-semibold text-lg md:text-xl">Active Positions</h4>
                  <span className="text-[#94a3b8] font-normal text-sm md:text-lg">
                    {positionStats?.totalPositions || 0} positions
                  </span>
                </div>
                <Table<LiquidityPosition>
                  headerLabels={
                    isMobile
                      ? ["Pool", "Value", "Actions"]
                      : ["Pool", "Value", "APR", "Unclaimed Fees", "Actions"]
                  }
                  data={mockUserLPPositions}
                  renderRow={(item) => (
                    <>
                      <div className="table-cell md:py-5 md:px-3">
                        <div className="flex justify-start items-center gap-2 lg:gap-7 w-full">
                          <div className="-space-x-2 flex justify-center items-center">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-black bg-amber-100" />
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-black bg-blue-100" />
                          </div>
                          <div className="flex flex-col gap-1 justify-start items-start">
                            <h3 className="font-semibold text-sm md:text-lg text-white uppercase">
                              {item.pool.name}
                            </h3>
                            <p className="text-[#94a3b8] capitalize text-xs md:text-sm">
                              {item.pool.poolType.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="table-cell text-white font-bold text-sm md:text-lg md:py-5">
                        {formatNumber(positionToUSD(item), "en-US", 3, true)}
                      </div>
                      {!isMobile && (
                        <>
                          <div className="table-cell md:py-5">{item.pool.gauge?.rewardRate}</div>
                          <div className="table-cell text-[#00ff9d] font-bold text-sm md:text-lg md:py-5">
                            {formatNumber(item.pool.totalFeesUSD, "en-US", 3, true)}
                          </div>
                        </>
                      )}
                      <div className="table-cell py-5 text-center">
                        <button className="text-[#64748b]">
                          <MoreVerticalIcon size={isMobile ? 16 : 20} />
                        </button>
                      </div>
                    </>
                  )}
                  renderEmpty={() => (
                    <div className="w-full flex justify-center items-center my-20 flex-col py-5 gap-10">
                      <div className="border-2 border-dashed border-[rgba(255,255,255,0.1)] flex justify-center items-center p-4">
                        <DropletIcon size={90} color="#64748b" />
                      </div>
                      <div className="w-full flex justify-center items-center flex-col py-2 gap-5">
                        <h4 className="text-3xl md:text-4xl text-white font-extrabold">
                          No Active Positions
                        </h4>
                        <p className="text-[#94a3b8] font-normal text-sm md:text-xl text-center text-wrap w-full lg:w-132">
                          You haven&apos;t added liquidity to any pools yet. Add liquidity to start
                          earning fees and rewards
                        </p>
                      </div>
                      <div className="w-full flex flex-col gap-7 justify-center items-center">
                        <PrimaryButton className="py-4 px-4">
                          <PlusIcon size={25} /> <span>Add Liquidity</span>
                        </PrimaryButton>
                      </div>
                    </div>
                  )}
                />
              </div>
            </FancyCard>
          </div>
        </div>
      ) : (
        <div className="w-full md:w-1/3 flex justify-center items-center my-20 flex-col py-5 gap-10">
          <div className="border-2 border-dashed border-[rgba(41,98,255,0.3)] flex justify-center items-center p-4">
            <WalletMinimalIcon size={90} color="#2962ff" />
          </div>
          <div className="w-full flex justify-center items-center flex-col py-2 gap-5">
            <h4 className="text-3xl md:text-4xl text-white font-extrabold">Connect Your Wallet</h4>
            <p className="text-[#94a3b8] font-normal text-sm md:text-xl text-center text-wrap w-full lg:w-132">
              Connect your wallet to view your portfolio, voting power, and active liquidity
              positions.
            </p>
          </div>
          <div className="w-full flex flex-col gap-7 justify-center items-center">
            <WalletConnectButton hasIcon className="w-[70%] space-x-4 py-4" />
            <p className="text-[#64748b] font-normal text-sm text-center text-wrap w-full lg:w-132">
              Supports MetaMask, WalletConnect, Coinbase Wallet & more
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
