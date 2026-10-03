'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/Table';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/Skeleton';
import {
  TimeSeriesChart,
  type Timeframe,
  type TimeSeriesDataPoint,
} from '@/ui/charts/TimeSeriesChart';
import { VolumeBarChart } from '@/ui/charts/VolumeBarChart';
import { type TxType } from '@/utils/mock-data';
import { formatNumber } from '@/utils/numbers';
import { PoolType } from '@/gql/codegen/graphql';
import useSinglePool from '@/hooks/api/useSinglePool';
import usePoolDayData from '@/hooks/api/usePoolDayData';
import { CHAINS_INFORMATION, OP_SETTINGS, REFETCH_INTERVALS } from '@/constants';
import useAllTransactions from '@/hooks/api/useAllTransactions';
import { useChainId } from 'wagmi';
import moment from 'moment';
import { splitString } from '@/utils';
import usePoolHourlyData from '@/hooks/api/usePoolHourlyData';

function parseQLDate(n: number) {
  return new Date(n * 1000);
}

const TX_COLORS: Record<TxType | string, string> = {
  Swap: 'text-accent bg-accent/10 border-accent/30',
  Add: 'text-accent-2 bg-accent-2/10 border-accent-2/30',
  Remove: 'text-warning bg-warning/10 border-warning/30',
};

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  STABLE: 'text-accent bg-accent/10',
  VOLATILE: 'text-warning bg-warning/10',
  CONCENTRATED: 'text-accent bg-accent/10',
};

const StatCard: React.FC<{ label: string; value: string; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="group relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-md transition-colors hover:border-accent/25">
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
    <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    {sub && <p className="mt-1.5 font-mono text-[11px] text-dim">{sub}</p>}
  </div>
);

// ─── Pool Analytics View ──────────────────────────────────────────────────────

export const PoolAnalyticsView: React.FC<{ poolId: string }> = ({ poolId }) => {
  const router = useRouter();
  const decodedId = decodeURIComponent(poolId);
  const chainId = useChainId();
  // eslint-disable-next-line react-hooks/purity
  const todayInSeconds = useMemo(() => Math.floor(Date.now() / 1000 / 60) * 60, []);

  // Single Pool
  const { data: pool, isLoading: isPoolLoading } = useSinglePool(decodedId, REFETCH_INTERVALS);

  // Pool Day Datas
  const { data: poolDayData1Day, isLoading: isLoading1D } = usePoolHourlyData(
    decodedId,
    0,
    OP_SETTINGS.default_gql_items_limit,
    todayInSeconds - 86400,
    todayInSeconds,
    REFETCH_INTERVALS,
  );
  const { data: poolDayData7Days, isLoading: isLoading7D } = usePoolDayData(
    decodedId,
    0,
    OP_SETTINGS.default_gql_items_limit,
    todayInSeconds - 604800,
    todayInSeconds,
    REFETCH_INTERVALS,
  );
  const { data: poolDayData30Days, isLoading: isLoading30D } = usePoolDayData(
    decodedId,
    0,
    OP_SETTINGS.default_gql_items_limit,
    todayInSeconds - 2592000,
    todayInSeconds,
    REFETCH_INTERVALS,
  );
  const { data: poolDayData1Year, isLoading: isLoading1Y } = usePoolDayData(
    decodedId,
    0,
    OP_SETTINGS.default_gql_items_limit,
    todayInSeconds - 31536000,
    todayInSeconds,
    REFETCH_INTERVALS,
  );

  // Transactions
  const { data: allTransactions, isLoading: isLoadingTxns } = useAllTransactions(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );

  const mergedTransactions = useMemo(() => {
    const merges = [];

    for (const transaction of allTransactions) {
      // Loop through for mints
      for (const mint of transaction.mints) {
        if (mint.pool.id === decodedId) {
          merges.push({
            amount0: parseFloat(mint.amount0 as string).toFixed(3),
            amount1: parseFloat(mint.amount1 as string).toFixed(3),
            amountUSD: parseFloat(mint.amountUSD as string).toFixed(3),
            from: (mint.sender as string) || '',
            to: mint.to as string,
            timestamp: parseInt(mint.timestamp as string) * 1000,
            transactionHash: transaction.hash as string,
            transactionType: 'Add',
            token0: mint.pool.token0,
            token1: mint.pool.token1,
          });
        }
      }

      // Loop through for swaps
      for (const swap of transaction.swaps) {
        if (swap.pool.id === decodedId) {
          merges.push({
            amount0: (
              parseFloat(swap.amount0In as string) + parseFloat(swap.amount0Out as string)
            ).toFixed(3),
            amount1: (
              parseFloat(swap.amount1In as string) + parseFloat(swap.amount1Out as string)
            ).toFixed(3),
            amountUSD: parseFloat(swap.amountUSD as string).toFixed(3),
            from: (swap.from as string) || '',
            to: swap.to as string,
            timestamp: parseInt(swap.timestamp as string) * 1000,
            transactionHash: transaction.hash as string,
            transactionType: 'Swap',
            token0: swap.pool.token0,
            token1: swap.pool.token1,
          });
        }
      }

      // Loop through for burns
      for (const burn of transaction.burns) {
        if (burn.pool.id === decodedId) {
          merges.push({
            amount0: parseFloat(burn.amount0 as string).toFixed(3),
            amount1: parseFloat(burn.amount1 as string).toFixed(3),
            amountUSD: parseFloat(burn.amountUSD as string).toFixed(3),
            from: (burn.sender as string) || '',
            to: burn.to as string,
            timestamp: parseInt(burn.timestamp as string) * 1000,
            transactionHash: transaction.hash as string,
            transactionType: 'Remove',
            token0: burn.pool.token0,
            token1: burn.pool.token1,
          });
        }
      }
    }

    // Sort by timestamps
    return merges.sort((a, b) => b.timestamp - a.timestamp);
  }, [allTransactions, decodedId]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(
    () => Math.ceil(mergedTransactions.length / 20),
    [mergedTransactions.length],
  );

  const tvlSeries: Record<Timeframe, TimeSeriesDataPoint[]> = useMemo(() => {
    return {
      '1D': poolDayData1Day.map((o) => {
        const date = parseQLDate(o.hourStartUnix);
        return {
          date: `${date.getHours()}:00`,
          value: parseFloat(o.reserveUSD as string),
        };
      }),
      '7D': poolDayData7Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.reserveUSD as string),
        };
      }),
      '30D': poolDayData30Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.reserveUSD as string),
        };
      }),
      '1Y': poolDayData1Year.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.reserveUSD as string),
        };
      }),
    };
  }, [poolDayData1Day, poolDayData1Year, poolDayData30Days, poolDayData7Days]);

  const volSeries: Record<Timeframe, TimeSeriesDataPoint[]> = useMemo(() => {
    return {
      '1D': poolDayData1Day.map((o) => {
        const date = parseQLDate(o.hourStartUnix);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })} ${date.getHours()}:00`,
          value: parseFloat(o.hourlyVolumeUSD as string),
        };
      }),
      '7D': poolDayData7Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.dailyVolumeUSD as string),
        };
      }),
      '30D': poolDayData30Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.dailyVolumeUSD as string),
        };
      }),
      '1Y': poolDayData1Year.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.dailyVolumeUSD as string),
        };
      }),
    };
  }, [poolDayData1Day, poolDayData1Year, poolDayData30Days, poolDayData7Days]);

  if (isPoolLoading || !pool) {
    return (
      <div className="w-full flex flex-col gap-8">
        <Skeleton className="w-32 h-6 mb-4" />
        <Skeleton className="w-full h-20 mb-4" />
        <div className="flex flex-col md:flex-row flex-wrap gap-3">
          <Skeleton className="h-22.5 flex-1 min-w-50" />
          <Skeleton className="h-22.5 flex-1 min-w-50" />
          <Skeleton className="h-22.5 flex-1 min-w-50" />
          <Skeleton className="h-22.5 flex-1 min-w-50" />
        </div>
      </div>
    );
  }

  const apr = pool.gauge?.rewardRate ? parseFloat(pool.gauge.rewardRate as string) : 0;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Back link */}
      <button
        onClick={() => router.push('/analytics')}
        className="flex items-center gap-2 text-muted hover:text-accent transition-colors group w-fit"
      >
        <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Analytics</span>
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold tracking-wide uppercase">
              {pool.name}
            </h1>
            <span
              className={`text-xs px-2 py-0.5 font-mono font-bold uppercase ${
                POOL_TYPE_COLORS[pool.poolType as PoolType]
              } bg-white/5 border border-white/10`}
            >
              {pool.poolType.toLowerCase()}
            </span>
          </div>
          <p className="text-muted font-mono text-xs mt-1 flex items-center gap-1">
            <a
              href={CHAINS_INFORMATION[chainId].explorerUrl + '/address/' + pool.address}
              target="_blank"
            >
              {pool.address as string}
              <ExternalLinkIcon size={10} />
            </a>
          </p>
        </div>
        <Link
          href={`/liquidity/deposit?token0=${pool.token0.address}&token1=${pool.token1.address}&poolType=${pool.poolType}`}
          className="ml-auto px-4 py-2 bg-accent/20 border border-accent/50 text-accent text-xs font-mono font-bold hover:bg-accent/30 transition-colors whitespace-nowrap"
        >
          + Add Liquidity
        </Link>
      </div>

      {/* Key metrics */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3">
        <StatCard label="TVL" value={formatNumber(pool.reserveUSD as string, 'en-US', 2, true)} />
        <StatCard label="Vol" value={formatNumber(pool.volumeUSD as string, 'en-US', 2, true)} />
        <StatCard
          label="Fees"
          value={formatNumber(pool.totalFeesUSD as string, 'en-US', 2, true)}
        />
        <StatCard label="APR" value={`${formatNumber(apr, 'en-US', 2)}%`} sub="Current epoch" />
        <StatCard label="Txns" value={formatNumber(pool.txCount as string, 'en-US', 0)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <span className="font-mono text-accent">›</span> TVL
          </p>
          {isLoading1D || isLoading7D || isLoading30D || isLoading1Y ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <TimeSeriesChart data={tvlSeries} color="#2660f5" height={180} />
          )}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <span className="font-mono text-accent">›</span> Volume
          </p>
          {isLoading1D || isLoading7D || isLoading30D || isLoading1Y ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <VolumeBarChart data={volSeries} height={180} />
          )}
        </div>
      </div>

      {/* Pool ratio */}
      <div className="relative rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <span className="font-mono text-accent">›</span> Pool Composition
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-4 text-sm font-mono">
          <div className="flex-1">
            <p className="text-muted text-xs mb-1">{pool.token0.symbol}</p>
            <p className="text-foreground font-bold text-xl">
              {formatNumber(pool.reserve0 as string, 'en-US', 2)}
            </p>
            <p className="text-muted text-xs">
              1 {pool.token0.symbol} ={' '}
              {parseFloat(pool.token1Price as string) < 0.001
                ? parseFloat(pool.token1Price as string).toExponential(2)
                : parseFloat(pool.token1Price as string).toFixed(4)}{' '}
              {pool.token1.symbol}
            </p>
          </div>
          <div className="h-px md:w-px md:h-auto bg-white/10" />
          <div className="flex-1">
            <p className="text-muted text-xs mb-1">{pool.token1.symbol}</p>
            <p className="text-foreground font-bold text-xl">
              {formatNumber(pool.reserve1 as string, 'en-US', 2)}
            </p>
            <p className="text-muted text-xs">
              1 {pool.token1.symbol} ={' '}
              {parseFloat(pool.token0Price as string) < 0.001
                ? parseFloat(pool.token0Price as string).toExponential(2)
                : parseFloat(pool.token0Price as string).toFixed(4)}{' '}
              {pool.token0.symbol}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="relative mb-8 overflow-x-auto rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <span className="font-mono text-accent">›</span> Transactions
        </p>

        {isLoadingTxns ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : mergedTransactions.length === 0 ? (
          <p className="text-muted font-mono text-xs py-4 text-center">
            No recent transactions for this pool
          </p>
        ) : (
          <>
            <Table<(typeof mergedTransactions)[number]>
              headers={[
                { label: 'Type', align: 'left' },
                { label: 'Pair', align: 'left' },
                { label: 'Amount', align: 'right' },
                { label: 'From', align: 'right' },
                { label: 'To', align: 'right' },
                { label: 'Time', align: 'right' },
                { label: 'Transaction', align: 'right' },
              ]}
              data={mergedTransactions.slice((currentPage - 1) * 20, currentPage * 20)}
              renderRow={(tx) => {
                const explorerUrl = CHAINS_INFORMATION[chainId].explorerUrl;
                return (
                  <>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 border text-[10px] uppercase ${
                          TX_COLORS[tx.transactionType]
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted">
                      {tx.token0.symbol} / {tx.token1.symbol}
                    </td>
                    <td className="py-2 pr-4 text-right text-foreground">
                      ${formatNumber(tx.amountUSD, 'en-US', 0)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <a href={`${explorerUrl}/address/${tx.from}`} target="_blank">
                        <span className="text-accent flex items-center justify-end gap-1">
                          {splitString(tx.from)}
                          <ExternalLinkIcon size={10} />
                        </span>
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <a href={`${explorerUrl}/address/${tx.to}`} target="_blank">
                        <span className="text-accent flex items-center justify-end gap-1">
                          {splitString(tx.to)}
                          <ExternalLinkIcon size={10} />
                        </span>
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-right text-muted">
                      {moment(tx.timestamp).fromNow()}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <a href={`${explorerUrl}/tx/${tx.transactionHash}`} target="_blank">
                        <span className="text-accent flex items-center justify-end gap-1">
                          {splitString(tx.transactionHash)}
                          <ExternalLinkIcon size={10} />
                        </span>
                      </a>
                    </td>
                  </>
                );
              }}
            />
            <div className="mt-6 flex justify-end items-center">
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
