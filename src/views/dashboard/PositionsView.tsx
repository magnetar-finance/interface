'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { RemoveLiquidityModal } from '@/ui/modals/RemoveLiquidityModal';
import { IncreaseLiquidityModal } from '@/ui/modals/IncreaseLiquidityModal';
import { StakeLPModal } from '@/ui/modals/StakeLPModal';
import { UnstakeLPModal } from '@/ui/modals/UnstakeLPModal';
import { useDimensions } from '@/hooks/app';
import { REFETCH_INTERVALS, SCREEN_WIDTHS } from '@/constants';
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
import { Skeleton } from '@/components/Skeleton';
import { useGHAssetsContext } from '@/contexts/github-assets';
import Image from 'next/image';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import { Pagination } from '@/components/Pagination';

type LiquidityPosition = NonNullable<GetAccountInfoQuery['user']>['lpPositions'][number];

function positionToUSD(position: LiquidityPosition) {
  const { totalSupply, reserveUSD } = position.pool;

  if (totalSupply === 0) return 0;

  const positionUSDValue =
    (parseFloat(position.position as string) * parseFloat(reserveUSD as string)) /
    parseFloat(totalSupply as string);
  return positionUSDValue;
}

export const PositionsView: React.FC = () => {
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [increaseModalOpen, setIncreaseModalOpen] = useState(false);
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null);
  const { data: accountInfo, isLoading } = useAccountInfo(REFETCH_INTERVALS);
  const dimesions = useDimensions();
  const isMobile = useMemo(() => dimesions.width <= SCREEN_WIDTHS.mobile, [dimesions.width]);
  const { assetsDictionary } = useGHAssetsContext();

  const getAssetInfo = useCallback(
    (address: string) => assetsDictionary[address.toLowerCase()],
    [assetsDictionary],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(
    () => Math.ceil((accountInfo?.lpPositions.length || 0) / 20),
    [accountInfo?.lpPositions.length],
  );
  const paginatedPositions = useMemo(
    () => (accountInfo?.lpPositions || []).slice((currentPage - 1) * 20, currentPage * 20),
    [accountInfo?.lpPositions, currentPage],
  );

  return (
    <div className="w-full">
      <FancyCard>
        <div className="flex flex-col gap-3 py-3 w-full justify-start items-center">
          <div className="w-full flex justify-between items-center gap-6">
            <h4 className="text-white font-bold text-lg md:text-xl font-sans">Active Positions</h4>
            <span className="text-[#94a3b8] font-normal text-sm md:text-lg">
              {isLoading ? '-' : accountInfo?.lpPositions.length || 0} positions
            </span>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2 w-full mt-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
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
              data={paginatedPositions}
              renderRow={(item) => {
                const token0Info = getAssetInfo(item.pool.token0.address as string);
                const token1Info = getAssetInfo(item.pool.token1.address as string);
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
                      {formatNumber(positionToUSD(item), 'en-US', 2, true)}
                    </td>
                    {!isMobile && (
                      <>
                        <td className="py-3 pr-4 text-[#00ff9d] text-right font-bold w-1/6 drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]">
                          {formatNumber((item.pool.gauge?.rewardRate as string) || '0', 'en-US', 2)}
                          %
                        </td>
                        <td className="py-3 pr-4 text-[#ffaf52] text-right font-bold w-1/6 drop-shadow-[0_0_8px_rgba(255,175,82,0.5)]">
                          {formatNumber(item.pool.totalFeesUSD as string, 'en-US', 2, true)}
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
                            className="bg-[#131525]/90 backdrop-blur-xl border border-white/10 rounded-xl w-3xs px-2 py-2 space-y-1 z-50 font-sans text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_15px_rgba(41,98,255,0.08)] data-[state=open]:animate-dropdown-enter data-[state=closed]:animate-dropdown-exit"
                            sideOffset={4}
                          >
                            <DropdownMenu.Item
                              className="flex justify-start items-center gap-2 text-[#94a3b8] cursor-pointer rounded-lg hover:bg-white/5 hover:text-white py-2 px-3 transition-all duration-150 outline-none"
                              onClick={() => {
                                setSelectedPosition(item);
                                setStakeModalOpen(true);
                              }}
                            >
                              <ShieldPlusIcon size={14} /> <span>Stake</span>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex justify-start items-center gap-2 text-[#94a3b8] cursor-pointer rounded-lg hover:bg-white/5 hover:text-white py-2 px-3 transition-all duration-150 outline-none"
                              onClick={() => {
                                setSelectedPosition(item);
                                setUnstakeModalOpen(true);
                              }}
                            >
                              <ShieldXIcon size={14} /> <span>Unstake</span>
                            </DropdownMenu.Item>
                            {item.pool.poolType === 'CONCENTRATED' && (
                              <DropdownMenu.Item
                                className="flex justify-start items-center gap-2 text-[#94a3b8] cursor-pointer rounded-lg hover:bg-white/5 hover:text-white py-2 px-3 transition-all duration-150 outline-none"
                                onClick={() => {
                                  setSelectedPosition(item);
                                  setIncreaseModalOpen(true);
                                }}
                              >
                                <PlusIcon size={14} /> <span>Increase</span>
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Item
                              className="flex justify-start items-center gap-2 text-[#ff4757] cursor-pointer rounded-lg hover:bg-[#ff4757]/10 py-2 px-3 transition-all duration-150 outline-none"
                              onClick={() => {
                                setSelectedPosition(item);
                                setRemoveModalOpen(true);
                              }}
                            >
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
                  <div className="bg-[#2962ff]/5 border border-dashed border-[#2962ff]/20 flex justify-center items-center p-6 rounded-3xl">
                    <DropletIcon size={90} className="text-[#2962ff]/40 animate-float" />
                  </div>
                  <div className="w-full flex justify-center items-center flex-col py-2 gap-5">
                    <h4 className="text-3xl md:text-4xl text-white font-extrabold font-sans">
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
          )}

          <div className="mt-6 flex justify-end items-center w-full">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </FancyCard>
      {selectedPosition && (
        <RemoveLiquidityModal
          open={removeModalOpen}
          onOpenChange={(v) => {
            setRemoveModalOpen(v);
            if (!v) {
              setTimeout(() => setSelectedPosition(null), 300);
            }
          }}
          liquidityPosition={selectedPosition}
        />
      )}
      <StakeLPModal
        open={stakeModalOpen}
        onOpenChange={(v) => {
          setStakeModalOpen(v);
          if (!v) setTimeout(() => setSelectedPosition(null), 300);
        }}
        poolName={selectedPosition?.pool.name}
        poolAddress={selectedPosition?.pool.address as `0x${string}`}
        isCL={selectedPosition?.pool.poolType === 'CONCENTRATED'}
        tokenId={BigInt((selectedPosition?.clPositionTokenId as string) || '0')}
        gauge={selectedPosition?.pool.gauge?.address as `0x${string}`}
      />
      <UnstakeLPModal
        open={unstakeModalOpen}
        onOpenChange={(v) => {
          setUnstakeModalOpen(v);
          if (!v) setTimeout(() => setSelectedPosition(null), 300);
        }}
        poolName={selectedPosition?.pool.name}
        tokenId={BigInt((selectedPosition?.clPositionTokenId as string) || '0')}
        gauge={selectedPosition?.pool.gauge?.address as `0x${string}`}
      />
      <IncreaseLiquidityModal
        open={increaseModalOpen}
        onOpenChange={(v) => {
          setIncreaseModalOpen(v);
          if (!v) {
            setTimeout(() => setSelectedPosition(null), 300);
          }
        }}
        position={selectedPosition}
        token0={
          selectedPosition
            ? getAssetInfo(selectedPosition.pool.token0.address as string)
            : undefined
        }
        token1={
          selectedPosition
            ? getAssetInfo(selectedPosition.pool.token1.address as string)
            : undefined
        }
      />
    </div>
  );
};
