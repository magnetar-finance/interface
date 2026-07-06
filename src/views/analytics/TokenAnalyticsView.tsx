'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';
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
import { formatNumber } from '@/utils/numbers';
import { PoolType } from '@/gql/codegen/graphql';
import useTokenInfo from '@/hooks/api/useTokenInfo';
import useTokenDayData from '@/hooks/api/useTokenDayData';
import { OP_SETTINGS, REFETCH_INTERVALS, CHAINS_INFORMATION } from '@/constants';
import useAllPools from '@/hooks/api/useAllPools';
import useAllTransactions from '@/hooks/api/useAllTransactions';
import { useChainId } from 'wagmi';
import { type TxType } from '@/utils/mock-data';
import moment from 'moment';
import { splitString } from '@/utils';

function parseQLDate(n: number) {
  return new Date(n * 1000);
}

const TX_COLORS: Record<TxType | string, string> = {
  Swap: 'text-[#2962ff] bg-[#2962ff]/10 border-[#2962ff]/30',
  Add: 'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30',
  Remove: 'text-[#ffaf52] bg-[#ffaf52]/10 border-[#ffaf52]/30',
};

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  STABLE: 'text-[#2962ff] bg-[#2962ff]/10',
  VOLATILE: 'text-[#ffaf52] bg-[#ffaf52]/10',
  CONCENTRATED: 'text-[#2962ff] bg-[#2962ff]/10',
};

const StatCard: React.FC<{ label: string; value: string; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="flex-1 min-w-0 bg-[#131525]/80 backdrop-blur-md border border-[#2962ff]/15 p-4 relative overflow-hidden group hover:border-[#2962ff]/40 hover:shadow-[0_0_30px_rgba(41,98,255,0.1)] transition-all duration-300 rounded-xl">
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/70 via-[#2962ff]/20 to-transparent" />
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

// ─── Token Analytics View ─────────────────────────────────────────────────────

export const TokenAnalyticsView: React.FC<{ tokenId: string }> = ({ tokenId }) => {
  const router = useRouter();
  const decodedId = decodeURIComponent(tokenId);

  const { data: token, isLoading: isTokenLoading } = useTokenInfo(decodedId, REFETCH_INTERVALS);

  const { data: tokenDayData, isLoading: isTokenDayDatasLoading } = useTokenDayData(
    decodedId,
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );

  const { data: allPools, isLoading: isPoolsLoading } = useAllPools(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );

  const { data: allTransactions, isLoading: isLoadingTxns } = useAllTransactions(
    0,
    OP_SETTINGS.default_gql_items_limit,
    REFETCH_INTERVALS,
  );

  const relatedPools = useMemo(() => {
    return allPools.filter((p) => p.token0.id === decodedId || p.token1.id === decodedId);
  }, [allPools, decodedId]);

  const mergedTransactions = useMemo(() => {
    const merges = [];

    for (const transaction of allTransactions) {
      // Loop through for mints
      for (const mint of transaction.mints) {
        if (mint.pool.token0.id === decodedId || mint.pool.token1.id === decodedId) {
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
        if (swap.pool.token0.id === decodedId || swap.pool.token1.id === decodedId) {
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
        if (burn.pool.token0.id === decodedId || burn.pool.token1.id === decodedId) {
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
  const [poolsPage, setPoolsPage] = useState(1);
  const POOLS_PER_PAGE = 10;
  const totalPoolPages = useMemo(
    () => Math.max(1, Math.ceil(relatedPools.length / POOLS_PER_PAGE)),
    [relatedPools.length],
  );
  const paginatedRelatedPools = useMemo(
    () => relatedPools.slice((poolsPage - 1) * POOLS_PER_PAGE, poolsPage * POOLS_PER_PAGE),
    [relatedPools, poolsPage],
  );
  const chainId = useChainId();

  const priceSeries: Partial<Record<Timeframe, TimeSeriesDataPoint[]>> = useMemo(() => {
    // Basic day data mapper
    const points = tokenDayData
      .map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.priceUSD as string),
          ts: o.date,
        };
      })
      .sort((a, b) => a.ts - b.ts);

    // As a simplification, we use the same points over all ranges,
    // ideally subgraph filtering is applied like poolDayData.
    return {
      '7D': points.slice(-7),
      '30D': points.slice(-30),
      '1Y': points.slice(-365),
    };
  }, [tokenDayData]);

  const volSeries: Partial<Record<Timeframe, TimeSeriesDataPoint[]>> = useMemo(() => {
    const points = tokenDayData
      .map((o) => {
        const date = parseQLDate(o.date);
        return {
          date: `${date.toLocaleDateString('en-us', {
            month: 'short',
            day: 'numeric',
          })}`,
          value: parseFloat(o.dailyVolumeUSD as string),
          ts: o.date,
        };
      })
      .sort((a, b) => a.ts - b.ts);

    return {
      '7D': points.slice(-7),
      '30D': points.slice(-30),
      '1Y': points.slice(-365),
    };
  }, [tokenDayData]);

  if (isTokenLoading || !token) {
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

  // Calculate generic positive flag (from first point to last point logic)
  const l = tokenDayData.length;
  const positive =
    l >= 2
      ? parseFloat(tokenDayData[l - 1].priceUSD as string) >=
        parseFloat(tokenDayData[l - 2].priceUSD as string)
      : true;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Back */}
      <button
        onClick={() => router.push('/analytics')}
        className="flex items-center gap-2 text-[#94a3b8] hover:text-[#2962ff] transition-colors group font-mono text-xs uppercase tracking-widest w-fit"
      >
        <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Analytics</span>
      </button>

      {/* Token Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-white text-2xl font-bold tracking-wide uppercase font-mono">
              {token.symbol}
            </h1>
            <span className="text-[#64748b] font-mono text-sm">{token.name}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-white font-mono text-3xl font-bold">
              $
              {parseFloat(token.derivedUSD as string) < 1
                ? parseFloat(token.derivedUSD as string).toFixed(4)
                : formatNumber(token.derivedUSD as string, 'en-US', 2)}
            </span>
          </div>

          <p className="text-[#64748b] font-mono text-xs mt-2 flex items-center gap-1">
            <a
              href={`${CHAINS_INFORMATION[chainId].explorerUrl}/address/${token.id}`}
              target="_blank"
            >
              {token.id as string}
              <ExternalLinkIcon size={10} />
            </a>
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3">
        <StatCard
          label="TVL"
          value={formatNumber(token.totalLiquidityUSD as string, 'en-US', 2, true)}
        />
        <StatCard
          label="Vol"
          value={formatNumber(token.tradeVolumeUSD as string, 'en-US', 2, true)}
        />
        <StatCard
          label="Decimals"
          value={String(token.decimals)}
          sub={`1 ETH = ${(1 / parseFloat(token.derivedETH as string)).toFixed(2)} ${token.symbol}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/15 p-4 relative overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/60 via-[#2962ff]/20 to-transparent" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/50 rounded-tl-xl" />
          <p className="text-[#475569] text-[9px] font-bold uppercase tracking-[0.15em] mb-4 font-sans flex items-center gap-1.5">
            <span className="text-[#2962ff]/50 font-mono">&gt;</span> Price (USD)
          </p>
          {isTokenDayDatasLoading ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <TimeSeriesChart
              data={priceSeries}
              color={positive ? '#00ff9d' : '#ff4d4d'}
              height={180}
              formatValue={(v) => `$${v < 1 ? v.toFixed(4) : v.toFixed(2)}`}
            />
          )}
        </div>
        <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/10 p-4 relative overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/50 via-[#2962ff]/15 to-transparent" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/40 rounded-tl-xl" />
          <p className="text-[#475569] text-[9px] font-bold uppercase tracking-[0.15em] mb-4 font-sans flex items-center gap-1.5">
            <span className="text-[#2962ff]/50 font-mono">&gt;</span> Volume
          </p>
          {isTokenDayDatasLoading ? (
            <Skeleton className="h-45 w-full" />
          ) : (
            <VolumeBarChart data={volSeries} color="#2962ff" height={180} />
          )}
        </div>
      </div>

      {/* Pools containing this token */}
      <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/15 p-4 mb-8 relative rounded-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/50 via-[#2962ff]/15 to-transparent" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/40 rounded-tl-xl" />
        <p className="text-[#475569] text-[9px] font-bold uppercase tracking-[0.15em] mb-4 font-sans flex items-center gap-1.5">
          <span className="text-[#2962ff]/50 font-mono">&gt;</span> Pools
        </p>

        {isPoolsLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <Table<(typeof relatedPools)[number]>
              headers={[
                { label: 'Pool', align: 'left' },
                { label: 'Type', align: 'left' },
                { label: 'TVL', align: 'right' },
                { label: 'Vol', align: 'right' },
              ]}
              data={paginatedRelatedPools}
              onRowClick={(pool) => router.push(`/analytics/pools/${encodeURIComponent(pool.id)}`)}
              renderRow={(pool) => (
                <>
                  <td className="py-3 pr-4 pl-3 text-white font-bold">{pool.name}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase ${
                        POOL_TYPE_COLORS[pool.poolType as PoolType]
                      }`}
                    >
                      {pool.poolType.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8] font-mono">
                    {formatNumber(pool.reserveUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#94a3b8] font-mono">
                    {formatNumber(pool.volumeUSD as string, 'en-US', 2, true)}
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

      {/* Transactions */}
      <div className="bg-[#131525]/50 backdrop-blur-sm border border-[#2962ff]/15 p-4 mb-8 overflow-x-auto relative rounded-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/50 via-[#2962ff]/15 to-transparent" />
        <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/40 rounded-tl-xl" />
        <p className="text-[#475569] text-[9px] font-bold uppercase tracking-[0.15em] mb-4 font-sans flex items-center gap-1.5">
          <span className="text-[#2962ff]/50 font-mono">&gt;</span> Transactions
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
          <p className="text-[#64748b] font-mono text-xs py-4 text-center">
            No recent transactions for this token
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
