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
    <div
      className="rounded-2xl border border-white/[0.08] bg-surface/95 px-3 py-2.5 text-xs font-mono backdrop-blur-md"
      style={{
        borderColor: `${color}55`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
      }}
    >
      <p className="text-muted mb-1 text-[11px] font-semibold">{label}</p>
      <p className="font-bold" style={{ color }}>
        {formatValue(payload[0].value)}
      </p>
    </div>
  );
};

export const VolumeBarChart: React.FC<VolumeBarChartProps> = ({
  data,
  color = '#2660f5',
  formatValue = (v) => formatNumber(v, 'en-US', 2, true),
  height = 200,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartData = data[timeframe];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Timeframe selector */}
      <div className="flex gap-1 justify-end">
        {Object.keys(data).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf as Timeframe)}
            className={`px-2.5 py-1 text-[11px] font-semibold transition-colors duration-200 border rounded-lg ${
              timeframe === tf
                ? `border-[${color}] text-[${color}] bg-[${color}]/10 shadow-[0_0_10px_${color}40]`
                : 'border-white/10 text-muted hover:border-white/25 hover:text-foreground'
            }`}
            style={
              timeframe === tf
                ? {
                    borderColor: color,
                    color: color,
                    backgroundColor: `${color}1A`,
                    boxShadow: 'none',
                  }
                : {}
            }
          >
            {tf}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.035)" vertical={false} strokeDasharray="4 0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6a7194', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6a7194', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumber(v, 'en-US', 1, true)}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip color={color} formatValue={formatValue} />}
            cursor={{ fill: 'rgba(255,255,255,0.025)' }}
          />
          <Bar
            dataKey="value"
            isAnimationActive={false}
            radius={[1, 1, 0, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
          >
            {chartData &&
              chartData.map((_, i) => {
                const isLast = i === chartData.length - 1;
                const isHovered = i === hoveredIndex;
                const opacity = isHovered ? 1 : isLast ? 0.9 : 0.55;
                return (
                  <Cell
                    key={i}
                    fill={color}
                    fillOpacity={opacity}
                    style={
                      isHovered || isLast
                        ? { filter: `drop-shadow(0 0 4px ${color}60)` }
                        : undefined
                    }
                  />
                );
              })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
