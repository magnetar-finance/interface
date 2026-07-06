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
  Swap: 'text-[#2962ff] bg-[#2962ff]/10 border-[#2962ff]/30',
  Add: 'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30',
  Remove: 'text-[#ffaf52] bg-[#ffaf52]/10 border-[#ffaf52]/30',
};

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  STABLE: 'text-[#2962ff] bg-[#2962ff]/10',
  VOLATILE: 'text-[#ffaf52] bg-[#ffaf52]/10',
  CONCENTRATED: 'text-[#2962ff] bg-[#2962ff]/10',
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
  <div className="flex-1 min-w-0 bg-[#131525]/80 backdrop-blur-md border border-[#2962ff]/15 p-4 relative overflow-hidden group hover:border-[#2962ff]/40 hover:shadow-[0_0_30px_rgba(41,98,255,0.1)] transition-all duration-300 rounded-xl">
    {/* Top accent */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#2962ff]/70 via-[#2962ff]/20 to-transparent" />
    {/* Corner brackets */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/60 rounded-tl-xl" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-[#2962ff]/20 rounded-br-xl" />
    <p className="text-[#475569] text-[9px] font-bold uppercase tracking-[0.15em] mb-2 font-sans">
      {label}
    </p>
    <p className="text-white font-mono text-2xl font-bold tracking-wide group-hover:text-[#f8fafc] transition-colors">
      {value}
    </p>
    {sub && <p className="text-[#475569] text-[10px] font-mono mt-1.5 tracking-wider">{sub}</p>}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-[#2962ff]/60 font-mono text-[10px]">&gt;</span>
    <h3 className="text-[#f8fafc] text-[10px] font-bold uppercase tracking-[0.15em] font-sans">
      {title}
    </h3>
    <div className="flex-1 h-px bg-gradient-to-r from-[#2962ff]/30 to-transparent" />
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
        <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/10 p-4 relative overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/60 via-[#2962ff]/20 to-transparent" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/50 rounded-tl-xl" />
          <SectionHeader title="TVL" />
          {isLoading1Y || isLoading7D || isLoading30D ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <TimeSeriesChart data={tvlSeries} color="#2962ff" height={180} />
          )}
        </div>
        <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/10 p-4 relative overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/50 via-[#2962ff]/15 to-transparent" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/40 rounded-tl-xl" />
          <SectionHeader title="Volume" />
          {isLoading1Y || isLoading7D || isLoading30D ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <VolumeBarChart data={volumeSeries} height={180} />
          )}
        </div>
      </div>

      {/* ── Top Pools ──────────────────────────────────────────────────── */}
      <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/10 p-4 overflow-x-auto relative rounded-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/60 via-[#2962ff]/20 to-transparent" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/50 rounded-tl-xl" />
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
                  <td className="py-3 pr-4 pl-3 text-[#475569] font-mono">
                    {(poolsPage - 1) * POOLS_PER_PAGE + i + 1}
                  </td>
                  <td className="py-3 pr-4 text-white font-bold">{pool.name}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase ${
                        POOL_TYPE_COLORS[pool.poolType]
                      }`}
                    >
                      {pool.poolType.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-white font-mono">
                    {formatNumber(pool.reserveUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8] font-mono">
                    {formatNumber(pool.volumeUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#2962ff] font-mono drop-shadow-[0_0_6px_rgba(41,98,255,0.4)]">
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
      <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/10 p-4 overflow-x-auto relative rounded-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/60 via-[#2962ff]/20 to-transparent" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/50 rounded-tl-xl" />
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
                  <td className="py-3 pr-4 pl-3 text-[#475569] font-mono">
                    {(tokensPage - 1) * TOKENS_PER_PAGE + i + 1}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-white font-bold">{token.symbol}</span>
                    <span className="text-[#475569] ml-2 text-[10px]">{token.name}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-white font-mono">
                    ${formatNumber(token.derivedUSD as string, 'en-US', 2)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8] font-mono">
                    {formatNumber(token.tradeVolumeUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8] font-mono">
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
      <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/10 p-4 mb-8 relative rounded-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/50 via-[#2962ff]/15 to-transparent" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/40 rounded-tl-xl" />
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
                    <td className="py-2 pr-4 text-[#94a3b8]">
                      {tx.token0.symbol} / {tx.token1.symbol}
                    </td>
                    <td className="py-2 pr-4 text-right text-white">
                      ${formatNumber(tx.amountUSD, 'en-US', 0)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <a href={`${explorerUrl}/address/${tx.from}`} target="_blank">
                        <span className="text-[#2962ff] flex items-center justify-end gap-1">
                          {splitString(tx.from)}
                          <ExternalLinkIcon size={10} />
                        </span>
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <a href={`${explorerUrl}/address/${tx.to}`} target="_blank">
                        <span className="text-[#2962ff] flex items-center justify-end gap-1">
                          {splitString(tx.to)}
                          <ExternalLinkIcon size={10} />
                        </span>
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-right text-[#64748b]">
                      {moment(tx.timestamp).fromNow()}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <a href={`${explorerUrl}/tx/${tx.transactionHash}`} target="_blank">
                        <span className="text-[#2962ff] flex items-center justify-end gap-1">
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
