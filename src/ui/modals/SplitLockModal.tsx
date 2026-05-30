'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ScissorsIcon } from 'lucide-react';

export interface SplitLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: string;
  currentAmount?: string;
  currentVotingPower?: string;
}

export const SplitLockModal: React.FC<SplitLockModalProps> = ({
  open,
  onOpenChange,
  tokenId,
  currentAmount,
  currentVotingPower,
}) => {
  const [splitPct, setSplitPct] = useState(50);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setSplitPct(50);
  }, [open]);

  // Parse the raw number out of "25,000 MGN" for display
  const rawAmount = parseFloat((currentAmount ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const amountA = ((splitPct / 100) * rawAmount).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
  const amountB = (((100 - splitPct) / 100) * rawAmount).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

  const rawVP = parseFloat((currentVotingPower ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const vpA = ((splitPct / 100) * rawVP).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const vpB = (((100 - splitPct) / 100) * rawVP).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Split Lock">
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
              Total Locked
            </span>
            <span className="text-white font-bold font-mono text-xs">{currentAmount ?? '—'}</span>
          </div>
        </div>

        {/* Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Split Ratio
            </label>
            <span className="text-[#2962ff] font-bold font-mono text-xs">
              {splitPct}% / {100 - splitPct}%
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={99}
            value={splitPct}
            onChange={(e) => setSplitPct(Number(e.target.value))}
            className="w-full accent-[#2962ff] cursor-pointer"
          />

          {/* Quick splits */}
          <div className="flex gap-1.5">
            {[25, 33, 50, 67, 75].map((v) => (
              <button
                key={v}
                onClick={() => setSplitPct(v)}
                className={`flex-1 border py-1 font-mono text-[10px] transition-colors ${
                  splitPct === v
                    ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                    : 'border-white/10 text-[#94a3b8] hover:border-white/30'
                }`}
              >
                {v}/{100 - v}
              </button>
            ))}
          </div>
        </div>

        {/* Result preview */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-[#2962ff]/20 bg-[#2962ff]/5 px-3 py-3 flex flex-col gap-1">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Lock A
            </span>
            <span className="text-white font-bold font-mono text-xs">{amountA} MGN</span>
            <span className="text-[#2962ff] font-mono text-[10px]">{vpA} veMGN</span>
          </div>
          <div className="border border-[#2962ff]/20 bg-[#2962ff]/5 px-3 py-3 flex flex-col gap-1">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Lock B (new)
            </span>
            <span className="text-white font-bold font-mono text-xs">{amountB} MGN</span>
            <span className="text-[#2962ff] font-mono text-[10px]">{vpB} veMGN</span>
          </div>
        </div>

        <PrimaryButton
          className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest"
          onClick={() => {
            // TODO: call split lock contract method
            onOpenChange(false);
          }}
        >
          <ScissorsIcon size={14} />
          Confirm Split
        </PrimaryButton>
      </div>
    </Modal>
  );
};
