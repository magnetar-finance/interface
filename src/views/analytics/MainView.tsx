"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/Table";
import { TimeSeriesChart } from "@/ui/charts/TimeSeriesChart";
import { VolumeBarChart } from "@/ui/charts/VolumeBarChart";
import {
  MOCK_TVL_SERIES,
  MOCK_VOLUME_SERIES,
  MOCK_TOP_POOLS,
  MOCK_TOP_TOKENS,
  MOCK_TRANSACTIONS,
  type TxType,
} from "@/utils/mock-data";
import { formatNumber } from "@/utils/numbers";
import { PoolType, type Pool } from "@/utils/http-api";
import { PageHeader } from "@/components/PageHeader";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TX_COLORS: Record<TxType, string> = {
  Swap: "text-[#2962ff] bg-[#2962ff]/10 border-[#2962ff]/30",
  Add: "text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30",
  Remove: "text-[#ffaf52] bg-[#ffaf52]/10 border-[#ffaf52]/30",
};

const POOL_TYPE_COLORS: Record<PoolType, string> = {
  [PoolType.STABLE]: "text-[#00ff9d] bg-[#00ff9d]/10",
  [PoolType.VOLATILE]: "text-[#ffaf52] bg-[#ffaf52]/10",
  [PoolType.CONCENTRATED]: "text-[#2962ff] bg-[#2962ff]/10",
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

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        subtitle="Protocol-wide metrics, pools & token data"
        chips={[{ label: "Live", color: "green" }]}
      />

      {/* ── Hero Metrics ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3">
        <StatCard label="Protocol TVL" value="$28.4M" sub="↑ 3.2% (24h)" />
        <StatCard label="Volume (24h)" value="$1.24M" sub="↑ 11.7% (24h)" />
        <StatCard label="Total Pools" value="5" sub="Active gauges: 4" />
        <StatCard label="Total Txns" value="138,500" sub="↑ 842 today" />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-black border border-white/5 p-4">
          <SectionHeader title="TVL" />
          <TimeSeriesChart data={MOCK_TVL_SERIES} color="#2962ff" height={180} />
        </div>
        <div className="bg-black border border-white/5 p-4">
          <SectionHeader title="Volume" />
          <VolumeBarChart data={MOCK_VOLUME_SERIES} height={180} />
        </div>
      </div>

      {/* ── Top Pools ──────────────────────────────────────────────────── */}
      <div className="bg-black border border-white/5 p-4 overflow-x-auto">
        <SectionHeader title="Top Pools" />
        <Table<Pool>
          headers={[
            { label: "#", align: "left" },
            { label: "Pool", align: "left" },
            { label: "Type", align: "left" },
            { label: "TVL", align: "right" },
            { label: "Vol 24h", align: "right" },
            { label: "Fees 24h", align: "right" },
          ]}
          data={MOCK_TOP_POOLS}
          onRowClick={(pool) => router.push(`/analytics/pools/${encodeURIComponent(pool.id)}`)}
          renderRow={(pool, i) => (
            <>
              <td className="py-3 pr-4 text-[#64748b]">{i + 1}</td>
              <td className="py-3 pr-4 text-white font-bold">{pool.name}</td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase ${POOL_TYPE_COLORS[pool.poolType]}`}
                >
                  {pool.poolType.toLowerCase()}
                </span>
              </td>
              <td className="py-3 pr-4 text-right text-white">
                {formatNumber(pool.reserveUSD, "en-US", 2, true)}
              </td>
              <td className="py-3 pr-4 text-right text-[#94a3b8]">
                {formatNumber(pool.volumeUSD * 0.04, "en-US", 2, true)}
              </td>
              <td className="py-3 pr-4 text-right text-[#00ff9d]">
                {formatNumber(pool.totalFeesUSD * 0.01, "en-US", 2, true)}
              </td>
            </>
          )}
        />
      </div>

      {/* ── Top Tokens ─────────────────────────────────────────────────── */}
      <div className="bg-black border border-white/5 p-4 overflow-x-auto">
        <SectionHeader title="Top Tokens" />
        <Table<(typeof MOCK_TOP_TOKENS)[0]>
          headers={[
            { label: "#", align: "left" },
            { label: "Token", align: "left" },
            { label: "Price", align: "right" },
            { label: "24h Δ", align: "right" },
            { label: "Vol 24h", align: "right" },
            { label: "TVL", align: "right" },
          ]}
          data={MOCK_TOP_TOKENS}
          onRowClick={(token) => router.push(`/analytics/token/${encodeURIComponent(token.id)}`)}
          renderRow={(token, i) => {
            const positive = token.priceChange24h >= 0;
            return (
              <>
                <td className="py-3 pr-4 text-[#64748b]">{i + 1}</td>
                <td className="py-3 pr-4">
                  <span className="text-white font-bold">{token.symbol}</span>
                  <span className="text-[#64748b] ml-2">{token.name}</span>
                </td>
                <td className="py-3 pr-4 text-right text-white">
                  $
                  {token.priceUSD < 1
                    ? token.priceUSD.toFixed(4)
                    : formatNumber(token.priceUSD, "en-US", 2)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`flex items-center justify-end gap-0.5 ${
                      positive ? "text-[#00ff9d]" : "text-[#ff4d4d]"
                    }`}
                  >
                    {positive ? <ArrowUpIcon size={10} /> : <ArrowDownIcon size={10} />}
                    {Math.abs(token.priceChange24h).toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 pr-4 text-right text-[#94a3b8]">
                  {formatNumber(token.volume24h, "en-US", 2, true)}
                </td>
                <td className="py-3 pr-4 text-right text-[#94a3b8]">
                  {formatNumber(token.totalLiquidityUSD, "en-US", 2, true)}
                </td>
              </>
            );
          }}
        />
      </div>

      {/* ── Live Transactions ──────────────────────────────────────────── */}
      <div className="bg-black border border-white/5 p-4 mb-8">
        <SectionHeader title="Recent Transactions" />
        <Table<(typeof MOCK_TRANSACTIONS)[0]>
          headers={[
            { label: "Type", align: "left" },
            { label: "Pair", align: "left" },
            { label: "Amount", align: "right" },
            { label: "Account", align: "right" },
            { label: "Time", align: "right" },
          ]}
          data={MOCK_TRANSACTIONS}
          renderRow={(tx) => (
            <>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 border text-[10px] uppercase ${TX_COLORS[tx.type]}`}>
                  {tx.type}
                </span>
              </td>
              <td className="py-2 pr-4 text-[#94a3b8]">{tx.pair}</td>
              <td className="py-2 pr-4 text-right text-white">
                ${formatNumber(tx.amountUSD, "en-US", 0)}
              </td>
              <td className="py-2 pr-4 text-right">
                <span className="text-[#2962ff] flex items-center justify-end gap-1">
                  {tx.account}
                  <ExternalLinkIcon size={10} />
                </span>
              </td>
              <td className="py-2 pr-4 text-right text-[#64748b]">{tx.timeAgo}</td>
            </>
          )}
        />
      </div>
    </div>
  );
};
