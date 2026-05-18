'use client';

import React from 'react';
import { ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/Table';
import { TimeSeriesChart } from '@/ui/charts/TimeSeriesChart';
import { VolumeBarChart } from '@/ui/charts/VolumeBarChart';
import {
  MOCK_TOP_TOKENS,
  MOCK_TOP_POOLS,
  MOCK_TOKEN_PRICE,
  MOCK_TOKEN_VOLUME,
} from '@/utils/mock-data';
import { formatNumber } from '@/utils/numbers';
import { PoolType, type Pool } from '@/utils/http-api';

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  [PoolType.STABLE]: 'text-[#00ff9d] bg-[#00ff9d]/10',
  [PoolType.VOLATILE]: 'text-[#ffaf52] bg-[#ffaf52]/10',
  [PoolType.CONCENTRATED]: 'text-[#2962ff] bg-[#2962ff]/10',
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

// Fallback series for tokens without specific mock data
const FALLBACK_PRICE = {
  '1D': Array.from({ length: 24 }, (_, i) => ({
    date: `${i}:00`,
    value: 1 + Math.random() * 0.05,
  })),
  '7D': Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 0.99 + Math.random() * 0.02,
  })),
  '30D': Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 0.97 + Math.random() * 0.06,
  })),
} as const;

const FALLBACK_VOL = {
  '1D': Array.from({ length: 24 }, (_, i) => ({
    date: `${i}:00`,
    value: 100_000 + Math.random() * 50_000,
  })),
  '7D': Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 90_000 + Math.random() * 60_000,
  })),
  '30D': Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 80_000 + Math.random() * 70_000,
  })),
} as const;

// ─── Token Analytics View ─────────────────────────────────────────────────────

export const TokenAnalyticsView: React.FC<{ tokenId: string }> = ({ tokenId }) => {
  const router = useRouter();
  const decodedId = decodeURIComponent(tokenId);
  const token = MOCK_TOP_TOKENS.find((t) => t.id === decodedId) ?? MOCK_TOP_TOKENS[0];
  const positive = token.priceChange24h >= 0;

  const priceSeries = MOCK_TOKEN_PRICE[token.id] ?? FALLBACK_PRICE;
  const volSeries = MOCK_TOKEN_VOLUME[token.id] ?? FALLBACK_VOL;

  // Pools that contain this token
  const relatedPools = MOCK_TOP_POOLS.filter(
    (p) => p.token0.id === token.id || p.token1.id === token.id,
  );

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Back */}
      <button
        onClick={() => router.push('/analytics')}
        className="flex items-center gap-2 text-[#94a3b8] hover:text-[#00ff9d] transition-colors group font-mono text-xs uppercase tracking-widest w-fit"
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
              {token.priceUSD < 1
                ? token.priceUSD.toFixed(4)
                : formatNumber(token.priceUSD, 'en-US', 2)}
            </span>
            <span
              className={`flex items-center gap-1 font-mono text-sm font-bold ${
                positive ? 'text-[#00ff9d]' : 'text-[#ff4d4d]'
              }`}
            >
              {positive ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
              {Math.abs(token.priceChange24h).toFixed(2)}%
            </span>
          </div>

          <p className="text-[#64748b] font-mono text-xs mt-2 flex items-center gap-1">
            {token.address}
            <ExternalLinkIcon size={10} />
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3">
        <StatCard label="TVL" value={formatNumber(token.totalLiquidityUSD, 'en-US', 2, true)} />
        <StatCard label="Vol (24h)" value={formatNumber(token.volume24h, 'en-US', 2, true)} />
        <StatCard label="Txns" value={formatNumber(token.txCount, 'en-US', 0)} />
        <StatCard
          label="Decimals"
          value={String(token.decimals)}
          sub={`1 ETH = ${(1 / token.derivedETH).toFixed(2)} ${token.symbol}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-black border border-white/5 p-4">
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">
            Price (USD)
          </p>
          <TimeSeriesChart
            data={priceSeries}
            color={positive ? '#00ff9d' : '#ff4d4d'}
            height={180}
            formatValue={(v) => `$${v < 1 ? v.toFixed(4) : v.toFixed(2)}`}
          />
        </div>
        <div className="bg-black border border-white/5 p-4">
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">
            Volume
          </p>
          <VolumeBarChart data={volSeries} color="#2962ff" height={180} />
        </div>
      </div>

      {/* Pools containing this token */}
      <div className="bg-black border border-white/5 p-4 mb-8">
        <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-3">Pools</p>
        <Table<Pool>
          headers={[
            { label: 'Pool', align: 'left' },
            { label: 'Type', align: 'left' },
            { label: 'TVL', align: 'right' },
            { label: 'Vol 24h', align: 'right' },
          ]}
          data={relatedPools}
          onRowClick={(pool) => router.push(`/analytics/pools/${encodeURIComponent(pool.id)}`)}
          renderRow={(pool) => (
            <>
              <td className="py-3 pr-4 text-white font-bold">{pool.name}</td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase ${POOL_TYPE_COLORS[pool.poolType]}`}
                >
                  {pool.poolType.toLowerCase()}
                </span>
              </td>
              <td className="py-3 pr-4 text-right text-[#94a3b8]">
                {formatNumber(pool.reserveUSD, 'en-US', 2, true)}
              </td>
              <td className="py-3 pr-4 text-right text-[#94a3b8]">
                {formatNumber(pool.volumeUSD * 0.04, 'en-US', 2, true)}
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
};
