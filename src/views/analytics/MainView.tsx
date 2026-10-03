'use client';

import React, { useMemo, useState } from 'react';
import { Pagination } from '@/components/Pagination';
import { ExternalLinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/Table';
import { Skeleton } from '@/components/Skeleton';
import {
  type Timeframe,
  TimeSeriesChart,
  type TimeSeriesDataPoint,
} from '@/ui/charts/TimeSeriesChart';
import { VolumeBarChart } from '@/ui/charts/VolumeBarChart';
import { type TxType } from '@/utils/mock-data';
import { formatNumber } from '@/utils/numbers';
import { PageHeader } from '@/components/PageHeader';
import useOverallDayData from '@/hooks/api/useOverallDayData';
import { CHAINS_INFORMATION, OP_SETTINGS, REFETCH_INTERVALS } from '@/constants';
import useAllPools from '@/hooks/api/useAllPools';
import useAllTokens from '@/hooks/api/useAllTokens';
import { AllTransactionsQuery, PoolType } from '@/gql/codegen/graphql';
import useAllTransactions from '@/hooks/api/useAllTransactions';
import { useChainId } from 'wagmi';
import moment from 'moment';
import { splitString } from '@/utils';
import useStatistics from '@/hooks/api/useStatistics';

function parseQLDate(n: number) {
  return new Date(n * 1000);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TX_COLORS: Record<TxType, string> = {
  Swap: 'text-accent bg-accent/10 border-accent/30',
  Add: 'text-accent-2 bg-accent-2/10 border-accent-2/30',
  Remove: 'text-warning bg-warning/10 border-warning/30',
};

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  STABLE: 'text-accent bg-accent/10',
  VOLATILE: 'text-warning bg-warning/10',
  CONCENTRATED: 'text-accent bg-accent/10',
};

type MergedTransaction = {
  amount0: string;
  amount1: string;
  token0: NonNullable<
    AllTransactionsQuery['transactions'][number]['mints'][number]['pool']['token0']
  >;
  token1: NonNullable<
    AllTransactionsQuery['transactions'][number]['mints'][number]['pool']['token0']
  >;
  amountUSD: string;
  transactionHash: string;
  transactionType: TxType;
  from: string;
  to: string;
  timestamp: number;
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

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-4 flex items-center gap-2">
    <span className="font-mono text-[11px] text-accent">›</span>
    <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
    <div className="h-px flex-1 bg-gradient-to-r from-accent/25 to-transparent" />
  </div>
);

// ─── Main View ────────────────────────────────────────────────────────────────

export const AnalyticsMainView: React.FC = () => {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/purity
  const todayInSeconds = useMemo(() => Math.floor(Date.now() / 1000 / 60) * 60, []);

  // Overall statistics
  const { data: statistics, isLoading: isStatisticsLoading } = useStatistics(REFETCH_INTERVALS);

  // Overall day data
  const { data: overallDayData7Days, isLoading: isLoading7D } = useOverallDayData(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
    todayInSeconds - 604800,
    todayInSeconds,
  );
  const { data: overallDayData30Days, isLoading: isLoading30D } = useOverallDayData(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
    todayInSeconds - 2592000,
    todayInSeconds,
  );
  const { data: overallDayData1Year, isLoading: isLoading1Y } = useOverallDayData(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
    todayInSeconds - 31536000,
    todayInSeconds,
  );

  // Pools
  const { data: pools, isLoading: isLoadingPools } = useAllPools(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );
  const sortedPools = useMemo(
    () =>
      pools
        .slice()
        .sort((a, b) => parseFloat(b.reserveUSD as string) - parseFloat(a.reserveUSD as string)),
    [pools],
  );
  const [poolsPage, setPoolsPage] = useState(1);
  const POOLS_PER_PAGE = 10;
  const totalPoolPages = useMemo(
    () => Math.max(1, Math.ceil(sortedPools.length / POOLS_PER_PAGE)),
    [sortedPools.length],
  );
  const topPools = useMemo(
    () => sortedPools.slice((poolsPage - 1) * POOLS_PER_PAGE, poolsPage * POOLS_PER_PAGE),
    [sortedPools, poolsPage],
  );

  // Tokens
  const { data: tokens, isLoading: isLoadingTokens } = useAllTokens(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );
  const sortedTokens = useMemo(
    () =>
      tokens
        .slice()
        .sort(
          (a, b) =>
            parseFloat(b.totalLiquidityUSD as string) - parseFloat(a.totalLiquidityUSD as string),
        ),
    [tokens],
  );
  const [tokensPage, setTokensPage] = useState(1);
  const TOKENS_PER_PAGE = 10;
  const totalTokenPages = useMemo(
    () => Math.max(1, Math.ceil(sortedTokens.length / TOKENS_PER_PAGE)),
    [sortedTokens.length],
  );
  const topTokens = useMemo(
    () => sortedTokens.slice((tokensPage - 1) * TOKENS_PER_PAGE, tokensPage * TOKENS_PER_PAGE),
    [sortedTokens, tokensPage],
  );

  // Transactions
  const { data: transactions, isLoading: isLoadingTxns } = useAllTransactions(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );
  // Merged transactions
  const mergedTransactions = useMemo(() => {
    const merges: MergedTransaction[] = [];

    for (const transaction of transactions) {
      // Loop through for mints
      for (const mint of transaction.mints) {
        const mergedTransaction: MergedTransaction = {} as MergedTransaction;
        mergedTransaction.amount0 = parseFloat(mint.amount0 as string).toFixed(3);
        mergedTransaction.amount1 = parseFloat(mint.amount1 as string).toFixed(3);
        mergedTransaction.amountUSD = parseFloat(mint.amountUSD as string).toFixed(3);
        mergedTransaction.from = (mint.sender as string) || '';
        mergedTransaction.to = mint.to as string;
        mergedTransaction.timestamp = parseInt(mint.timestamp as string) * 1000;
        mergedTransaction.transactionHash = transaction.hash as string;
        mergedTransaction.transactionType = 'Add';
        mergedTransaction.token0 = mint.pool.token0;
        mergedTransaction.token1 = mint.pool.token1;
        merges.push(mergedTransaction);
      }

      // Loop through for swaps
      for (const swap of transaction.swaps) {
        const mergedTransaction: MergedTransaction = {} as MergedTransaction;
        mergedTransaction.amount0 = (
          parseFloat(swap.amount0In as string) + parseFloat(swap.amount0Out as string)
        ).toFixed(3);
        mergedTransaction.amount1 = (
          parseFloat(swap.amount1In as string) + parseFloat(swap.amount1Out as string)
        ).toFixed(3);
        mergedTransaction.amountUSD = parseFloat(swap.amountUSD as string).toFixed(3);
        mergedTransaction.from = (swap.from as string) || '';
        mergedTransaction.to = swap.to as string;
        mergedTransaction.timestamp = parseInt(swap.timestamp as string) * 1000;
        mergedTransaction.transactionHash = transaction.hash as string;
        mergedTransaction.transactionType = 'Swap';
        mergedTransaction.token0 = swap.pool.token0;
        mergedTransaction.token1 = swap.pool.token1;
        merges.push(mergedTransaction);
      }

      for (const burn of transaction.burns) {
        const mergedTransaction: MergedTransaction = {} as MergedTransaction;
        mergedTransaction.amount0 = parseFloat(burn.amount0 as string).toFixed(3);
        mergedTransaction.amount1 = parseFloat(burn.amount1 as string).toFixed(3);
        mergedTransaction.amountUSD = parseFloat(burn.amountUSD as string).toFixed(3);
        mergedTransaction.from = (burn.sender as string) || '';
        mergedTransaction.to = burn.to as string;
        mergedTransaction.timestamp = parseInt(burn.timestamp as string) * 1000;
        mergedTransaction.transactionHash = transaction.hash as string;
        mergedTransaction.transactionType = 'Remove';
        mergedTransaction.token0 = burn.pool.token0;
        mergedTransaction.token1 = burn.pool.token1;
        merges.push(mergedTransaction);
      }
    }

    // Sort by timestamps
    return merges.sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(
    () => Math.ceil(mergedTransactions.length / 20),
    [mergedTransactions.length],
  );

  const tvlSeries: Partial<Record<Timeframe, TimeSeriesDataPoint[]>> = useMemo(() => {
    return {
      '7D': overallDayData7Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.liquidityUSD as string),
        };
      }),
      '30D': overallDayData30Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.liquidityUSD as string),
        };
      }),
      '1Y': overallDayData1Year.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.liquidityUSD as string),
        };
      }),
    };
  }, [overallDayData1Year, overallDayData30Days, overallDayData7Days]);

  const volumeSeries: Partial<Record<Timeframe, TimeSeriesDataPoint[]>> = useMemo(() => {
    return {
      '7D': overallDayData7Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.totalTradeVolumeUSD as string),
        };
      }),
      '30D': overallDayData30Days.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.totalTradeVolumeUSD as string),
        };
      }),
      '1Y': overallDayData1Year.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.totalTradeVolumeUSD as string),
        };
      }),
    };
  }, [overallDayData1Year, overallDayData30Days, overallDayData7Days]);

  const chainId = useChainId();

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        subtitle="Protocol-wide metrics, pools & token data"
        chips={[{ label: 'Live', color: 'green' }]}
      />

      {/* ── Hero Metrics ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3">
        {isStatisticsLoading ? (
          <>
            <Skeleton className="h-22.5 flex-1 min-w-50" />
            <Skeleton className="h-22.5 flex-1 min-w-50" />
            <Skeleton className="h-22.5 flex-1 min-w-50" />
            <Skeleton className="h-22.5 flex-1 min-w-50" />
          </>
        ) : (
          <>
            <StatCard
              label="Protocol TVL"
              value={`${
                statistics
                  ? formatNumber(statistics.totalVolumeLockedUSD as string, 'en-US', 2, true)
                  : '0.00'
              }`}
            />
            <StatCard
              label="Volume"
              value={`${
                statistics
                  ? formatNumber(statistics.totalTradeVolumeUSD as string, 'en-US', 2, true)
                  : '0.00'
              }`}
            />
            <StatCard label="Total Pools" value={String(pools.length)} />
            <StatCard
              label="Total Txns"
              value={statistics ? formatNumber(statistics.txCount as string, 'en-US', 0) : '0'}
            />
          </>
        )}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <SectionHeader title="TVL" />
          {isLoading1Y || isLoading7D || isLoading30D ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <TimeSeriesChart data={tvlSeries} color="#2660f5" height={180} />
          )}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <SectionHeader title="Volume" />
          {isLoading1Y || isLoading7D || isLoading30D ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <VolumeBarChart data={volumeSeries} height={180} />
          )}
        </div>
      </div>

      {/* ── Top Pools ──────────────────────────────────────────────────── */}
      <div className="relative overflow-x-auto rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <SectionHeader title="Top Pools" />
        {isLoadingPools ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <Table<(typeof topPools)[number]>
              headers={[
                { label: '#', align: 'left' },
                { label: 'Pool', align: 'left' },
                { label: 'Type', align: 'left' },
                { label: 'TVL', align: 'right' },
                { label: 'Vol', align: 'right' },
                { label: 'Fees', align: 'right' },
              ]}
              data={topPools}
              onRowClick={(pool) => router.push(`/analytics/pools/${encodeURIComponent(pool.id)}`)}
              renderRow={(pool, i) => (
                <>
                  <td className="py-3 pr-4 pl-3 text-dim font-mono">
                    {(poolsPage - 1) * POOLS_PER_PAGE + i + 1}
                  </td>
                  <td className="py-3 pr-4 text-foreground font-bold">{pool.name}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase ${
                        POOL_TYPE_COLORS[pool.poolType]
                      }`}
                    >
                      {pool.poolType.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-foreground font-mono">
                    {formatNumber(pool.reserveUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-muted font-mono">
                    {formatNumber(pool.volumeUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-accent font-mono">
                    {formatNumber(pool.totalFeesUSD as string, 'en-US', 2, true)}
                  </td>
                </>
              )}
            />
            {totalPoolPages > 1 && (
              <div className="mt-4 flex justify-end">
                <Pagination
                  currentPage={poolsPage}
                  onPageChange={setPoolsPage}
                  totalPages={totalPoolPages}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Top Tokens ─────────────────────────────────────────────────── */}
      <div className="relative overflow-x-auto rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <SectionHeader title="Top Tokens" />
        {isLoadingTokens ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <Table<(typeof topTokens)[number]>
              headers={[
                { label: '#', align: 'left' },
                { label: 'Token', align: 'left' },
                { label: 'Price', align: 'right' },
                { label: 'Vol', align: 'right' },
                { label: 'TVL', align: 'right' },
              ]}
              data={topTokens}
              onRowClick={(token) =>
                router.push(`/analytics/token/${encodeURIComponent(token.id)}`)
              }
              renderRow={(token, i) => (
                <>
                  <td className="py-3 pr-4 pl-3 text-dim font-mono">
                    {(tokensPage - 1) * TOKENS_PER_PAGE + i + 1}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-foreground font-bold">{token.symbol}</span>
                    <span className="text-dim ml-2 text-[10px]">{token.name}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-foreground font-mono">
                    ${formatNumber(token.derivedUSD as string, 'en-US', 2)}
                  </td>
                  <td className="py-3 pr-4 text-right text-muted font-mono">
                    {formatNumber(token.tradeVolumeUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-muted font-mono">
                    {formatNumber(token.totalLiquidityUSD as string, 'en-US', 2, true)}
                  </td>
                </>
              )}
            />
            {totalTokenPages > 1 && (
              <div className="mt-4 flex justify-end">
                <Pagination
                  currentPage={tokensPage}
                  onPageChange={setTokensPage}
                  totalPages={totalTokenPages}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Live Transactions ──────────────────────────────────────────── */}
      <div className="relative mb-8 overflow-x-auto rounded-2xl border border-white/[0.07] bg-surface/80 p-4 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <SectionHeader title="Recent Transactions" />
        {isLoadingTxns ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <Table<MergedTransaction>
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
