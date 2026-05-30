'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ShieldXIcon } from 'lucide-react';

export interface UnstakeLPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolName?: string;
  stakedBalance?: string; // e.g. "4.218 LP"
  stakedBalanceRaw?: number; // numeric value of staked LP
}

export const UnstakeLPModal: React.FC<UnstakeLPModalProps> = ({
  open,
  onOpenChange,
  poolName,
  stakedBalance = '0 LP',
  stakedBalanceRaw = 0,
}) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setPercentage(0);
  }, [open]);

  const unstakeAmount = useMemo(
    () => (stakedBalanceRaw * percentage) / 100,
    [stakedBalanceRaw, percentage],
  );

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Unstake LP">
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

        {/* Staked balance */}
        <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex justify-between items-center">
          <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
            Staked Balance
          </span>
          <span className="text-white font-bold font-mono text-xs">{stakedBalance}</span>
        </div>

        {/* Percentage slider */}
        <div className="flex flex-col gap-4 bg-white/5 border border-white/5 p-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-[#94a3b8] text-sm font-mono font-semibold">
              Amount to Unstake
            </span>
            <span className="text-[#2962ff] text-xl font-bold font-mono">{percentage}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#2962ff]"
          />

          <div className="flex w-full gap-1.5">
            {[25, 50, 75, 100].map((val) => (
              <button
                key={val}
                onClick={() => setPercentage(val)}
                className="flex-1 py-1.5 border border-white/10 text-xs font-mono text-[#94a3b8] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider"
              >
                {val === 100 ? 'Max' : `${val}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Amount preview */}
        {percentage > 0 && (
          <div className="flex justify-between items-center border border-[#ff4757]/20 bg-[#ff4757]/5 px-3 py-2.5">
            <span className="text-[#64748b] font-mono text-xs">You will unstake</span>
            <span className="text-[#ff4757] font-bold font-mono text-xs">
              {unstakeAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} LP
            </span>
          </div>
        )}

        <PrimaryButton
          disabled={percentage === 0}
          className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            // TODO: call unstake LP contract method
            onOpenChange(false);
          }}
        >
          <ShieldXIcon size={14} />
          Unstake LP
        </PrimaryButton>
      </div>
    </Modal>
  );
};
