'use client';

import React, { useMemo, useState } from 'react';
import { FancyCard } from '@/components/Card';
import { Table } from '@/components/Table';
import { Skeleton } from '@/components/Skeleton';
import { Pagination } from '@/components/Pagination';
import { GiftIcon, LockIcon, DropletIcon, CoinsIcon } from 'lucide-react';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import { REFETCH_INTERVALS } from '@/constants';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { formatNumber } from '@/utils/numbers';
import { useAtomicDate } from '@/hooks/app';

type Lock = NonNullable<GetAccountInfoQuery['user']>['lockPositions'][number];
type LiquidityPosition = NonNullable<GetAccountInfoQuery['user']>['lpPositions'][number];

// ─── Status Badge (shared) ─────────────────────────────────────────────────────

const WEEK_IN_SECS = 60 * 60 * 24 * 7;

const StatusBadge: React.FC<{ unlockTime: Lock['unlockTime'] }> = ({ unlockTime }) => {
  const expiry = parseInt(unlockTime as string);
  const date = useAtomicDate(5000);
  const now = useMemo(() => Math.floor(date.getTime() / 1000), [date]);

  const style = useMemo(() => {
    if (expiry > now && expiry - now <= WEEK_IN_SECS)
      return 'bg-[#ffaf52]/10 text-[#ffaf52] border-[#ffaf52]/30';
    if (now < expiry) return 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30';
    return 'bg-white/5 text-[#64748b] border-white/10';
  }, [expiry, now]);

  const status = useMemo(() => {
    if (expiry > now && expiry - now <= WEEK_IN_SECS) return 'EXPIRING';
    if (now < expiry) return 'ACTIVE';
    return 'EXPIRED';
  }, [expiry, now]);

  return (
    <span
      className={`text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${style}`}
    >
      {status}
    </span>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

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

// ─── 1. Bribes Rewards Table ───────────────────────────────────────────────────

const BribesRewardsTable: React.FC<{ locks: Lock[]; isLoading: boolean }> = ({
  locks,
  isLoading,
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
              { label: 'Lock', align: 'left' },
              { label: 'Locked Amount', align: 'right' },
              { label: 'Voting Power', align: 'right' },
              { label: 'Status', align: 'center' },
              { label: 'Actions', align: 'right' },
            ]}
            data={paginated}
            renderRow={(lock) => (
              <>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-1.5">
                      <LockIcon size={12} className="text-[#2962ff]" />
                    </div>
                    <span className="font-bold font-mono text-white text-xs">Lock {lock.id}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-mono text-xs text-white font-bold">
                  {formatNumber(lock.position as string, 'en-US', 3)} MGN
                </td>
                <td className="py-3 pr-4 text-right font-mono text-xs font-bold text-[#2962ff]">
                  {formatNumber(lock.totalVoteWeightGiven as string, 'en-US', 3)} veMGN
                </td>
                <td className="py-3 pr-4 text-center">
                  <StatusBadge unlockTime={lock.unlockTime} />
                </td>
                <td className="py-3 text-right">
                  <button className="text-xs font-mono uppercase tracking-widest border border-[#ffaf52]/50 text-[#ffaf52] px-3 py-1.5 hover:bg-[#ffaf52]/10 transition-colors cursor-pointer">
                    Claim Bribes
                  </button>
                </td>
              </>
            )}
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

const FeesRewardsTable: React.FC<{ locks: Lock[]; isLoading: boolean }> = ({
  locks,
  isLoading,
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
              { label: 'Lock', align: 'left' },
              { label: 'Locked Amount', align: 'right' },
              { label: 'Voting Power', align: 'right' },
              { label: 'Status', align: 'center' },
              { label: 'Actions', align: 'right' },
            ]}
            data={paginated}
            renderRow={(lock) => (
              <>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="border border-[#00ff9d]/20 bg-[#00ff9d]/5 p-1.5">
                      <LockIcon size={12} className="text-[#00ff9d]" />
                    </div>
                    <span className="font-bold font-mono text-white text-xs">Lock {lock.id}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-mono text-xs text-white font-bold">
                  {formatNumber(lock.position as string, 'en-US', 3)} MGN
                </td>
                <td className="py-3 pr-4 text-right font-mono text-xs font-bold text-[#2962ff]">
                  {formatNumber(lock.totalVoteWeightGiven as string, 'en-US', 3)} veMGN
                </td>
                <td className="py-3 pr-4 text-center">
                  <StatusBadge unlockTime={lock.unlockTime} />
                </td>
                <td className="py-3 text-right">
                  <button className="text-xs font-mono uppercase tracking-widest border border-[#00ff9d]/50 text-[#00ff9d] px-3 py-1.5 hover:bg-[#00ff9d]/10 transition-colors cursor-pointer">
                    Claim Fees
                  </button>
                </td>
              </>
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

const POOL_TYPE_COLORS: Record<string, string> = {
  STABLE: 'text-[#00ff9d] bg-[#00ff9d]/10',
  VOLATILE: 'text-[#ffaf52] bg-[#ffaf52]/10',
  CONCENTRATED: 'text-[#2962ff] bg-[#2962ff]/10',
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
              { label: 'Actions', align: 'right' },
            ]}
            data={paginated}
            renderRow={(item) => (
              <>
                {/* Pool */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="-space-x-3 flex">
                      <div className="w-6 h-6 rounded-full border border-black bg-amber-100" />
                      <div className="w-6 h-6 rounded-full border border-black bg-blue-100" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-bold text-white text-xs uppercase whitespace-nowrap">
                        {item.pool.name}
                      </h3>
                      <span
                        className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 hidden sm:inline-block ${
                          POOL_TYPE_COLORS[item.pool.poolType]
                        }`}
                      >
                        {item.pool.poolType.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Reward Rate */}
                <td className="py-3 pr-4 text-[#00ff9d] font-bold font-mono text-xs text-right">
                  {(item.pool.gauge?.rewardRate as string) || '0'}%
                </td>

                {/* Actions */}
                <td className="py-3 text-right">
                  <button className="text-xs font-mono uppercase tracking-widest border border-[#2962ff]/50 text-[#2962ff] px-3 py-1.5 hover:bg-[#2962ff]/10 transition-colors cursor-pointer">
                    Claim
                  </button>
                </td>
              </>
            )}
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
    </FancyCard>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────────

export const RewardsView: React.FC = () => {
  const { data: accountInfo, isLoading } = useAccountInfo(REFETCH_INTERVALS);
  const locks = useMemo(() => accountInfo?.lockPositions ?? [], [accountInfo]);
  const positions = useMemo(() => accountInfo?.lpPositions ?? [], [accountInfo]);

  return (
    <div className="w-full flex flex-col gap-6">
      <BribesRewardsTable locks={locks} isLoading={isLoading} />
      <FeesRewardsTable locks={locks} isLoading={isLoading} />
      <GaugeRewardsTable positions={positions} isLoading={isLoading} />
    </div>
  );
};
