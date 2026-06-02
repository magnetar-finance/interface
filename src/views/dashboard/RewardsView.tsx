'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { FancyCard } from '@/components/Card';
import { Table } from '@/components/Table';
import { Skeleton } from '@/components/Skeleton';
import { Pagination } from '@/components/Pagination';
import { GiftIcon, LockIcon, DropletIcon, CoinsIcon } from 'lucide-react';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import { CHAINS_INFORMATION, REFETCH_INTERVALS } from '@/constants';
import { AllPoolsQuery, GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { Address, formatUnits, zeroAddress } from 'viem';
import useRewardTokens from '@/hooks/rewards/useRewardTokens';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { AssetResponseType } from '@/config/github-assets.config';
import useGetRewardEarnings from '@/hooks/rewards/useGetRewardEarnings';
import { formatNumber } from '@/utils';
import usePoolVote from '@/hooks/governance/usePoolVote';
import useCheckEarnings from '@/hooks/gauges/useCheckEarnings';
import useClaimBribes from '@/hooks/rewards/bribes/useClaimBribes';
import useClaimFees from '@/hooks/rewards/fees/useClaimFees';
import { useChainId } from 'wagmi';
import { TransactionSuccessModal } from '@/ui/modals/TransactionSuccessModal';
import { TransactionErrorModal } from '@/ui/modals/TransactionErrorModal';
import { Spinner } from '@/components/Spinner';
import useClaimGaugeRewards from '@/hooks/rewards/useClaimGaugeRewards';

type Lock = NonNullable<GetAccountInfoQuery['user']>['lockPositions'][number];
type LiquidityPosition = NonNullable<GetAccountInfoQuery['user']>['lpPositions'][number];
type Pool = NonNullable<AllPoolsQuery['pools']>[number];

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number | string;
  isLoading: boolean;
}> = ({ icon, title, subtitle, count, isLoading }) => (
  <div className="w-full flex justify-between items-center gap-6">
    <div className="flex items-center gap-3">
      <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-1.5">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <h4 className="text-white font-semibold text-base md:text-lg">{title}</h4>
        <p className="text-[#64748b] text-[10px] font-mono uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
    <span className="text-[#94a3b8] font-mono text-sm">{isLoading ? '-' : count}</span>
  </div>
);

const AssetRewardInfo: React.FC<{
  reward: Address;
  asset: AssetResponseType[number];
  tokenId: bigint;
}> = ({ asset, tokenId, reward }) => {
  const earned = useGetRewardEarnings(reward, asset.address, tokenId);
  return (
    <>
      <span className="font-bold text-[#00ff9d]">
        {formatNumber(formatUnits(earned, asset.decimals))}
      </span>
      <span className="text-[#64748b]">{asset.symbol}</span>
    </>
  );
};

const RewardsColumn: React.FC<{
  reward: Address;
  tokenId: bigint;
  onRenderFinished?: (tokens: Address[]) => void;
}> = ({ reward, tokenId, onRenderFinished }) => {
  const { assetsDictionary } = useGHAssetsContext();
  const rewardTokens = useRewardTokens(reward, REFETCH_INTERVALS);

  useEffect(() => {
    if (onRenderFinished) onRenderFinished(rewardTokens);
  }, [onRenderFinished, rewardTokens]);

  return (
    <div className="flex flex-col items-end gap-1 font-mono text-xs">
      {rewardTokens.map((token, index) => {
        const asset = assetsDictionary[token.toLowerCase()];
        return (
          <div key={index} className="flex items-center gap-1.5">
            {asset ? (
              <AssetRewardInfo key={index} reward={reward} asset={asset} tokenId={tokenId} />
            ) : (
              <span className="text-[#64748b]">Unknown Asset</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── 1. Bribes Rewards Table ───────────────────────────────────────────────────

const RenderedRewardsRow: React.FC<{ lock: Lock; pools: Pool[]; isFees?: boolean }> = ({
  lock,
  pools,
  isFees = false,
}) => {
  const poolsVotedFor = usePoolVote(BigInt(lock.id as string), REFETCH_INTERVALS);
  const poolNames = useMemo(() => {
    return poolsVotedFor.map(
      (pool) =>
        pools.find((p) => (p.address as string).toLowerCase() === pool.toLowerCase())?.name ||
        'Unknown Pool',
    );
  }, [pools, poolsVotedFor]);
  const poolRewards = useMemo(() => {
    return poolsVotedFor.map((pool) => {
      const gauge = pools.find((p) => (p.address as string).toLowerCase() === pool.toLowerCase())
        ?.gauge;
      if (!gauge) return zeroAddress;
      return isFees ? (gauge.feeVotingReward as Address) : (gauge.bribeVotingReward as Address);
    });
  }, [isFees, pools, poolsVotedFor]);

  const [rewardTokens, setRewardTokens] = useState<Address[]>([]);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();

  const claimBribes = useClaimBribes(
    poolRewards,
    [rewardTokens],
    BigInt(lock.id as string),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );
  const claimFees = useClaimFees(
    poolRewards,
    [rewardTokens],
    BigInt(lock.id as string),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateTransaction = useCallback(() => {
    if (isFees) {
      claimFees.execute();
    } else {
      claimBribes.execute();
    }
  }, [claimBribes, claimFees, isFees]);

  return (
    <>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-1.5">
            <LockIcon size={12} className="text-[#2962ff]" />
          </div>
          <span className="font-bold font-mono text-white text-xs">Lock {lock.id}</span>
        </div>
      </td>
      <td className="py-3 pr-4 font-mono text-xs text-white">{poolNames.join(', ')}</td>
      <td className="py-3 pr-4">
        <div className="flex flex-col items-end gap-1 font-mono text-xs">
          {poolRewards.map((reward, index) => (
            <RewardsColumn
              key={index}
              reward={reward}
              tokenId={BigInt(lock.lockId as string)}
              onRenderFinished={setRewardTokens}
            />
          ))}
        </div>
      </td>
      <td className="py-3 text-right">
        <button
          onClick={initiateTransaction}
          className="text-xs font-mono uppercase tracking-widest border border-[#ffaf52]/50 text-[#ffaf52] px-3 py-1.5 hover:bg-[#ffaf52]/10 transition-colors cursor-pointer"
        >
          Claim Bribes{' '}
          {(claimBribes.isLoading || claimFees.isLoading) && <Spinner size="sm" className="ml-2" />}
        </button>
      </td>

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          claimBribes.reset();
          claimFees.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Successfully claimed rewards!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          claimBribes.reset();
          claimFees.reset();
        }}
        message={'An error occurred while claiming rewards. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};

const BribesRewardsTable: React.FC<{ locks: Lock[]; isLoading: boolean; pools: Pool[] }> = ({
  locks,
  isLoading,
  pools,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(locks.length / 10), [locks.length]);
  const paginated = useMemo(
    () => locks.slice((currentPage - 1) * 10, currentPage * 10),
    [locks, currentPage],
  );

  return (
    <FancyCard>
      <div className="flex flex-col gap-4 py-3">
        <SectionHeader
          icon={<CoinsIcon size={14} className="text-[#2962ff]" />}
          title="Bribe Rewards"
          subtitle="Per lock · Earned from voting incentives"
          count={`${locks.length} locks`}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col gap-2 w-full mt-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <Table<Lock>
            headers={[
              { label: 'Lock ID', align: 'left' },
              { label: 'Pools Voted For', align: 'left' },
              { label: 'Yields', align: 'right' },
              { label: 'Actions', align: 'right' },
            ]}
            data={paginated}
            renderRow={(lock) => <RenderedRewardsRow key={lock.id} lock={lock} pools={pools} />}
            renderEmpty={() => (
              <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
                <GiftIcon size={40} color="#64748b" />
                <p className="text-[#64748b] font-mono text-xs text-center">
                  No locks found. Create a lock and vote to earn bribe rewards.
                </p>
              </div>
            )}
          />
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </FancyCard>
  );
};

// ─── 2. Fees Rewards Table ─────────────────────────────────────────────────────

const FeesRewardsTable: React.FC<{ locks: Lock[]; isLoading: boolean; pools: Pool[] }> = ({
  locks,
  isLoading,
  pools,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(locks.length / 10), [locks.length]);
  const paginated = useMemo(
    () => locks.slice((currentPage - 1) * 10, currentPage * 10),
    [locks, currentPage],
  );

  return (
    <FancyCard>
      <div className="flex flex-col gap-4 py-3">
        <SectionHeader
          icon={<CoinsIcon size={14} className="text-[#00ff9d]" />}
          title="Fee Rewards"
          subtitle="Per lock · Earned from protocol trading fees"
          count={`${locks.length} locks`}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col gap-2 w-full mt-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <Table<Lock>
            headers={[
              { label: 'Lock ID', align: 'left' },
              { label: 'Pools Voted For', align: 'left' },
              { label: 'Yields', align: 'right' },
              { label: 'Actions', align: 'right' },
            ]}
            data={paginated}
            renderRow={(lock) => (
              <RenderedRewardsRow key={lock.id} lock={lock} pools={pools} isFees />
            )}
            renderEmpty={() => (
              <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
                <GiftIcon size={40} color="#64748b" />
                <p className="text-[#64748b] font-mono text-xs text-center">
                  No locks found. Create a lock and vote to earn fee rewards.
                </p>
              </div>
            )}
          />
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </FancyCard>
  );
};

// ─── 3. Gauge Rewards Table ────────────────────────────────────────────────────

const RenderGaugeEarningsColumn: React.FC<{ position: LiquidityPosition }> = ({ position }) => {
  const gauge = (position.pool.gauge?.address as Address) || zeroAddress;
  const earnings = useCheckEarnings(gauge, REFETCH_INTERVALS);
  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className="font-bold text-[#00ff9d]">{formatNumber(formatUnits(earnings, 18))}</span>
      <span className="text-[#64748b]">MGN</span>
    </div>
  );
};

const GaugeRewardsTable: React.FC<{ positions: LiquidityPosition[]; isLoading: boolean }> = ({
  positions,
  isLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(positions.length / 10), [positions.length]);
  const paginated = useMemo(
    () => positions.slice((currentPage - 1) * 10, currentPage * 10),
    [positions, currentPage],
  );

  const [selectedGauge, setSelectedGauge] = useState<Address>(zeroAddress);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const { assetsDictionary } = useGHAssetsContext();

  const getAssetInfo = useCallback(
    (address: string) => assetsDictionary[address.toLowerCase()],
    [assetsDictionary],
  );

  const chainId = useChainId();

  const claimGaugeRewards = useClaimGaugeRewards(
    [selectedGauge as Address],
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  return (
    <FancyCard>
      <div className="flex flex-col gap-4 py-3">
        <SectionHeader
          icon={<DropletIcon size={14} className="text-[#2962ff]" />}
          title="Gauge Rewards"
          subtitle="Per position · Earned from staked liquidity"
          count={`${positions.length} positions`}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col gap-2 w-full mt-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <Table<LiquidityPosition>
            headers={[
              { label: 'Pool', align: 'left' },
              { label: 'Reward Rate', align: 'right' },
              { label: 'Earnings', align: 'right' },
              { label: 'Actions', align: 'right' },
            ]}
            data={paginated}
            renderRow={(item) => {
              const token0Info = getAssetInfo(item.pool.token0.address as string);
              const token1Info = getAssetInfo(item.pool.token1.address as string);
              return (
                <>
                  {/* Pool */}
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

                  {/* Reward Rate */}
                  <td className="py-3 pr-4 text-[#00ff9d] font-bold font-mono text-xs text-right">
                    {(item.pool.gauge?.rewardRate as string) || '0'}%
                  </td>

                  <td className="py-3 pr-4 text-right">
                    <RenderGaugeEarningsColumn position={item} />
                  </td>

                  {/* Actions */}
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedGauge(item.pool.gauge?.address as Address);
                        claimGaugeRewards.execute();
                      }}
                      className="text-xs font-mono uppercase tracking-widest border border-[#2962ff]/50 text-[#2962ff] px-3 py-1.5 hover:bg-[#2962ff]/10 transition-colors cursor-pointer"
                    >
                      Claim{' '}
                      {claimGaugeRewards.isLoading &&
                        selectedGauge === item.pool.gauge?.address && (
                          <Spinner size="sm" className="ml-2" />
                        )}
                    </button>
                  </td>
                </>
              );
            }}
            renderEmpty={() => (
              <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
                <DropletIcon size={40} color="#64748b" />
                <p className="text-[#64748b] font-mono text-xs text-center">
                  No staked positions found. Stake your LP tokens in a gauge to earn rewards.
                </p>
              </div>
            )}
          />
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          claimGaugeRewards.reset();
          setSelectedGauge(zeroAddress);
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Successfully claimed rewards!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          claimGaugeRewards.reset();
          setSelectedGauge(zeroAddress);
        }}
        message={'An error occurred while claiming rewards. Please try again.'}
        title="Transaction Failed"
      />
    </FancyCard>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────────

export const RewardsView: React.FC = () => {
  const { data: accountInfo, isLoading } = useAccountInfo(REFETCH_INTERVALS);
  const locks = useMemo(() => accountInfo?.lockPositions ?? [], [accountInfo]);
  const positions = useMemo(() => accountInfo?.lpPositions ?? [], [accountInfo]);
  const pools = useMemo(() => positions.map((pos) => pos.pool), [positions]);

  return (
    <div className="w-full flex flex-col gap-6">
      <BribesRewardsTable
        locks={locks}
        isLoading={isLoading}
        pools={pools.filter((pool) => pool.gauge !== null) as Pool[]}
      />
      <FeesRewardsTable
        locks={locks}
        isLoading={isLoading}
        pools={pools.filter((pool) => pool.gauge !== null) as Pool[]}
      />
      <GaugeRewardsTable
        positions={positions.filter((position) => position.pool.gauge !== null)}
        isLoading={isLoading}
      />
    </div>
  );
};
