'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface RangeDistributionChartProps {
  data: { value: number; tick: number }[];
  chartMinIndex: number;
  chartMaxIndex: number;
  activeColor?: string;
  inactiveColor?: string;
  /** Optional tick for the current price — renders a dashed marker line */
  currentPriceTick?: number;
  /** Called with the new tick value when the left (min) handle is dragged */
  onMinIndexChange?: (index: number) => void;
  /** Called with the new tick value when the right (max) handle is dragged */
  onMaxIndexChange?: (index: number) => void;
}

type DragTarget = 'min' | 'max' | null;

export const RangeDistributionChart: React.FC<RangeDistributionChartProps> = ({
  data,
  chartMinIndex,
  chartMaxIndex,
  activeColor = '#2962ff',
  inactiveColor = 'rgba(255,255,255,0.06)',
  currentPriceTick,
  onMinIndexChange,
  onMaxIndexChange,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<DragTarget>(null);
  const [isDragging, setIsDragging] = useState<DragTarget>(null);
  const [hovered, setHovered] = useState<'min' | 'max' | null>(null);

  // ── Drag logic (unchanged) ────────────────────────────────────────────────
  const clientXToTick = useCallback(
    (clientX: number): number => {
      const el = wrapperRef.current;
      if (!el || data.length === 0) return 0;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const arrIndex = Math.round(ratio * (data.length - 1));
      return data[arrIndex].tick;
    },
    [data],
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
      const newTick = clientXToTick(e.clientX);
      if (dragTarget.current === 'min') {
        onMinIndexChange?.(Math.min(newTick, chartMaxIndex - 1));
      } else {
        onMaxIndexChange?.(Math.max(newTick, chartMinIndex + 1));
      }
    },
    [clientXToTick, chartMinIndex, chartMaxIndex, onMinIndexChange, onMaxIndexChange],
  );

  const handlePointerUp = useCallback(() => {
    dragTarget.current = null;
    setIsDragging(null);
  }, []);

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

  // ── Derived geometry ──────────────────────────────────────────────────────
  const minTick = data[0]?.tick ?? 0;
  const maxTick = data[data.length - 1]?.tick ?? 1;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getIndexForTick = (tick: number): number => {
    if (data.length === 0) return 0;
    if (tick <= data[0].tick) return 0;
    if (tick >= data[data.length - 1].tick) return data.length - 1;
    for (let i = 0; i < data.length - 1; i++) {
      if (tick >= data[i].tick && tick <= data[i + 1].tick) {
        const span = data[i + 1].tick - data[i].tick;
        if (span === 0) return i;
        return i + (tick - data[i].tick) / span;
      }
    }
    return data.length - 1;
  };

  const toPct = (tick: number) =>
    (getIndexForTick(Math.max(minTick, Math.min(tick, maxTick))) / Math.max(1, data.length - 1)) *
    100;

  const minPct = toPct(chartMinIndex);
  const maxPct = toPct(chartMaxIndex);
  const currentPricePct = currentPriceTick != null ? toPct(currentPriceTick) : null;

  const canInteract = !!(onMinIndexChange || onMaxIndexChange);

  // Size of the draggable handle thumbs (used to offset the chart top)
  const HANDLE_SIZE_PX = 16;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full group/chart"
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      {/* ── Bar area (padded top to make room for handle thumbs) ──────────── */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end gap-px"
        style={{ top: canInteract ? HANDLE_SIZE_PX / 2 : 0 }}
      >
        {data.map((entry, index) => {
          const isActive = entry.tick >= chartMinIndex && entry.tick <= chartMaxIndex;
          const heightPct = Math.max(2, (entry.value / maxValue) * 100);
          return (
            <div key={index} className="flex-1 relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 w-full rounded-t-sm"
                style={{
                  height: `${heightPct}%`,
                  background: isActive
                    ? `linear-gradient(to bottom, ${activeColor}, ${activeColor}44)`
                    : inactiveColor,
                  boxShadow: isActive ? `0 0 8px ${activeColor}33` : 'none',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Active range overlay ──────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 pointer-events-none transition-all duration-300"
        style={{
          top: canInteract ? HANDLE_SIZE_PX / 2 : 0,
          left: `${minPct}%`,
          width: `${maxPct - minPct}%`,
          background: `linear-gradient(to bottom, ${activeColor}1a, ${activeColor}05)`,
        }}
      >
        {/* Top cap line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: activeColor, boxShadow: `0 0 10px ${activeColor}80` }}
        />
      </div>

      {/* ── Current price marker ─────────────────────────────────────────── */}
      {currentPricePct != null && (
        <div
          className="absolute bottom-0 pointer-events-none"
          style={{
            top: canInteract ? HANDLE_SIZE_PX / 2 : 0,
            left: `${currentPricePct}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="w-px h-full"
            style={{
              background: '#00ff9d',
              boxShadow: '0 0 8px #00ff9d',
              backgroundImage:
                'repeating-linear-gradient(to bottom, #00ff9d 0px, #00ff9d 4px, transparent 4px, transparent 8px)',
            }}
          />
        </div>
      )}

      {/* ── MIN handle ───────────────────────────────────────────────────── */}
      {canInteract && (
        <div
          className="absolute inset-y-0 flex flex-col items-center transition-opacity"
          style={{
            left: `${minPct}%`,
            transform: 'translateX(-50%)',
            cursor: isDragging === 'min' ? 'grabbing' : 'ew-resize',
            zIndex: 10,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'min')}
          onPointerEnter={() => setHovered('min')}
          onPointerLeave={() => setHovered(null)}
        >
          {/* Handle Thumb */}
          <div
            className="shrink-0 rounded-full transition-all duration-200 flex items-center justify-center relative"
            style={{
              width: HANDLE_SIZE_PX,
              height: HANDLE_SIZE_PX,
              backgroundColor: hovered === 'min' || isDragging === 'min' ? '#fff' : '#0f172a',
              border: `2px solid ${activeColor}`,
              boxShadow:
                hovered === 'min' || isDragging === 'min'
                  ? `0 0 12px ${activeColor}`
                  : `0 0 4px ${activeColor}80`,
              transform: hovered === 'min' || isDragging === 'min' ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {/* Inner dot for extra detail */}
            <div
              className="w-1 h-1 rounded-full transition-all duration-200"
              style={{
                backgroundColor: hovered === 'min' || isDragging === 'min' ? activeColor : '#fff',
              }}
            />
          </div>
          {/* Line */}
          <div
            className="flex-1 w-0.5 transition-all duration-200"
            style={{
              background: activeColor,
              opacity: hovered === 'min' || isDragging === 'min' ? 1 : 0.5,
              boxShadow:
                hovered === 'min' || isDragging === 'min'
                  ? `0 0 8px ${activeColor}`
                  : `0 0 2px ${activeColor}40`,
            }}
          />
        </div>
      )}

      {/* ── MAX handle ───────────────────────────────────────────────────── */}
      {canInteract && (
        <div
          className="absolute inset-y-0 flex flex-col items-center transition-opacity"
          style={{
            left: `${maxPct}%`,
            transform: 'translateX(-50%)',
            cursor: isDragging === 'max' ? 'grabbing' : 'ew-resize',
            zIndex: 10,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'max')}
          onPointerEnter={() => setHovered('max')}
          onPointerLeave={() => setHovered(null)}
        >
          {/* Handle Thumb */}
          <div
            className="shrink-0 rounded-full transition-all duration-200 flex items-center justify-center relative"
            style={{
              width: HANDLE_SIZE_PX,
              height: HANDLE_SIZE_PX,
              backgroundColor: hovered === 'max' || isDragging === 'max' ? '#fff' : '#0f172a',
              border: `2px solid ${activeColor}`,
              boxShadow:
                hovered === 'max' || isDragging === 'max'
                  ? `0 0 12px ${activeColor}`
                  : `0 0 4px ${activeColor}80`,
              transform: hovered === 'max' || isDragging === 'max' ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {/* Inner dot for extra detail */}
            <div
              className="w-1 h-1 rounded-full transition-all duration-200"
              style={{
                backgroundColor: hovered === 'max' || isDragging === 'max' ? activeColor : '#fff',
              }}
            />
          </div>
          {/* Line */}
          <div
            className="flex-1 w-0.5 transition-all duration-200"
            style={{
              background: activeColor,
              opacity: hovered === 'max' || isDragging === 'max' ? 1 : 0.5,
              boxShadow:
                hovered === 'max' || isDragging === 'max'
                  ? `0 0 8px ${activeColor}`
                  : `0 0 2px ${activeColor}40`,
            }}
          />
        </div>
      )}
    </div>
  );
};
