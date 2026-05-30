'use client';

import React, { useMemo, useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { FancyCard } from '@/components/Card';
import { PrimaryButton } from '@/components/Button';
import { Table } from '@/components/Table';
import { SwitchGroup } from '@/components/SwitchGroup';
import {
  LockIcon,
  PlusIcon,
  ArrowRightLeftIcon,
  ClockIcon,
  TrendingUpIcon,
  GitMergeIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  BuildingIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { TransferLockModal } from '@/ui/modals/TransferLockModal';
import { AdjustUnlockTimeModal } from '@/ui/modals/AdjustUnlockTimeModal';
import { IncreaseLockAmountModal } from '@/ui/modals/IncreaseLockAmountModal';
import { MergeLockModal } from '@/ui/modals/MergeLockModal';
import { SplitLockModal } from '@/ui/modals/SplitLockModal';
import { CreateLockModal } from '@/ui/modals/CreateLockModal';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import { REFETCH_INTERVALS } from '@/constants';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { useAtomicDate } from '@/hooks/app';
import { formatNumber } from '@/utils';
import { Pagination } from '@/components/Pagination';

type Lock = NonNullable<GetAccountInfoQuery['user']>['lockPositions'][number];

interface LockAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

const LockActionMenu: React.FC<{
  onAction: (action: 'transfer' | 'extend' | 'increase' | 'merge' | 'split') => void;
}> = ({ onAction }) => {
  const actions: LockAction[] = [
    {
      label: 'Transfer',
      icon: <ArrowRightLeftIcon size={12} />,
      onClick: () => onAction('transfer'),
    },
    {
      label: 'Adjust Unlock Time',
      icon: <ClockIcon size={12} />,
      onClick: () => onAction('extend'),
    },
    {
      label: 'Increase Amount',
      icon: <TrendingUpIcon size={12} />,
      onClick: () => onAction('increase'),
    },
    {
      label: 'Merge Into…',
      icon: <GitMergeIcon size={12} />,
      onClick: () => onAction('merge'),
    },
    {
      label: 'Split',
      icon: <ScissorsIcon size={12} />,
      onClick: () => onAction('split'),
    },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-1.5 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Lock actions"
        >
          <MoreHorizontalIcon size={14} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="border border-[#2962ff]/30 bg-black py-1 z-50 font-mono text-xs shadow-xl min-w-45"
          sideOffset={4}
          align="end"
        >
          {actions.map((action) => (
            <DropdownMenu.Item
              key={action.label}
              onClick={action.onClick}
              className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors outline-none ${
                action.danger
                  ? 'text-[#ff4757] hover:bg-[#ff4757]/10 focus:bg-[#ff4757]/10'
                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'
              }`}
            >
              <span className="opacity-70">{action.icon}</span>
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const WEEK_IN_SECS = 60 * 60 * 24 * 7;

const StatusBadge: React.FC<{ unlockTime: Lock['unlockTime'] }> = ({ unlockTime }) => {
  const expiry = parseInt(unlockTime as string);
  const date = useAtomicDate(5000);
  const now = useMemo(() => Math.floor(date.getTime() / 1000), [date]);
  const style = useMemo(() => {
    if (expiry > now && expiry - now <= WEEK_IN_SECS)
      return 'bg-[#ffaf52]/10 text-[#ffaf52] border-[#ffaf52]/30';
    if (now < expiry) return 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30';
    return 'bg-white/5 text-[#64748b] border-white/10';
  }, [expiry, now]);

  const status = useMemo(() => {
    if (expiry > now && expiry - now <= WEEK_IN_SECS) return 'EXPIRING';
    if (now < expiry) return 'ACTIVE';
    return 'EXPIRED';
  }, [expiry, now]);

  return (
    <span
      className={`text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${style}`}
    >
      {status}
    </span>
  );
};

// ─── Tab 1: My Locks ─────────────────────────────────────────────────────────

type ActiveModal = 'transfer' | 'extend' | 'increase' | 'merge' | 'split' | 'createLock' | null;

const MyLocksTab: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedLockId, setSelectedLockId] = useState<string | null>(null);

  const { data: accountInfo } = useAccountInfo(REFETCH_INTERVALS);
  const allLocks = useMemo(() => {
    if (!accountInfo) return [];
    return accountInfo.lockPositions;
  }, [accountInfo]);

  const selectedLock = useMemo(
    () => allLocks.find((lock) => lock.id === selectedLockId),
    [allLocks, selectedLockId],
  );

  const handleAction = (lockId: string, action: ActiveModal) => {
    setSelectedLockId(lockId);
    setActiveModal(action);
  };

  const closeModal = (open: boolean) => {
    if (!open) {
      setActiveModal(null);
      // Give the fade-out transition a moment before unmounting the selected lock data
      setTimeout(() => setSelectedLockId(null), 200);
    }
  };

  const totalVotingPower = useMemo(
    () =>
      allLocks.reduce((accumulator, lock) => {
        const value = accumulator + parseFloat(lock.totalVoteWeightGiven as string);
        return value;
      }, 0),
    [allLocks],
  );
  const totalLocked = useMemo(
    () =>
      allLocks.reduce((accumulator, lock) => {
        const value = accumulator + parseFloat(lock.position as string);
        return value;
      }, 0),
    [allLocks],
  );

  const date = useAtomicDate(5000);
  const now = useMemo(() => Math.floor(date.getTime() / 1000), [date]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(allLocks.length / 10), [allLocks.length]);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Locks', value: allLocks.length.toString(), color: 'text-white' },
          { label: 'Total Locked', value: totalLocked, color: 'text-white' },
          {
            label: 'Total Voting Power Used',
            value: totalVotingPower.toFixed(4),
            color: 'text-[#2962ff]',
          },
          {
            label: 'Active Locks',
            value: allLocks.filter((l) => parseInt(l.unlockTime as string) < now).length.toString(),
            color: 'text-[#00ff9d]',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-white/5 bg-white/3 px-4 py-3 flex flex-col gap-1"
          >
            <span className="text-[#64748b] text-[10px] font-mono uppercase tracking-widest">
              {stat.label}
            </span>
            <span className={`font-bold font-mono text-sm ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <FancyCard>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold font-mono text-xs uppercase tracking-widest">
              Your Locks
            </h3>
            <PrimaryButton
              className="text-xs font-mono gap-2 py-2 px-4"
              onClick={() => setActiveModal('createLock')}
            >
              <PlusIcon size={12} />
              <span>Create Lock</span>
            </PrimaryButton>
          </div>

          <Table<Lock>
            headers={[
              { label: 'Lock', align: 'left' },
              { label: 'Locked Amount', align: 'right' },
              { label: 'Voting Power Used', align: 'right' },
              { label: 'Expires', align: 'right' },
              { label: 'Status', align: 'center' },
              { label: '', align: 'right' },
            ]}
            data={allLocks.slice((currentPage - 1) * 10, currentPage * 10)}
            renderRow={(lock) => (
              <>
                {/* Lock ID */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-1.5">
                      <LockIcon size={12} className="text-[#2962ff]" />
                    </div>
                    <span className="font-bold font-mono text-white text-xs">Lock {lock.id}</span>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-3 pr-4 text-right font-mono text-xs text-white font-bold">
                  {formatNumber(lock.position as string, 'en-US', 3)}
                </td>

                {/* Voting Power */}
                <td className="py-3 pr-4 text-right font-mono text-xs font-bold text-[#2962ff]">
                  {formatNumber(lock.totalVoteWeightGiven as string, 'en-US', 3)}
                </td>

                {/* Expires */}
                <td className="py-3 pr-4 text-right font-mono text-xs text-[#64748b]">
                  {new Date(parseInt(lock.unlockTime as string) * 1000).toLocaleString('en-US', {
                    minute: '2-digit',
                    hour: '2-digit',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>

                {/* Status */}
                <td className="py-3 pr-4 text-center">
                  <StatusBadge unlockTime={lock.unlockTime} />
                </td>

                {/* Actions */}
                <td className="py-3 text-right">
                  <LockActionMenu onAction={(action) => handleAction(lock.id, action)} />
                </td>
              </>
            )}
            renderEmpty={() => (
              <div className="w-full flex flex-col items-center justify-center gap-6 py-16">
                <div className="border-2 border-dashed border-white/10 p-6">
                  <LockIcon size={48} className="text-[#64748b]" />
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-white font-bold text-base uppercase tracking-widest font-mono">
                    No Locks Found
                  </h4>
                  <p className="text-[#64748b] font-mono text-xs">
                    Lock MGN tokens to earn veMGN voting power.
                  </p>
                </div>
                <PrimaryButton
                  className="text-xs font-mono gap-2"
                  onClick={() => setActiveModal('createLock')}
                >
                  <PlusIcon size={12} />
                  <span>Create Your First Lock</span>
                </PrimaryButton>
              </div>
            )}
          />
          <div className="mt-6 flex justify-end items-center w-full">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </FancyCard>

      {/* Modals */}
      <CreateLockModal open={activeModal === 'createLock'} onOpenChange={closeModal} />
      <TransferLockModal
        open={activeModal === 'transfer'}
        onOpenChange={closeModal}
        tokenId={selectedLock?.id}
      />

      <AdjustUnlockTimeModal
        open={activeModal === 'extend'}
        onOpenChange={closeModal}
        tokenId={selectedLock?.id}
        currentExpiry={
          selectedLock
            ? new Date(parseInt(selectedLock.unlockTime as string) * 1000).toLocaleString('en-US', {
                minute: '2-digit',
                hour: '2-digit',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : undefined
        }
      />

      <IncreaseLockAmountModal
        open={activeModal === 'increase'}
        onOpenChange={closeModal}
        tokenId={selectedLock?.id}
        currentAmount={selectedLock?.position as string}
        currentVotingPower={selectedLock?.totalVoteWeightGiven as string}
      />

      <MergeLockModal
        open={activeModal === 'merge'}
        onOpenChange={closeModal}
        sourceLock={selectedLock}
        availableLocks={allLocks}
      />

      <SplitLockModal
        open={activeModal === 'split'}
        onOpenChange={closeModal}
        tokenId={selectedLock?.id}
        currentAmount={selectedLock?.position as string}
        currentVotingPower={selectedLock?.totalVoteWeightGiven as string}
      />
    </div>
  );
};

// ─── Coming Soon Panel ────────────────────────────────────────────────────────

const ComingSoonPanel: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
}> = ({ icon, title, description, features }) => (
  <FancyCard>
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      {/* Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#2962ff]/10 blur-2xl rounded-full scale-150" />
        <div className="relative border border-[#2962ff]/30 bg-black p-6">{icon}</div>
      </div>

      {/* Text */}
      <div className="text-center space-y-3 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-[#ffaf52]/40 text-[#ffaf52] bg-[#ffaf52]/5 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
          Coming Soon
        </div>
        <h3 className="text-white font-bold text-xl uppercase tracking-widest font-mono">
          {title}
        </h3>
        <p className="text-[#64748b] font-mono text-sm leading-relaxed">{description}</p>
      </div>

      {/* Feature list */}
      {features && features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs font-mono text-[#64748b]">
              <span className="w-1 h-1 rounded-full bg-[#2962ff]/60 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      )}

      {/* Terminal cursor */}
      <div className="border border-[#2962ff]/20 bg-black px-6 py-4 font-mono text-xs text-left w-full max-w-sm">
        <p className="text-[#64748b]">&gt; module.load(&apos;ve-rentals&apos;)</p>
        <p className="text-[#ffaf52] mt-1">&gt; STATUS: INITIALIZING...</p>
        <div className="flex items-center gap-2 mt-3 text-[#2962ff]">
          <span className="opacity-70">&gt;</span>
          <span className="animate-pulse inline-block w-2 h-[1em] bg-[#2962ff]" />
        </div>
      </div>
    </div>
  </FancyCard>
);

// ─── Main View ────────────────────────────────────────────────────────────────

export const MainView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tab bar */}
      <SwitchGroup
        onSwitchClicked={setActiveTab}
        activeSwitchIndex={activeTab}
        switchLabels={['My Locks', 'Rented Out', 'Rent a Lock']}
        fullWidth
      />

      {/* Tab content */}
      {activeTab === 0 && <MyLocksTab />}

      {activeTab === 1 && (
        <ComingSoonPanel
          icon={<ShieldCheckIcon size={48} className="text-[#2962ff]/60" />}
          title="Rented Out Locks"
          description="Earn yield by renting your veMGN locks to other protocols or users who need voting power without locking their own tokens."
          features={[
            'Set your own rental rate',
            'Retain lock ownership',
            'Earn rental fees passively',
            'Revocable at any time',
          ]}
        />
      )}

      {activeTab === 2 && (
        <ComingSoonPanel
          icon={<BuildingIcon size={48} className="text-[#2962ff]/60" />}
          title="Lock Rental Marketplace"
          description="Browse and rent veMGN voting power from other users. Influence emissions and earn rewards without locking your own MGN."
          features={[
            'Browse available locks',
            'Filter by voting power',
            'Flexible rental periods',
            'Instant voting access',
          ]}
        />
      )}
    </div>
  );
};
