'use client';

import React from 'react';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/Table';
import { TimeSeriesChart } from '@/ui/charts/TimeSeriesChart';
import { VolumeBarChart } from '@/ui/charts/VolumeBarChart';
import {
  MOCK_TOP_POOLS,
  MOCK_TRANSACTIONS,
  MOCK_POOL_TVL,
  MOCK_POOL_VOLUME,
  type TxType,
  type MockTransaction,
} from '@/utils/mock-data';
import { formatNumber } from '@/utils/numbers';
import { PoolType } from '@/utils/http-api';

const TX_COLORS: Record<TxType, string> = {
  Swap: 'text-[#2962ff] bg-[#2962ff]/10 border-[#2962ff]/30',
  Add: 'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30',
  Remove: 'text-[#ffaf52] bg-[#ffaf52]/10 border-[#ffaf52]/30',
};

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  [PoolType.STABLE]: 'text-[#00ff9d]',
  [PoolType.VOLATILE]: 'text-[#ffaf52]',
  [PoolType.CONCENTRATED]: 'text-[#2962ff]',
};

const StatCard: React.FC<{ label: string; value: string; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="flex-1 min-w-0 bg-black border border-white/5 p-4">
    <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
    <p className="text-white font-mono text-2xl font-bold">{value}</p>
    {sub && <p className="text-[#64748b] text-xs font-mono mt-1">{sub}</p>}
  </div>
);

// ─── Fallback time-series when pool has no specific data ─────────────────────
const FALLBACK_TVL = {
  '1D': Array.from({ length: 24 }, (_, i) => ({
    date: `${i}:00`,
    value: 1_000_000 + Math.random() * 100_000,
  })),
  '7D': Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 900_000 + Math.random() * 200_000,
  })),
  '30D': Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 800_000 + Math.random() * 300_000,
  })),
} as const;

const FALLBACK_VOL = {
  '1D': Array.from({ length: 24 }, (_, i) => ({
    date: `${i}:00`,
    value: 40_000 + Math.random() * 20_000,
  })),
  '7D': Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 35_000 + Math.random() * 25_000,
  })),
  '30D': Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 30_000 + Math.random() * 30_000,
  })),
} as const;

// ─── Pool Analytics View ──────────────────────────────────────────────────────

export const PoolAnalyticsView: React.FC<{ poolId: string }> = ({ poolId }) => {
  const router = useRouter();
  const decodedId = decodeURIComponent(poolId);
  const pool = MOCK_TOP_POOLS.find((p) => p.id === decodedId) ?? MOCK_TOP_POOLS[0];
  const txns = MOCK_TRANSACTIONS.filter((t) => t.poolId === pool.id);

  const tvlSeries = MOCK_POOL_TVL[pool.id] ?? FALLBACK_TVL;
  const volSeries = MOCK_POOL_VOLUME[pool.id] ?? FALLBACK_VOL;

  const apr = pool.gauge?.rewardRate ?? 0;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Back link */}
      <button
        onClick={() => router.push('/analytics')}
        className="flex items-center gap-2 text-[#94a3b8] hover:text-[#00ff9d] transition-colors group font-mono text-xs uppercase tracking-widest w-fit"
      >
        <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Analytics</span>
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-white text-2xl font-bold tracking-wide uppercase">{pool.name}</h1>
            <span
              className={`text-xs px-2 py-0.5 font-mono font-bold uppercase ${
                POOL_TYPE_COLORS[pool.poolType]
              } bg-white/5 border border-white/10`}
            >
              {pool.poolType.toLowerCase()}
            </span>
          </div>
          <p className="text-[#64748b] font-mono text-xs mt-1 flex items-center gap-1">
            {pool.address}
            <ExternalLinkIcon size={10} />
          </p>
        </div>
        <Link
          href={`/liquidity/deposit?token0=${pool.token0.address}&token1=${pool.token1.address}&poolType=${pool.poolType}`}
          className="ml-auto px-4 py-2 bg-[#2962ff]/20 border border-[#2962ff]/50 text-[#2962ff] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[#2962ff]/30 transition-colors whitespace-nowrap"
        >
          + Add Liquidity
        </Link>
      </div>

      {/* Key metrics */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3">
        <StatCard label="TVL" value={formatNumber(pool.reserveUSD, 'en-US', 2, true)} />
        <StatCard label="Vol (24h)" value={formatNumber(pool.volumeUSD * 0.04, 'en-US', 2, true)} />
        <StatCard
          label="Fees (24h)"
          value={formatNumber(pool.totalFeesUSD * 0.01, 'en-US', 2, true)}
        />
        <StatCard label="APR" value={`${apr.toFixed(2)}%`} sub="Current epoch" />
        <StatCard label="Txns" value={formatNumber(pool.txCount, 'en-US', 0)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-black border border-white/5 p-4">
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">TVL</p>
          <TimeSeriesChart data={tvlSeries} color="#2962ff" height={180} />
        </div>
        <div className="bg-black border border-white/5 p-4">
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">
            Volume
          </p>
          <VolumeBarChart data={volSeries} height={180} />
        </div>
      </div>

      {/* Pool ratio */}
      <div className="bg-black border border-white/5 p-4">
        <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">
          Pool Composition
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-4 text-sm font-mono">
          <div className="flex-1">
            <p className="text-[#64748b] text-xs mb-1">{pool.token0.symbol}</p>
            <p className="text-white font-bold text-xl">
              {formatNumber(pool.reserve0, 'en-US', 2, true)}
            </p>
            <p className="text-[#64748b] text-xs">
              1 {pool.token0.symbol} ={' '}
              {pool.token0Price < 0.001
                ? pool.token0Price.toExponential(2)
                : pool.token0Price.toFixed(4)}{' '}
              {pool.token1.symbol}
            </p>
          </div>
          <div className="h-px md:w-px md:h-auto bg-white/10" />
          <div className="flex-1">
            <p className="text-[#64748b] text-xs mb-1">{pool.token1.symbol}</p>
            <p className="text-white font-bold text-xl">
              {formatNumber(pool.reserve1, 'en-US', 2, true)}
            </p>
            <p className="text-[#64748b] text-xs">
              1 {pool.token1.symbol} ={' '}
              {pool.token1Price < 0.001
                ? pool.token1Price.toExponential(2)
                : pool.token1Price.toFixed(4)}{' '}
              {pool.token0.symbol}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-black border border-white/5 p-4 mb-8 overflow-x-auto">
        <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">
          Transactions
        </p>
        {txns.length === 0 ? (
          <p className="text-[#64748b] font-mono text-xs py-4 text-center">
            No recent transactions for this pool
          </p>
        ) : (
          <Table<MockTransaction>
            headers={[
              { label: 'Type', align: 'left' },
              { label: 'Pair', align: 'left' },
              { label: 'Amount', align: 'right' },
              { label: 'Account', align: 'right' },
              { label: 'Time', align: 'right' },
            ]}
            data={txns}
            renderRow={(tx) => (
              <>
                <td className="py-2 pr-4">
                  <span
                    className={`px-2 py-0.5 border text-[10px] uppercase ${TX_COLORS[tx.type]}`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="py-2 pr-4 text-[#94a3b8]">{tx.pair}</td>
                <td className="py-2 pr-4 text-right text-white">
                  ${formatNumber(tx.amountUSD, 'en-US', 0)}
                </td>
                <td className="py-2 pr-4 text-right text-[#2962ff]">{tx.account}</td>
                <td className="py-2 pr-4 text-right text-[#64748b]">{tx.timeAgo}</td>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};
