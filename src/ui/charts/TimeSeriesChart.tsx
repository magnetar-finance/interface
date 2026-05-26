'use client';

import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '@/utils/numbers';

export type Timeframe = '1D' | '7D' | '30D' | '1Y';

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface TimeSeriesChartProps {
  data: Partial<Record<Timeframe, TimeSeriesDataPoint[]>>;
  dataKey?: string;
  color?: string;
  label?: string;
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

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  dataKey = 'value',
  color = '#2962ff',
  formatValue = (v) => formatNumber(v, 'en-US', 2, true),
  height = 200,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const chartData = data[timeframe];
  const gradientId = `gradient-${color.replace('#', '')}`;

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
                ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                : 'border-white/10 text-[#64748b] hover:border-white/30 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
