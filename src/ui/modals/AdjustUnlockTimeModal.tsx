'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ClockIcon } from 'lucide-react';
import useIncreaseLockTime from '@/hooks/governance/useIncreaseLockTime';
import { BI_ZERO, CHAINS_INFORMATION } from '@/constants';
import { useChainId } from 'wagmi';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';
import { Spinner } from '@/components/Spinner';

export interface AdjustUnlockTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: bigint;
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
  tokenId = BI_ZERO,
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

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();

  const adjustLockTime = useIncreaseLockTime(
    tokenId,
    selectedWeeks ? BigInt(selectedWeeks * 7 * 24 * 60 * 60) : BI_ZERO,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Adjust Unlock Time">
        <div className="flex flex-col gap-6 p-5">
          {/* Lock info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-muted text-[11px] font-semibold">Lock</span>
              <span className="text-foreground font-bold font-mono text-xs">{tokenId ?? '—'}</span>
            </div>
            <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-muted text-[11px] font-semibold">Current Expiry</span>
              <span className="text-foreground font-bold font-mono text-xs">
                {currentExpiry ?? '—'}
              </span>
            </div>
          </div>

          {/* Duration picker */}
          <div className="flex flex-col gap-2">
            <label className="text-muted text-[11px] font-semibold">
              New Lock Duration (from today)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.weeks}
                  onClick={() => setSelectedWeeks(opt.weeks)}
                  className={`border px-3 py-2.5 font-mono text-xs text-left transition-colors ${
                    selectedWeeks === opt.weeks
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-white/10 text-muted hover:border-white/30 hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* New expiry preview */}
          {newExpiry && (
            <div className="flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 px-3 py-2.5">
              <span className="text-muted font-mono text-xs">New Unlock Date</span>
              <span className="text-accent font-bold font-mono text-xs">{newExpiry}</span>
            </div>
          )}

          <PrimaryButton
            disabled={!selectedWeeks || adjustLockTime.isLoading}
            className="w-full py-3 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={adjustLockTime.execute}
          >
            <ClockIcon size={14} />
            Confirm New Unlock Time
            {adjustLockTime.isLoading && <Spinner size="sm" className="ml-2" />}
          </PrimaryButton>
        </div>
      </Modal>

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          adjustLockTime.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Lock time successfully adjusted!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          adjustLockTime.reset();
        }}
        message={'An error occurred while adjusting lock time. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
