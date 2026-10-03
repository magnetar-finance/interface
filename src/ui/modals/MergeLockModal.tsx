'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { GitMergeIcon, LockIcon, ChevronDownIcon } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { formatNumber } from '@/utils';
import useMergeLock from '@/hooks/governance/useMergeLock';
import { BI_ZERO, CHAINS_INFORMATION } from '@/constants';
import { useChainId } from 'wagmi';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';
import { Spinner } from '@/components/Spinner';

type Lock = NonNullable<GetAccountInfoQuery['user']>['lockPositions'][number];

export interface MergeLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceLock?: Lock;
  availableLocks?: Lock[];
}

export const MergeLockModal: React.FC<MergeLockModalProps> = ({
  open,
  onOpenChange,
  sourceLock,
  availableLocks = [],
}) => {
  const [targetId, setTargetId] = useState<string | null>(null);

  const targetLock = availableLocks.find((l) => l.id === targetId);
  const mergeableLocks = availableLocks.filter((l) => l.id !== sourceLock?.id);
  const isValid = !!targetId;

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();

  const mergeLock = useMergeLock(
    sourceLock ? BigInt(sourceLock.id) : BI_ZERO,
    targetId ? BigInt(targetId) : BI_ZERO,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  useEffect(() => {
    if (!open) setTargetId(null);
  }, [open]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Merge Lock">
        <div className="flex flex-col gap-6 p-5">
          {/* Source lock */}
          <div className="flex flex-col gap-1.5">
            <span className="text-muted text-[11px] font-semibold">
              Source Lock (will be burned)
            </span>
            <div className="flex items-center justify-between border border-alert/20 bg-alert/5 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <LockIcon size={12} className="text-alert" />
                <span className="font-bold font-mono text-xs text-foreground">
                  Lock {sourceLock?.id ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-foreground font-mono text-xs">
                  {sourceLock ? formatNumber(sourceLock.position as string) : '—'}
                </span>
                <span className="text-accent font-mono text-[10px]">
                  {sourceLock ? formatNumber(sourceLock.totalVoteWeightGiven as string) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Target lock dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-muted text-[11px] font-semibold">Merge Into</label>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-between border border-white/10 px-3 py-2.5 w-full text-left font-mono text-xs hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <LockIcon size={12} className="text-accent" />
                    {targetLock ? (
                      <span className="text-foreground">
                        Lock {targetLock.id}{' '}
                        <span className="text-accent">
                          — {formatNumber(targetLock.totalVoteWeightGiven as string)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted">Select a lock…</span>
                    )}
                  </div>
                  <ChevronDownIcon size={12} className="text-muted" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 w-(--radix-popper-anchor-width) space-y-1 rounded-2xl border border-white/[0.08] bg-surface/95 px-1.5 py-2 text-xs shadow-xl backdrop-blur-xl"
                  sideOffset={4}
                >
                  {mergeableLocks.length === 0 ? (
                    <p className="text-muted px-3 py-2">No other locks available</p>
                  ) : (
                    mergeableLocks.map((lock) => (
                      <DropdownMenu.Item
                        key={lock.id}
                        onClick={() => setTargetId(lock.id)}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer outline-none transition-colors ${
                          targetId === lock.id
                            ? 'bg-accent/10 text-accent'
                            : 'text-muted hover:bg-white/5 hover:text-foreground'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">Lock {lock.id}</span>
                          <span className="text-muted text-[10px]">
                            {formatNumber(lock.position as string)} · Expires{' '}
                            {new Date(parseInt(lock.unlockTime as string) * 1000).toLocaleString(
                              'en-US',
                              {
                                minute: '2-digit',
                                hour: '2-digit',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        <span className="text-accent-2 font-bold whitespace-nowrap">
                          {formatNumber(lock.totalVoteWeightGiven as string)}
                        </span>
                      </DropdownMenu.Item>
                    ))
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Result preview */}
          {targetLock && sourceLock && (
            <div className="flex flex-col gap-1 rounded-2xl border border-accent-2/20 bg-accent-2/5 px-3 py-2.5">
              <span className="text-muted text-[11px] font-semibold mb-0.5">After Merge</span>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted">Combined Voting Power</span>
                <span className="text-accent-2 font-bold">
                  ~{formatNumber(targetLock.totalVoteWeightGiven as string)}
                </span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted">Surviving Lock</span>
                <span className="text-foreground font-bold">Lock {targetLock.id}</span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-2xl border border-warning/20 bg-warning/5 px-3 py-2.5">
            <p className="text-warning font-mono text-[10px] leading-relaxed">
              ⚠ The source lock (Lock {sourceLock?.id ?? '—'}) will be permanently burned after
              merging. Its MGN and voting power will be transferred to the target lock.
            </p>
          </div>

          <PrimaryButton
            disabled={!isValid || mergeLock.isLoading}
            className="w-full py-3 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={mergeLock.execute}
          >
            <GitMergeIcon size={14} />
            Confirm Merge
            {mergeLock.isLoading && <Spinner size="sm" className="ml-2" />}
          </PrimaryButton>
        </div>
      </Modal>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          mergeLock.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Successfully merged locks!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          mergeLock.reset();
        }}
        message={'An error occurred while merging lock. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
