'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { LockIcon } from 'lucide-react';
import { useChainId } from 'wagmi';
import { CHAINS_INFORMATION, MGN, REFETCH_INTERVALS, VE } from '@/constants';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import { formatEther, parseEther } from 'viem';
import useCreateLock from '@/hooks/governance/useCreateLock';
import { TransactionErrorModal } from './TransactionErrorModal';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { Spinner } from '@/components/Spinner';
import { formatNumber } from '@/utils';

export interface CreateLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAY_PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1yr', days: 365 },
  { label: '4yr', days: 1461 },
];

const MAX_LOCK_DAYS = 1461; // 4 years

export const CreateLockModal: React.FC<CreateLockModalProps> = ({ open, onOpenChange }) => {
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('');

  const chainId = useChainId();
  const mgn = useMemo(() => MGN[chainId], [chainId]);
  const escrow = useMemo(() => VE[chainId], [chainId]);

  useEffect(() => {
    if (!open) {
      setAmount('');
      setDays('');
    }
  }, [open]);

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const parsedDays = parseInt(days, 10) || 0;

  const isValid = parsedAmount > 0 && parsedDays >= 7 && parsedDays <= MAX_LOCK_DAYS;

  // Estimated veMGN = amount × (days / maxDays)
  const estimatedVeMGN = useMemo(
    () => parsedAmount * (parsedDays / MAX_LOCK_DAYS),
    [parsedAmount, parsedDays],
  );

  const unlockDate = useMemo(() => {
    if (!parsedDays) return null;
    return new Date(Date.now() + parsedDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [parsedDays]);

  const amountBI = useMemo(() => parseEther(parsedAmount.toString()), [parsedAmount]);

  const balance = useGetBalance(mgn, REFETCH_INTERVALS);
  const escrowAllowance = useGetAllowance(mgn, escrow, REFETCH_INTERVALS);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  // Executions
  const escrowApproval = useApproveSpend(mgn, escrow, amountBI);
  const lockCreation = useCreateLock(
    amountBI,
    BigInt(parsedDays * 60 * 60 * 24),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const buttonText = useMemo(() => {
    if (!amount || parsedAmount === 0) return 'Enter Amount';
    if (balance < amountBI) return 'Insufficient MGN Balance';
    if (escrowAllowance < amountBI) return 'Approve MGN Spend';
    return 'Create Lock';
  }, [amount, amountBI, balance, escrowAllowance, parsedAmount]);

  const initiateTransaction = useCallback(() => {
    if (escrowAllowance < amountBI) {
      escrowApproval.reset();
      return escrowApproval.execute();
    }
    return lockCreation.execute();
  }, [amountBI, escrowAllowance, escrowApproval, lockCreation]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Create Lock">
        <div className="flex flex-col gap-6 p-5">
          {/* MGN amount input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Amount to Lock
              </label>
              <span className="text-[#64748b] font-mono text-[10px]">
                Balance:{' '}
                <span className="text-white">{formatNumber(formatEther(balance), 'en-US', 3)}</span>
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
                  onClick={() => setAmount(String((pct * parseFloat(formatEther(balance))) / 100))}
                  className="flex-1 border border-white/10 py-1 font-mono text-[10px] text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] transition-colors"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Lock duration input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Lock Duration (days)
            </label>

            <div className="flex items-center gap-2 border border-white/10 focus-within:border-[#2962ff]/60 transition-colors">
              <input
                type="number"
                min="7"
                max={MAX_LOCK_DAYS}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. 365"
                className="bg-transparent px-3 py-3 font-mono text-sm text-white placeholder:text-[#64748b] outline-none flex-1 min-w-0"
              />
              <span className="text-[#64748b] font-mono text-xs px-3 shrink-0">days</span>
            </div>

            {/* Quick duration presets */}
            <div className="flex gap-1.5">
              {DAY_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => setDays(String(preset.days))}
                  className={`flex-1 border py-1.5 font-mono text-[10px] transition-colors ${
                    parsedDays === preset.days
                      ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                      : 'border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {parsedDays > 0 && parsedDays < 7 && (
              <p className="text-[#ff4757] font-mono text-[10px]">
                Minimum lock duration is 7 days.
              </p>
            )}
            {parsedDays > MAX_LOCK_DAYS && (
              <p className="text-[#ff4757] font-mono text-[10px]">
                Maximum lock duration is 4 years (1461 days).
              </p>
            )}
          </div>

          {/* Preview card */}
          {isValid && (
            <div className="flex flex-col gap-2 border border-[#2962ff]/20 bg-[#2962ff]/5 px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="text-[#64748b] font-mono text-xs">Estimated veMGN</span>
                <span className="text-[#2962ff] font-bold font-mono text-xs">
                  {estimatedVeMGN.toLocaleString('en-US', { maximumFractionDigits: 4 })} veMGN
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748b] font-mono text-xs">Unlock Date</span>
                <span className="text-white font-bold font-mono text-xs">{unlockDate}</span>
              </div>
            </div>
          )}

          <PrimaryButton
            disabled={!isValid || escrowApproval.isLoading || lockCreation.isLoading}
            className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={initiateTransaction}
          >
            <LockIcon size={14} />
            {buttonText}{' '}
            {(escrowApproval.isLoading || lockCreation.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        </div>
      </Modal>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          escrowApproval.reset();
          lockCreation.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Lock created successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          escrowApproval.reset();
          lockCreation.reset();
        }}
        message={'An error occurred while creating lock. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
