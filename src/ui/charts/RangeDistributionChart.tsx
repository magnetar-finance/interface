'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';

export interface RangeDistributionChartProps {
  data: { value: number }[];
  chartMinIndex: number;
  chartMaxIndex: number;
  activeColor?: string;
  inactiveColor?: string;
  /** Called with the new bar-index when the left (min) handle is dragged */
  onMinIndexChange?: (index: number) => void;
  /** Called with the new bar-index when the right (max) handle is dragged */
  onMaxIndexChange?: (index: number) => void;
}

type DragTarget = 'min' | 'max' | null;

export const RangeDistributionChart: React.FC<RangeDistributionChartProps> = ({
  data,
  chartMinIndex,
  chartMaxIndex,
  activeColor = '#2962ff',
  inactiveColor = 'rgba(255,255,255,0.05)',
  onMinIndexChange,
  onMaxIndexChange,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<DragTarget>(null);
  const [isDragging, setIsDragging] = useState<DragTarget>(null);

  /**
   * Convert a pointer clientX into a bar index, clamped to [0, data.length-1].
   */
  const clientXToIndex = useCallback(
    (clientX: number): number => {
      const el = wrapperRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(ratio * (data.length - 1));
    },
    [data.length],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent, target: 'min' | 'max') => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragTarget.current = target;
    setIsDragging(target);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragTarget.current) return;
      const newIndex = clientXToIndex(e.clientX);

      if (dragTarget.current === 'min') {
        // min can't go past max-1
        const clamped = Math.min(newIndex, chartMaxIndex - 1);
        onMinIndexChange?.(clamped);
      } else {
        // max can't go below min+1
        const clamped = Math.max(newIndex, chartMinIndex + 1);
        onMaxIndexChange?.(clamped);
      }
    },
    [clientXToIndex, chartMinIndex, chartMaxIndex, onMinIndexChange, onMaxIndexChange],
  );

  const handlePointerUp = useCallback(() => {
    dragTarget.current = null;
    setIsDragging(null);
  }, []);

  // Attach global move/up listeners so dragging outside the element still works
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerUp);
    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Percentage positions for the handle lines
  const minPct = (chartMinIndex / (data.length - 1)) * 100;
  const maxPct = (chartMaxIndex / (data.length - 1)) * 100;

  const canInteract = !!(onMinIndexChange || onMaxIndexChange);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      {/* Recharts Bar Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="value" isAnimationActive={false}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index >= chartMinIndex && index <= chartMaxIndex ? activeColor : inactiveColor
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Active range shaded overlay */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          left: `${minPct}%`,
          width: `${maxPct - minPct}%`,
          background: `${activeColor}14`,
        }}
      />

      {/* ── Min handle (left) ─────────────────────── */}
      {canInteract && (
        <div
          className="absolute inset-y-0 flex flex-col items-center"
          style={{
            left: `${minPct}%`,
            transform: 'translateX(-50%)',
            cursor: isDragging === 'min' ? 'grabbing' : 'ew-resize',
            zIndex: 10,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'min')}
        >
          {/* vertical line */}
          <div
            className="w-px flex-1"
            style={{ background: '#2962ff', boxShadow: '0 0 6px #2962ff' }}
          />
          {/* grip bar */}
          <div
            className="w-1.5 h-5 rounded-sm mb-1 flex-shrink-0"
            style={{ background: '#F5F5F5', boxShadow: '0 0 6px rgba(245,245,245,0.4)' }}
          />
        </div>
      )}

      {/* ── Max handle (right) ───────────────────────── */}
      {canInteract && (
        <div
          className="absolute inset-y-0 flex flex-col items-center"
          style={{
            left: `${maxPct}%`,
            transform: 'translateX(-50%)',
            cursor: isDragging === 'max' ? 'grabbing' : 'ew-resize',
            zIndex: 10,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'max')}
        >
          {/* vertical line */}
          <div
            className="w-px flex-1"
            style={{ background: '#2962ff', boxShadow: '0 0 6px #2962ff' }}
          />
          {/* grip bar */}
          <div
            className="w-1.5 h-5 rounded-sm mb-1 flex-shrink-0"
            style={{ background: '#F5F5F5', boxShadow: '0 0 6px rgba(245,245,245,0.4)' }}
          />
        </div>
      )}
    </div>
  );
};
