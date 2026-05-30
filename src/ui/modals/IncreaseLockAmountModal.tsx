'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { TrendingUpIcon } from 'lucide-react';

export interface IncreaseLockAmountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: string;
  currentAmount?: string; // e.g. "25,000 MGN"
  currentVotingPower?: string; // e.g. "12,500.00 veMGN"
  walletBalance?: string; // e.g. "50,000 MGN"
}

export const IncreaseLockAmountModal: React.FC<IncreaseLockAmountModalProps> = ({
  open,
  onOpenChange,
  tokenId,
  currentAmount,
  currentVotingPower,
  walletBalance = '0 MGN',
}) => {
  const [amount, setAmount] = useState('');

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const isValid = parsedAmount > 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setAmount('');
  }, [open]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Increase Lock Amount">
      <div className="flex flex-col gap-6 p-5">
        {/* Current stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Currently Locked ({tokenId})
            </span>
            <span className="text-white font-bold font-mono text-xs">{currentAmount ?? '—'}</span>
          </div>
          <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Voting Power Used
            </span>
            <span className="text-[#2962ff] font-bold font-mono text-xs">
              {currentVotingPower ?? '—'}
            </span>
          </div>
        </div>

        {/* Amount input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Amount to Add
            </label>
            <span className="text-[#64748b] font-mono text-[10px]">
              Balance: <span className="text-white">{walletBalance}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 border border-white/10 focus-within:border-[#2962ff]/60 transition-colors">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent px-3 py-3 font-mono text-sm text-white placeholder:text-[#64748b] outline-none flex-1 min-w-0"
            />
            <span className="text-[#64748b] font-mono text-xs px-3 shrink-0">MGN</span>
          </div>

          {/* Quick percent buttons */}
          <div className="flex gap-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(String(pct))} // placeholder — replace with real balance math
                className="flex-1 border border-white/10 py-1 font-mono text-[10px] text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Estimated new veMGN */}
        {isValid && (
          <div className="flex justify-between items-center border border-[#00ff9d]/20 bg-[#00ff9d]/5 px-3 py-2.5">
            <span className="text-[#64748b] font-mono text-xs">Est. Additional veMGN</span>
            <span className="text-[#00ff9d] font-bold font-mono text-xs">
              +{(parsedAmount * 0.5).toLocaleString('en-US', { maximumFractionDigits: 2 })} veMGN
            </span>
          </div>
        )}

        <PrimaryButton
          disabled={!isValid}
          className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            // TODO: call increase lock amount contract method
            onOpenChange(false);
          }}
        >
          <TrendingUpIcon size={14} />
          Increase Lock
        </PrimaryButton>
      </div>
    </Modal>
  );
};
