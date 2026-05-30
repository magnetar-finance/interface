'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ClockIcon } from 'lucide-react';

export interface AdjustUnlockTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: string;
  currentExpiry?: string; // e.g. "Dec 2026"
}

const DURATION_OPTIONS = [
  { label: '3 months', weeks: 13 },
  { label: '6 months', weeks: 26 },
  { label: '1 year', weeks: 52 },
  { label: '2 years', weeks: 104 },
  { label: '4 years', weeks: 208 },
];

export const AdjustUnlockTimeModal: React.FC<AdjustUnlockTimeModalProps> = ({
  open,
  onOpenChange,
  tokenId,
  currentExpiry,
}) => {
  const [selectedWeeks, setSelectedWeeks] = useState<number | null>(null);

  useEffect(() => {
    if (!open) setSelectedWeeks(null);
  }, [open]);

  const newExpiry = selectedWeeks
    ? new Date(Date.now() + selectedWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Adjust Unlock Time">
      <div className="flex flex-col gap-6 p-5">
        {/* Lock info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Lock
            </span>
            <span className="text-white font-bold font-mono text-xs">{tokenId ?? '—'}</span>
          </div>
          <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Current Expiry
            </span>
            <span className="text-white font-bold font-mono text-xs">{currentExpiry ?? '—'}</span>
          </div>
        </div>

        {/* Duration picker */}
        <div className="flex flex-col gap-2">
          <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
            New Lock Duration (from today)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.weeks}
                onClick={() => setSelectedWeeks(opt.weeks)}
                className={`border px-3 py-2.5 font-mono text-xs text-left transition-colors ${
                  selectedWeeks === opt.weeks
                    ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                    : 'border-white/10 text-[#94a3b8] hover:border-white/30 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* New expiry preview */}
        {newExpiry && (
          <div className="flex justify-between items-center border border-[#2962ff]/20 bg-[#2962ff]/5 px-3 py-2.5">
            <span className="text-[#64748b] font-mono text-xs">New Unlock Date</span>
            <span className="text-[#2962ff] font-bold font-mono text-xs">{newExpiry}</span>
          </div>
        )}

        <PrimaryButton
          disabled={!selectedWeeks}
          className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            // TODO: call extend lock contract method
            onOpenChange(false);
          }}
        >
          <ClockIcon size={14} />
          Confirm New Unlock Time
        </PrimaryButton>
      </div>
    </Modal>
  );
};
