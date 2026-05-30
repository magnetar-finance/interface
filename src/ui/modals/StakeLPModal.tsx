'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ShieldPlusIcon } from 'lucide-react';

export interface StakeLPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolName?: string;
  lpBalance?: string; // e.g. "4.218 LP"
}

export const StakeLPModal: React.FC<StakeLPModalProps> = ({
  open,
  onOpenChange,
  poolName,
  lpBalance = '0 LP',
}) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setAmount('');
  }, [open]);

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const isValid = parsedAmount > 0;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Stake LP">
      <div className="flex flex-col gap-6 p-5">
        {/* Pool info */}
        {poolName && (
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Pool
            </span>
            <span className="text-white font-bold font-mono text-xs">{poolName}</span>
          </div>
        )}

        {/* LP amount input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Amount to Stake
            </label>
            <span className="text-[#64748b] font-mono text-[10px]">
              Balance: <span className="text-white">{lpBalance}</span>
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
            <span className="text-[#64748b] font-mono text-xs px-3 shrink-0">LP</span>
          </div>

          {/* Quick percent buttons */}
          <div className="flex gap-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(String(pct))} // Placeholder — replace with real balance math
                className="flex-1 border border-white/10 py-1 font-mono text-[10px] text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] transition-colors"
              >
                {pct === 100 ? 'MAX' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Info row */}
        {isValid && (
          <div className="flex justify-between items-center border border-[#00ff9d]/20 bg-[#00ff9d]/5 px-3 py-2.5">
            <span className="text-[#64748b] font-mono text-xs">You will stake</span>
            <span className="text-[#00ff9d] font-bold font-mono text-xs">
              {parsedAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} LP
            </span>
          </div>
        )}

        <PrimaryButton
          disabled={!isValid}
          className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            // TODO: call stake LP contract method
            onOpenChange(false);
          }}
        >
          <ShieldPlusIcon size={14} />
          Stake LP
        </PrimaryButton>
      </div>
    </Modal>
  );
};
