'use client';

import React, { useMemo, useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { FancyCard } from '@/components/Card';
import { PrimaryButton, SecondaryButton } from '@/components/Button';
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
  BuildingIcon,
  MoreHorizontalIcon,
  KeyRoundIcon,
  CoinsIcon,
  XCircleIcon,
  AlertTriangleIcon,
  SearchIcon,
} from 'lucide-react';
import { TransferLockModal } from '@/ui/modals/TransferLockModal';
import { AdjustUnlockTimeModal } from '@/ui/modals/AdjustUnlockTimeModal';
import { IncreaseLockAmountModal } from '@/ui/modals/IncreaseLockAmountModal';
import { MergeLockModal } from '@/ui/modals/MergeLockModal';
import { SplitLockModal } from '@/ui/modals/SplitLockModal';
import { CreateLockModal } from '@/ui/modals/CreateLockModal';
import { LockRentOutModal } from '@/ui/modals/LockRentOutModal';
import { RentLockPreviewModal } from '@/ui/modals/RentLockPreviewModal';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import useAllRentals from '@/hooks/api/useAllRentals';
import { REFETCH_INTERVALS } from '@/constants';
import { GetAccountInfoQuery, RentalStatus, RentalsQuery } from '@/gql/codegen/graphql';
import { useAtomicDate } from '@/hooks/app';
import { formatNumber, splitString, timestampToEpoch } from '@/utils';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/Skeleton';

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
            value: allLocks.filter((l) => parseInt(l.unlockTime as string) > now).length.toString(),
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
        tokenId={selectedLock ? BigInt(selectedLock.id) : undefined}
      />

      <AdjustUnlockTimeModal
        open={activeModal === 'extend'}
        onOpenChange={closeModal}
        tokenId={selectedLock ? BigInt(selectedLock.id) : undefined}
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
        tokenId={selectedLock ? BigInt(selectedLock.id) : undefined}
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
        tokenId={selectedLock ? BigInt(selectedLock.id) : undefined}
        currentAmount={selectedLock?.position as string}
      />
    </div>
  );
};

// ─── Rented-Out Tab ───────────────────────────────────────────────────────────

// ── Rental Status Badge ───────────────────────────────────────────────────────
const RentStatusBadge: React.FC<{ status: RentalStatus }> = ({ status }) => {
  const config = {
    AVAILABLE: {
      label: 'Available',
      style: 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30',
    },
    RENTED_OUT: {
      label: 'Rented Out',
      style: 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30',
    },
    EXPIRED: {
      label: 'Expired',
      style: 'bg-white/5 text-[#64748b] border-white/10',
    },
  }[status];

  return (
    <span
      className={`text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${config.style}`}
    >
      {config.label}
    </span>
  );
};

// ── Close-Out Confirmation Dialog (inline) ────────────────────────────────────
const CloseOutDialog: React.FC<{
  lock: Lock;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ lock, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    {/* Dialog */}
    <div className="relative border border-[#ff4757]/30 bg-black p-6 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-[0_0_40px_rgba(255,71,87,0.15)]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="border border-[#ff4757]/30 bg-[#ff4757]/5 p-2 shrink-0">
          <AlertTriangleIcon size={16} className="text-[#ff4757]" />
        </div>
        <div>
          <h4 className="text-white font-bold font-mono text-sm uppercase tracking-widest">
            Close Out Rental
          </h4>
          <p className="text-[#64748b] font-mono text-[10px] mt-1">
            Lock {String(lock.lockId)} · {formatNumber(String(lock.position), 'en-US', 2)} MGN
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="border border-[#ffaf52]/20 bg-[#ffaf52]/5 px-3 py-2.5">
        <p className="text-[#ffaf52] font-mono text-[10px] leading-relaxed">
          ⚠ Closing this rental will delist the lock and terminate any active rent agreement.
          Earned fees accumulated to date will still be claimable.
        </p>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: 'Lock ID',
            value: String(lock.lockId),
          },
          {
            label: 'Amount Locked',
            value: `${formatNumber(String(lock.position), 'en-US', 2)} MGN`,
          },
          { label: 'Position', value: formatNumber(String(lock.position), 'en-US', 2) },
          { label: 'Type', value: lock.lockType },
        ].map((row) => (
          <div key={row.label} className="border border-white/5 bg-white/3 px-3 py-2">
            <p className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              {row.label}
            </p>
            <p className="text-white font-bold font-mono text-xs mt-0.5">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <SecondaryButton className="flex-1 py-2.5 text-xs" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/50 font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#ff4757] hover:text-white hover:shadow-[0_0_15px_rgba(255,71,87,0.4)] transition-all duration-100 cursor-pointer"
        >
          Confirm Close Out
        </button>
      </div>
    </div>
  </div>
);

// ── Main Rented-Out Tab ───────────────────────────────────────────────────────
const RentedOutTab: React.FC = () => {
  const { data: accountInfo, isLoading: isLoadingAccount } = useAccountInfo(REFETCH_INTERVALS);
  const rentedLocks = useMemo(() => {
    if (!accountInfo) return [];
    return accountInfo.sellerRentals;
  }, [accountInfo]);

  const [closingLock, setClosingLock] = useState<Lock | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(rentedLocks.length / 10), [rentedLocks.length]);

  const stats = useMemo(() => {
    const total = rentedLocks.length;
    const activelyRented = rentedLocks.filter((l) => l.status === 'RENTED_OUT').length;
    const available = rentedLocks.filter((l) => l.status === 'AVAILABLE').length;
    const totalReaped = rentedLocks.reduce((sum, l) => {
      if (l.reaped) {
        return sum + parseFloat(String(l.price));
      }
      return sum;
    }, 0);
    return { total, activelyRented, available, totalReaped };
  }, [rentedLocks]);

  const paginated = useMemo(
    () => rentedLocks.slice((currentPage - 1) * 10, currentPage * 10),
    [rentedLocks, currentPage],
  );

  const handleCloseOutConfirm = () => {
    // TODO: wire up contract call (e.g. useCloseOutRental hook)
    setClosingLock(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoadingAccount ? (
          <>
            <Skeleton className="h-18 w-full" />
            <Skeleton className="h-18 w-full" />
            <Skeleton className="h-18 w-full" />
            <Skeleton className="h-18 w-full" />
          </>
        ) : (
          [
            { label: 'Listed Locks', value: stats.total.toString(), color: 'text-white' },
            {
              label: 'Rented Out',
              value: stats.activelyRented.toString(),
              color: 'text-[#2962ff]',
            },
            { label: 'Available', value: stats.available.toString(), color: 'text-[#00ff9d]' },
            {
              label: 'Total Reaped',
              value: formatNumber(stats.totalReaped.toString(), 'en-US', 2),
              color: 'text-[#ffaf52]',
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
          ))
        )}
      </div>

      {/* Table */}
      <FancyCard>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold font-mono text-xs uppercase tracking-widest">
              Rented Out Locks
            </h3>
            <PrimaryButton
              className="text-xs font-mono gap-2 py-2 px-4"
              onClick={() => setListModalOpen(true)}
            >
              <PlusIcon size={12} />
              <span>List for Rent</span>
            </PrimaryButton>
          </div>

          {isLoadingAccount ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table<(typeof paginated)[number]>
              headers={[
                { label: 'Lock', align: 'left' },
                { label: 'Amount Locked', align: 'right' },
                { label: 'Rent Expiry', align: 'right' },
                { label: 'Escrow', align: 'right' },
                { label: 'Price', align: 'right' },
                { label: 'Status', align: 'center' },
                { label: '', align: 'right' },
              ]}
              data={paginated}
              renderRow={(rental) => (
                <>
                  {/* Lock ID */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-1.5">
                        <KeyRoundIcon size={12} className="text-[#2962ff]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold font-mono text-white text-xs">
                          Lock {rental.lock.id}
                        </span>
                        {rental.buyer && (
                          <span className="font-mono text-[10px] text-[#64748b]">
                            → {splitString(rental.buyer.id)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Amount Locked */}
                  <td className="py-3 pr-4 text-right font-mono text-xs text-white font-bold">
                    {formatNumber(String(rental.lock.position), 'en-US', 2)}
                    <span className="text-[#64748b] font-normal ml-1">MGN</span>
                  </td>

                  {/* Rent Expiry */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <ClockIcon size={11} className="text-[#64748b]" />
                      <span className="font-mono text-xs text-white font-bold">
                        {new Date(Number(rental.runsUntil) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#64748b] text-right mt-0.5">
                      Epoch #{timestampToEpoch(Number(rental.runsUntil))}
                    </p>
                  </td>

                  {/* Escrow */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-mono text-xs font-bold text-[#ffaf52]">
                        {splitString(rental.escrow as string)}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#64748b] text-right mt-0.5">Escrow</p>
                  </td>

                  {/* Price */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CoinsIcon size={11} className="text-[#00ff9d]" />
                      <span className="font-mono text-xs font-bold text-[#00ff9d]">
                        {formatNumber(String(rental.price), 'en-US', 2)}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#64748b] text-right mt-0.5">
                      {rental.paymentToken.symbol}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3 pr-4 text-center">
                    <RentStatusBadge status={rental.status} />
                  </td>

                  {/* Close Out */}
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setClosingLock(rental.lock)}
                      disabled={rental.status === 'EXPIRED'}
                      title={
                        rental.status === 'EXPIRED' ? 'Already expired' : 'Close out this rental'
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#ff4757]/40 text-[#ff4757] bg-[#ff4757]/5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#ff4757]/20 hover:border-[#ff4757] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#ff4757]/5 disabled:hover:border-[#ff4757]/40"
                    >
                      <XCircleIcon size={11} />
                      Close Out
                    </button>
                  </td>
                </>
              )}
              renderEmpty={() => (
                <div className="w-full flex flex-col items-center justify-center gap-6 py-16">
                  <div className="border-2 border-dashed border-white/10 p-6">
                    <KeyRoundIcon size={48} className="text-[#64748b]" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-white font-bold text-base uppercase tracking-widest font-mono">
                      No Locks Listed
                    </h4>
                    <p className="text-[#64748b] font-mono text-xs">
                      You haven&apos;t listed any locks for rent yet.
                    </p>
                  </div>
                </div>
              )}
            />
          )}

          {!isLoadingAccount && (
            <div className="mt-6 flex justify-end items-center w-full">
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </FancyCard>

      {/* Close-Out Confirmation */}
      {closingLock && (
        <CloseOutDialog
          lock={closingLock}
          onConfirm={handleCloseOutConfirm}
          onCancel={() => setClosingLock(null)}
        />
      )}

      {/* List for Rent Modal */}
      <LockRentOutModal open={listModalOpen} onOpenChange={setListModalOpen} />
    </div>
  );
};

// ─── Tab 3: Rent a Lock ─────────────────────────────────────────────

const RentALockTab: React.FC = () => {
  const { data: allRentals, isLoading: isLoadingRentals } = useAllRentals(
    0,
    1000,
    REFETCH_INTERVALS,
  );
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRental, setSelectedRental] = useState<RentalsQuery['rentals'][number] | null>(
    null,
  );
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Filter to show only AVAILABLE rentals
  const availableListings = useMemo(() => {
    return allRentals.filter((r) => r.status === 'AVAILABLE');
  }, [allRentals]);

  const filtered = useMemo(() => {
    if (!search.trim()) return availableListings;
    const q = search.toLowerCase();
    return availableListings.filter(
      (r) =>
        String(r.lock.lockId).includes(q) ||
        String(r.seller.address).toLowerCase().includes(q) ||
        r.paymentToken.symbol.toLowerCase().includes(q),
    );
  }, [availableListings, search]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / 10), [filtered.length]);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * 10, currentPage * 10),
    [filtered, currentPage],
  );

  const totalLocked = useMemo(
    () => availableListings.reduce((acc, r) => acc + parseFloat(String(r.lock.position)), 0),
    [availableListings],
  );

  const avgPrice = useMemo(
    () =>
      availableListings.length > 0
        ? availableListings.reduce((acc, r) => acc + parseFloat(String(r.price)), 0) /
          availableListings.length
        : 0,
    [availableListings],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {isLoadingRentals ? (
          <>
            <Skeleton className="h-18 w-full" />
            <Skeleton className="h-18 w-full" />
            <Skeleton className="h-18 w-full" />
          </>
        ) : (
          [
            {
              label: 'Available Listings',
              value: availableListings.length.toString(),
              color: 'text-white',
            },
            {
              label: 'Total MGN Locked',
              value: `${formatNumber(totalLocked.toString(), 'en-US', 0)} MGN`,
              color: 'text-[#2962ff]',
            },
            {
              label: 'Avg. Price',
              value: formatNumber(avgPrice.toString(), 'en-US', 2),
              color: 'text-[#ffaf52]',
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
          ))
        )}
      </div>

      {/* Marketplace table */}
      <FancyCard>
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-white font-bold font-mono text-xs uppercase tracking-widest">
              Available Locks
            </h3>
            {/* Search */}
            <div className="border border-white/10 flex items-center gap-2 px-3 py-2 bg-transparent w-full sm:w-auto sm:min-w-52 focus-within:border-[#2962ff] focus-within:shadow-[0_0_15px_rgba(41,98,255,0.2)] transition-all duration-300">
              <SearchIcon size={13} className="text-[#64748b] shrink-0" />
              <input
                className="bg-transparent text-xs font-mono text-white placeholder:text-[#64748b] outline-none w-full"
                placeholder="Search lock, owner, token…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {isLoadingRentals ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table<(typeof paginated)[number]>
              headers={[
                { label: 'Lock', align: 'left' },
                { label: 'Amount Locked', align: 'right' },
                { label: 'Escrow', align: 'right' },
                { label: 'Price', align: 'right' },
                { label: 'Payment Token', align: 'right' },
                { label: 'Runs Until', align: 'right' },
                { label: '', align: 'right' },
              ]}
              data={paginated}
              renderRow={(rental) => (
                <>
                  {/* Lock + owner */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-1.5">
                        <KeyRoundIcon size={12} className="text-[#2962ff]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold font-mono text-white text-xs">
                          Lock {String(rental.lock.lockId)}
                        </span>
                        <span className="font-mono text-[10px] text-[#64748b]">
                          {splitString(String(rental.seller.address))}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Amount Locked */}
                  <td className="py-3 pr-4 text-right font-mono text-xs text-white font-bold">
                    {formatNumber(String(rental.lock.position), 'en-US', 0)}
                    <span className="text-[#64748b] font-normal ml-1">MGN</span>
                  </td>

                  {/* Escrow */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-xs text-white font-bold">
                        {splitString(rental.escrow as string)}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CoinsIcon size={11} className="text-[#00ff9d]" />
                      <span className="font-mono text-xs font-bold text-[#00ff9d]">
                        {formatNumber(String(rental.price), 'en-US', 2)}
                      </span>
                    </div>
                  </td>

                  {/* Payment Token */}
                  <td className="py-3 pr-4 text-right">
                    <span className="font-mono text-xs text-[#64748b]">
                      {rental.paymentToken.symbol}
                    </span>
                  </td>

                  {/* Runs Until */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs text-white font-bold">
                        {new Date(Number(rental.runsUntil) * 1000).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-[10px] text-[#64748b]">
                        Epoch #{timestampToEpoch(Number(rental.runsUntil))}
                      </span>
                    </div>
                  </td>

                  {/* Rent CTA */}
                  <td className="py-3 text-right">
                    <PrimaryButton
                      className="text-[10px] font-mono gap-1.5 py-1.5 px-3"
                      onClick={() => {
                        setSelectedRental(rental);
                        setPreviewModalOpen(true);
                      }}
                    >
                      <BuildingIcon size={11} />
                      Rent
                    </PrimaryButton>
                  </td>
                </>
              )}
              renderEmpty={() => (
                <div className="w-full flex flex-col items-center justify-center gap-6 py-16">
                  <div className="border-2 border-dashed border-white/10 p-6">
                    <BuildingIcon size={48} className="text-[#64748b]" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-white font-bold text-base uppercase tracking-widest font-mono">
                      No Listings Found
                    </h4>
                    <p className="text-[#64748b] font-mono text-xs">
                      No locks match your search, or none are currently available.
                    </p>
                  </div>
                </div>
              )}
            />
          )}

          {!isLoadingRentals && (
            <div className="mt-6 flex justify-end items-center w-full">
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </FancyCard>

      {/* Rent Lock Preview Modal */}
      <RentLockPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        rental={selectedRental}
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

      {activeTab === 1 && <RentedOutTab />}

      {activeTab === 2 && <RentALockTab />}
    </div>
  );
};
