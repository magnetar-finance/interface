'use client';

import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '@/utils/numbers';

export type Timeframe = '1D' | '7D' | '30D' | '1Y';

export interface VolumeDataPoint {
  date: string;
  value: number;
}

export interface VolumeBarChartProps {
  data: Partial<Record<Timeframe, VolumeDataPoint[]>>;
  color?: string;
  formatValue?: (v: number) => string;
  height?: number;
}

const TIMEFRAMES: Timeframe[] = ['1D', '7D', '30D'];

const CustomTooltip = ({
  active,
  payload,
  label,
  color,
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  color: string;
  formatValue: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 px-3 py-2 text-xs font-mono">
      <p className="text-[#64748b] mb-1">{label}</p>
      <p style={{ color }}>{formatValue(payload[0].value)}</p>
    </div>
  );
};

export const VolumeBarChart: React.FC<VolumeBarChartProps> = ({
  data,
  color = '#00ff9d',
  formatValue = (v) => formatNumber(v, 'en-US', 2, true),
  height = 200,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const chartData = data[timeframe];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Timeframe selector */}
      <div className="flex gap-1 justify-end">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors border ${
              timeframe === tf
                ? 'border-[#00ff9d] text-[#00ff9d] bg-[#00ff9d]/10'
                : 'border-white/10 text-[#64748b] hover:border-white/30 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumber(v, 'en-US', 1, true)}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip color={color} formatValue={formatValue} />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="value" isAnimationActive={false} radius={[2, 2, 0, 0]}>
            {chartData &&
              chartData.map((_, i) => (
                <Cell key={i} fill={color} fillOpacity={i === chartData.length - 1 ? 1 : 0.6} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
