'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface RangeDistributionChartProps {
  data: { value: number; tick: number }[];
  chartMinIndex: number;
  chartMaxIndex: number;
  activeColor?: string;
  /** Optional tick for the current price — renders a dashed marker line */
  currentPriceTick?: number;
  /** Called with the new tick value when the left (min) handle is dragged */
  onMinIndexChange?: (index: number) => void;
  /** Called with the new tick value when the right (max) handle is dragged */
  onMaxIndexChange?: (index: number) => void;
}

type DragTarget = 'min' | 'max' | null;

/** Clamp a value to [lo, hi] */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const RangeDistributionChart: React.FC<RangeDistributionChartProps> = ({
  data,
  chartMinIndex,
  chartMaxIndex,
  activeColor = '#00ff9d',
  currentPriceTick,
  onMinIndexChange,
  onMaxIndexChange,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<DragTarget>(null);
  const [isDragging, setIsDragging] = useState<DragTarget>(null);
  const [hovered, setHovered] = useState<'min' | 'max' | null>(null);

  // ── Drag logic ─────────────────────────────────────────────────────────────
  const clientXToTick = useCallback(
    (clientX: number): number => {
      const el = wrapperRef.current;
      if (!el || data.length === 0) return 0;
      const rect = el.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
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

  // ── Derived geometry ───────────────────────────────────────────────────────
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
    (getIndexForTick(clamp(tick, minTick, maxTick)) / Math.max(1, data.length - 1)) * 100;

  const minPct = toPct(chartMinIndex);
  const maxPct = toPct(chartMaxIndex);
  const currentPricePct = currentPriceTick != null ? toPct(currentPriceTick) : null;

  const canInteract = !!(onMinIndexChange || onMaxIndexChange);

  // Derived accent variants
  const activeColorGlow = `${activeColor}88`;
  const activeColorFaint = `${activeColor}18`;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      {/* ── Bar columns ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 flex items-end" style={{ top: 0, gap: '1.5px' }}>
        {data.map((entry, index) => {
          const isActive = entry.tick >= chartMinIndex && entry.tick <= chartMaxIndex;
          const heightPct = Math.max(3, (entry.value / maxValue) * 100);

          return (
            <div key={index} className="flex-1 relative" style={{ height: '100%' }}>
              {/* Bar body */}
              <div
                className="absolute bottom-0 w-full"
                style={{
                  height: `${heightPct}%`,
                  borderRadius: '1px 1px 0 0',
                  background: isActive
                    ? `linear-gradient(to top, ${activeColor}55 0%, ${activeColor}bb 70%, ${activeColor} 100%)`
                    : `linear-gradient(to top, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)`,
                  boxShadow: isActive ? `0 0 4px ${activeColor}66` : 'none',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Active range area overlay ────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 pointer-events-none"
        style={{
          top: 0,
          left: `${minPct}%`,
          width: `${maxPct - minPct}%`,
          background: `linear-gradient(to bottom, ${activeColorFaint} 0%, transparent 100%)`,
          transition: 'left 0.15s ease, width 0.15s ease',
        }}
      >
        {/* Animated glowing top border */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: '2px',
            background: `linear-gradient(to right, transparent, ${activeColor}, ${activeColor}, transparent)`,
            boxShadow: `0 0 8px ${activeColor}, 0 0 18px ${activeColorGlow}`,
          }}
        />
      </div>

      {/* ── Left range boundary shading ─────────────────────────────────────── */}
      <div
        className="absolute bottom-0 pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: `${minPct}%`,
          background: 'rgba(0,0,0,0.35)',
          transition: 'width 0.15s ease',
        }}
      />

      {/* ── Right range boundary shading ────────────────────────────────────── */}
      <div
        className="absolute bottom-0 pointer-events-none"
        style={{
          top: 0,
          left: `${maxPct}%`,
          right: 0,
          background: 'rgba(0,0,0,0.35)',
          transition: 'left 0.15s ease',
        }}
      />

      {/* ── Current price needle ─────────────────────────────────────────────── */}
      {currentPricePct != null && (
        <div
          className="absolute bottom-0 pointer-events-none"
          style={{
            top: 0,
            left: `${currentPricePct}%`,
            transform: 'translateX(-50%)',
            zIndex: 8,
          }}
        >
          {/* Label chip */}
          <div
            className="absolute font-mono font-bold whitespace-nowrap"
            style={{
              top: -2,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              letterSpacing: '0.05em',
              color: '#00ff9d',
              background: 'rgba(0,255,157,0.12)',
              border: '1px solid rgba(0,255,157,0.4)',
              padding: '1px 5px',
              borderRadius: '2px',
              lineHeight: '1.4',
            }}
          >
            NOW
          </div>
          {/* Dashed needle line */}
          <div
            className="absolute top-4 bottom-0 left-1/2"
            style={{
              width: '1px',
              transform: 'translateX(-50%)',
              backgroundImage:
                'repeating-linear-gradient(to bottom, #00ff9d 0px, #00ff9d 5px, transparent 5px, transparent 9px)',
              boxShadow: '0 0 6px #00ff9d80',
            }}
          />
          {/* Base dot */}
          <div
            className="absolute bottom-0 left-1/2"
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#00ff9d',
              boxShadow: '0 0 8px #00ff9d',
              transform: 'translateX(-50%) translateY(2px)',
            }}
          />
        </div>
      )}

      {/* ── MIN handle ──────────────────────────────────────────────────────── */}
      {canInteract && (
        <HandleBar
          pct={minPct}
          isActive={hovered === 'min' || isDragging === 'min'}
          isDragging={isDragging === 'min'}
          color={activeColor}
          onPointerDown={(e) => handlePointerDown(e, 'min')}
          onPointerEnter={() => setHovered('min')}
          onPointerLeave={() => setHovered(null)}
        />
      )}

      {/* ── MAX handle ──────────────────────────────────────────────────────── */}
      {canInteract && (
        <HandleBar
          pct={maxPct}
          isActive={hovered === 'max' || isDragging === 'max'}
          isDragging={isDragging === 'max'}
          color={activeColor}
          onPointerDown={(e) => handlePointerDown(e, 'max')}
          onPointerEnter={() => setHovered('max')}
          onPointerLeave={() => setHovered(null)}
        />
      )}
    </div>
  );
};

// ── HandleBar sub-component ──────────────────────────────────────────────────
interface HandleBarProps {
  pct: number;
  isActive: boolean;
  isDragging: boolean;
  color: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

const HandleBar: React.FC<HandleBarProps> = ({
  pct,
  isActive,
  isDragging,
  color,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  const glowStrong = `${color}99`;
  const glowFaint = `${color}33`;

  return (
    <div
      className="absolute inset-y-0 flex flex-col items-center"
      style={{
        left: `${pct}%`,
        transform: 'translateX(-50%)',
        cursor: isDragging ? 'grabbing' : 'ew-resize',
        zIndex: 20,
        transition: 'left 0.1s ease',
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Vertical handle line */}
      <div
        className="absolute inset-y-0"
        style={{
          width: '2px',
          top: 0,
          bottom: 0,
          background: isActive ? color : `${color}88`,
          boxShadow: isActive
            ? `0 0 8px ${glowStrong}, 0 0 16px ${glowFaint}`
            : `0 0 4px ${glowFaint}`,
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
        }}
      />

      {/* Rectangular grip thumb */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 10,
          height: 22,
          flexShrink: 0,
          background: isActive ? color : '#0d1120',
          border: `1px solid ${isActive ? color : `${color}88`}`,
          boxShadow: isActive
            ? `0 0 0 1px ${glowFaint}, 0 0 12px ${glowStrong}, inset 0 0 4px ${color}44`
            : `0 0 4px ${glowFaint}`,
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* Grip notches — three horizontal scanlines */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '15%',
              right: '15%',
              height: '1px',
              top: `${28 + i * 18}%`,
              background: isActive ? 'rgba(0,0,0,0.5)' : `${color}55`,
              transition: 'background 0.15s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
