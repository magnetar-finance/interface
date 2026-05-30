'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { GitMergeIcon, LockIcon, ChevronDownIcon } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { formatNumber } from '@/utils';

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setTargetId(null);
  }, [open]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Merge Lock">
      <div className="flex flex-col gap-6 p-5">
        {/* Source lock */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
            Source Lock (will be burned)
          </span>
          <div className="flex items-center justify-between border border-[#ff4757]/20 bg-[#ff4757]/5 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <LockIcon size={12} className="text-[#ff4757]" />
              <span className="font-bold font-mono text-xs text-white">
                Lock {sourceLock?.id ?? '—'}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-white font-mono text-xs">
                {sourceLock ? formatNumber(sourceLock.position as string) : '—'}
              </span>
              <span className="text-[#2962ff] font-mono text-[10px]">
                {sourceLock ? formatNumber(sourceLock.totalVoteWeightGiven as string) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Target lock dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
            Merge Into
          </label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-between border border-white/10 px-3 py-2.5 w-full text-left font-mono text-xs hover:border-[#2962ff]/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <LockIcon size={12} className="text-[#2962ff]" />
                  {targetLock ? (
                    <span className="text-white">
                      Lock {targetLock.id}{' '}
                      <span className="text-[#2962ff]">
                        — {formatNumber(targetLock.totalVoteWeightGiven as string)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#64748b]">Select a lock…</span>
                  )}
                </div>
                <ChevronDownIcon size={12} className="text-[#64748b]" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="border border-[#2962ff]/30 bg-black px-2 py-2 space-y-1 z-50 font-mono text-xs shadow-xl w-(--radix-popper-anchor-width)"
                sideOffset={4}
              >
                {mergeableLocks.length === 0 ? (
                  <p className="text-[#64748b] px-3 py-2">No other locks available</p>
                ) : (
                  mergeableLocks.map((lock) => (
                    <DropdownMenu.Item
                      key={lock.id}
                      onClick={() => setTargetId(lock.id)}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer outline-none transition-colors ${
                        targetId === lock.id
                          ? 'bg-[#2962ff]/10 text-[#2962ff]'
                          : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold">Lock {lock.id}</span>
                        <span className="text-[#64748b] text-[10px]">
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
                      <span className="text-[#00ff9d] font-bold whitespace-nowrap">
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
          <div className="border border-[#00ff9d]/20 bg-[#00ff9d]/5 px-3 py-2.5 flex flex-col gap-1">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest mb-0.5">
              After Merge
            </span>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#64748b]">Combined Voting Power</span>
              <span className="text-[#00ff9d] font-bold">
                ~{formatNumber(targetLock.totalVoteWeightGiven as string)}
              </span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#64748b]">Surviving Lock</span>
              <span className="text-white font-bold">Lock {targetLock.id}</span>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="border border-[#ffaf52]/20 bg-[#ffaf52]/5 px-3 py-2.5">
          <p className="text-[#ffaf52] font-mono text-[10px] leading-relaxed">
            ⚠ The source lock (Lock {sourceLock?.id ?? '—'}) will be permanently burned after
            merging. Its MGN and voting power will be transferred to the target lock.
          </p>
        </div>

        <PrimaryButton
          disabled={!isValid}
          className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            // TODO: call merge lock contract method
            onOpenChange(false);
          }}
        >
          <GitMergeIcon size={14} />
          Confirm Merge
        </PrimaryButton>
      </div>
    </Modal>
  );
};
