'use client';

import React, { useCallback, useMemo } from 'react';
import type { LiquidityPosition } from '@/utils/http-api';
import { useDimensions } from '@/hooks/app';
import { SCREEN_WIDTHS } from '@/constants';
import { useAccountPositions, useAccountPositionStats } from '@/hooks/api';
import { PrimaryButton } from '@/components/Button';
import { FancyCard } from '@/components/Card';
import { formatNumber } from '@/utils/numbers';
import {
  MoreVerticalIcon,
  ShieldPlusIcon,
  ShieldXIcon,
  PlusIcon,
  MinusIcon,
  DropletIcon,
} from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { Table } from '@/components/Table';
import { useGHAssetsContext } from '@/contexts/github-assets';
import Image from 'next/image';

function positionToUSD(position: LiquidityPosition) {
  const { totalSupply, reserveUSD } = position.pool;

  if (totalSupply === 0) return 0;

  const positionUSDValue = (position.position * reserveUSD) / totalSupply;
  return positionUSDValue;
}

export const PositionsView: React.FC = () => {
  const { positionStats } = useAccountPositionStats();
  const { positions } = useAccountPositions();
  const dimesions = useDimensions();
  const isMobile = useMemo(() => dimesions.width <= SCREEN_WIDTHS.mobile, [dimesions.width]);
  const { assetsDictionary } = useGHAssetsContext();

  const getAssetInfo = useCallback(
    (address: string) => assetsDictionary[address.toLowerCase()],
    [assetsDictionary],
  );

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
            headers={
              isMobile
                ? [
                    { label: 'Pool', align: 'left' },
                    { label: 'Value', align: 'right' },
                    { label: 'Actions', align: 'right' },
                  ]
                : [
                    { label: 'Pool', align: 'left' },
                    { label: 'Value', align: 'right' },
                    { label: 'APR', align: 'right' },
                    { label: 'Unclaimed Fees', align: 'right' },
                    { label: 'Actions', align: 'right' },
                  ]
            }
            data={positions}
            renderRow={(item) => {
              const token0Info = getAssetInfo(item.pool.token0.address);
              const token1Info = getAssetInfo(item.pool.token1.address);
              return (
                <>
                  <td className="py-3 pr-4">
                    <div className="flex justify-start items-center gap-3 w-full">
                      <div className="-space-x-3 flex justify-center items-center">
                        {token0Info ? (
                          <Image
                            src={token0Info.logoURI}
                            alt={item.pool.token0.symbol}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full border border-black bg-amber-100"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-black bg-amber-100" />
                        )}
                        {token1Info ? (
                          <Image
                            src={token1Info.logoURI}
                            alt={item.pool.token1.symbol}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full border border-black bg-blue-100"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-black bg-blue-100" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0 justify-start items-start">
                        <h3 className="font-bold text-white uppercase whitespace-nowrap">
                          {item.pool.name}
                        </h3>
                        <p className="text-[#64748b] uppercase text-[10px] tracking-widest hidden sm:block">
                          {item.pool.poolType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white font-bold text-right w-1/4">
                    ${formatNumber(positionToUSD(item), 'en-US', 2, true)}
                  </td>
                  {!isMobile && (
                    <>
                      <td className="py-3 pr-4 text-[#00ff9d] text-right font-bold w-1/6">
                        {item.pool.gauge?.rewardRate || 0}%
                      </td>
                      <td className="py-3 pr-4 text-[#ffaf52] text-right font-bold w-1/6">
                        ${formatNumber(item.pool.totalFeesUSD, 'en-US', 2, true)}
                      </td>
                    </>
                  )}
                  <td className="py-3 text-right">
                    <DropdownMenu.Root key={item.id}>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-[#64748b] hover:text-white transition-colors">
                          <MoreVerticalIcon size={16} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="border border-[rgb(34,34,34)] bg-black w-3xs px-3 py-2 space-y-2 z-50 font-mono text-xs"
                          sideOffset={4}
                        >
                          <DropdownMenu.Item className="flex justify-start items-center gap-2 text-[#94a3b8] cursor-pointer hover:bg-white/10 hover:text-white py-2 px-3 transition-colors">
                            <ShieldPlusIcon size={14} /> <span>Stake</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className="flex justify-start items-center gap-2 text-[#94a3b8] cursor-pointer hover:bg-white/10 hover:text-white py-2 px-3 transition-colors">
                            <ShieldXIcon size={14} /> <span>Unstake</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className="flex justify-start items-center gap-2 text-[#94a3b8] cursor-pointer hover:bg-white/10 hover:text-white py-2 px-3 transition-colors">
                            <PlusIcon size={14} /> <span>Increase</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className="flex justify-start items-center gap-2 text-[#ff4757] cursor-pointer hover:bg-[#ff4757]/10 py-2 px-3 transition-colors">
                            <MinusIcon size={14} /> <span>Remove</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </>
              );
            }}
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
