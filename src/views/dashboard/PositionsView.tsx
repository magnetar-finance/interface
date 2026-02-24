"use client";

import React, { useMemo } from "react";
import type { LiquidityPosition } from "@/utils/http-api";
import { useDimensions } from "@/hooks/app";
import { SCREEN_WIDTHS } from "@/constants";
import { useAccountPositionStats } from "@/hooks/api";
import { PrimaryButton } from "@/components/Button";
import { FancyCard } from "@/components/Card";
import { mockUserLPPositions } from "@/utils/mock-data";
import { formatNumber } from "@/utils/numbers";
import {
  MoreVerticalIcon,
  ShieldPlusIcon,
  ShieldXIcon,
  PlusIcon,
  MinusIcon,
  DropletIcon,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Table } from "@/components/Table";

function positionToUSD(position: LiquidityPosition) {
  const { totalSupply, reserveUSD } = position.pool;

  if (totalSupply === 0) return 0;

  const positionUSDValue = (position.position * reserveUSD) / totalSupply;
  return positionUSDValue;
}

export const PositionsView: React.FC = () => {
  const { positionStats } = useAccountPositionStats();
  const dimesions = useDimensions();
  const isMobile = useMemo(() => dimesions.width <= SCREEN_WIDTHS.mobile, [dimesions.width]);

  return (
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
                    <div className="-space-x-4 flex justify-center items-center">
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
                  <DropdownMenu.Root key={item.id}>
                    <DropdownMenu.Trigger asChild>
                      <button className="text-[#64748b]">
                        <MoreVerticalIcon size={isMobile ? 16 : 20} />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="border border-[rgb(34,34,34)] bg-black w-3xs px-3 py-2 space-y-2"
                        sideOffset={4}
                      >
                        <DropdownMenu.Item className="flex justify-start items-center gap-2 text-white cursor-pointer hover:bg-white/10 py-3 px-3">
                          <ShieldPlusIcon size={16} color="#94a3b8" /> <span>Stake</span>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="flex justify-start items-center gap-2 text-white cursor-pointer hover:bg-white/10 py-3 px-3">
                          <ShieldXIcon size={16} color="#94a3b8" /> <span>Unstake</span>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="flex justify-start items-center gap-2 text-white cursor-pointer hover:bg-white/10 py-3 px-3">
                          <PlusIcon size={16} color="#94a3b8" /> <span>Increase</span>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="flex justify-start items-center gap-2 text-[#ff4757] cursor-pointer hover:bg-white/10 py-3 px-3">
                          <MinusIcon size={16} /> <span>Remove</span>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
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
  );
};
