'use client';

import React, { useMemo, useState } from 'react';
import { ExternalLinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/Table';
import { Pagination } from '@/components/Pagination';
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

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded ${className}`} />
);

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
  STABLE: 'text-[#00ff9d] bg-[#00ff9d]/10',
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
  <div
    className="flex-1 min-w-0 bg-black border border-white/5 p-4 relative
    before:content-[''] before:absolute before:top-0 before:left-0
    before:w-3 before:h-3 before:border-t before:border-l before:border-[#2962ff]/50
    after:content-[''] after:absolute after:bottom-0 after:right-0
    after:w-3 after:h-3 after:border-b after:border-r after:border-[#2962ff]/50"
  >
    <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
    <p className="text-white font-mono text-2xl font-bold">{value}</p>
    {sub && <p className="text-[#64748b] text-xs font-mono mt-1">{sub}</p>}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[#64748b] text-xs font-bold uppercase tracking-widest mb-3">{title}</h3>
);

// ─── Main View ────────────────────────────────────────────────────────────────

export const AnalyticsMainView: React.FC = () => {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/purity
  const todayInSeconds = useMemo(() => Math.floor(Date.now() / 1000 / 60) * 60, []);

  // Overall statistics
  const { data: statistics, isLoading: isStatisticsLoading } = useStatistics(REFETCH_INTERVALS);

  // Overall day data
  const { data: overallDayData1Day, isLoading: isLoading1D } = useOverallDayData(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
    todayInSeconds - 86400,
    todayInSeconds,
  );
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

  // Pools
  const { data: pools, isLoading: isLoadingPools } = useAllPools(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );
  const topPools = useMemo(
    () =>
      pools
        .slice()
        .sort((a, b) => parseFloat(b.reserveUSD as string) - parseFloat(a.reserveUSD as string))
        .slice(0, 5),
    [pools],
  );

  // Tokens
  const { data: tokens, isLoading: isLoadingTokens } = useAllTokens(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );
  const topTokens = useMemo(
    () =>
      tokens
        .slice()
        .sort(
          (a, b) =>
            parseFloat(b.totalLiquidityUSD as string) - parseFloat(a.totalLiquidityUSD as string),
        ),
    [tokens],
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

  const tvlSeries: Record<Timeframe, TimeSeriesDataPoint[]> = useMemo(() => {
    return {
      '1D': overallDayData1Day.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })} ${date.getHours()}:00`,
          value: parseFloat(o.liquidityUSD as string),
        };
      }),
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
    };
  }, [overallDayData1Day, overallDayData30Days, overallDayData7Days]);

  const volumeSeries: Record<Timeframe, TimeSeriesDataPoint[]> = useMemo(() => {
    return {
      '1D': overallDayData1Day.map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })} ${date.getHours()}:00`,
          value: parseFloat(o.totalTradeVolumeUSD as string),
        };
      }),
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
    };
  }, [overallDayData1Day, overallDayData30Days, overallDayData7Days]);

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
        <div className="bg-black border border-white/5 p-4">
          <SectionHeader title="TVL" />
          {isLoading1D || isLoading7D || isLoading30D ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <TimeSeriesChart data={tvlSeries} color="#2962ff" height={180} />
          )}
        </div>
        <div className="bg-black border border-white/5 p-4">
          <SectionHeader title="Volume" />
          {isLoading1D || isLoading7D || isLoading30D ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <VolumeBarChart data={volumeSeries} height={180} />
          )}
        </div>
      </div>

      {/* ── Top Pools ──────────────────────────────────────────────────── */}
      <div className="bg-black border border-white/5 p-4 overflow-x-auto">
        <SectionHeader title="Top Pools" />
        {isLoadingPools ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
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
                <td className="py-3 pr-4 text-[#64748b]">{i + 1}</td>
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
                <td className="py-3 pr-4 text-right text-white">
                  {formatNumber(pool.reserveUSD as string, 'en-US', 2, true)}
                </td>
                <td className="py-3 pr-4 text-right text-[#94a3b8]">
                  {formatNumber(pool.volumeUSD as string, 'en-US', 2, true)}
                </td>
                <td className="py-3 pr-4 text-right text-[#00ff9d]">
                  {formatNumber(pool.totalFeesUSD as string, 'en-US', 2, true)}
                </td>
              </>
            )}
          />
        )}
      </div>

      {/* ── Top Tokens ─────────────────────────────────────────────────── */}
      <div className="bg-black border border-white/5 p-4 overflow-x-auto">
        <SectionHeader title="Top Tokens" />
        {isLoadingTokens ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table<(typeof topTokens)[number]>
            headers={[
              { label: '#', align: 'left' },
              { label: 'Token', align: 'left' },
              { label: 'Price', align: 'right' },
              { label: 'Vol', align: 'right' },
              { label: 'TVL', align: 'right' },
            ]}
            data={topTokens}
            onRowClick={(token) => router.push(`/analytics/token/${encodeURIComponent(token.id)}`)}
            renderRow={(token, i) => {
              return (
                <>
                  <td className="py-3 pr-4 text-[#64748b]">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <span className="text-white font-bold">{token.symbol}</span>
                    <span className="text-[#64748b] ml-2">{token.name}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-white">
                    ${formatNumber(token.derivedUSD as string, 'en-US', 2)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8]">
                    {formatNumber(token.tradeVolumeUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8]">
                    {formatNumber(token.totalLiquidityUSD as string, 'en-US', 2, true)}
                  </td>
                </>
              );
            }}
          />
        )}
      </div>

      {/* ── Live Transactions ──────────────────────────────────────────── */}
      <div className="bg-black border border-white/5 p-4 mb-8">
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
