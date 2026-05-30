'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { FancyCard } from '@/components/Card';
import { PrimaryButton, SecondaryButton } from '@/components/Button';
import { Table } from '@/components/Table';
import { Skeleton } from '@/components/Skeleton';
import { SwitchGroup } from '@/components/SwitchGroup';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { OP_SETTINGS, SCREEN_WIDTHS } from '@/constants';
import { useDimensions } from '@/hooks/app';
import useAllPools from '@/hooks/api/useAllPools';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import { formatNumber } from '@/utils/numbers';
import { PoolType } from '@/gql/codegen/graphql';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronUp,
  LockIcon,
  SearchIcon,
  Vote,
  VoteIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VoteAllocation {
  poolId: string;
  percentage: number;
}

// ─── Mock Locks ──────────────────────────────────────────────────────────────
// Placeholder lock data — will be replaced with real on-chain data
const MOCK_LOCKS = [
  {
    id: '1',
    tokenId: '#1',
    votingPower: '12,500.00 veMGN',
    amount: '25,000 MGN',
    expires: 'Dec 2026',
  },
  {
    id: '2',
    tokenId: '#2',
    votingPower: '4,200.00 veMGN',
    amount: '6,000 MGN',
    expires: 'Jun 2026',
  },
  { id: '3', tokenId: '#3', votingPower: '980.00 veMGN', amount: '2,000 MGN', expires: 'Mar 2026' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const LockDropdown: React.FC<{
  label: string;
  selectedId: string | null;
  locks: typeof MOCK_LOCKS;
  onSelect: (id: string) => void;
  disabled?: boolean;
  comingSoon?: boolean;
}> = ({ label, selectedId, locks, onSelect, disabled, comingSoon }) => {
  const [open, setOpen] = useState(false);
  const selected = locks.find((l) => l.id === selectedId);

  return (
    <DropdownMenu.Root onOpenChange={setOpen} open={disabled ? false : open}>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={disabled}
          className={`flex items-center justify-between gap-3 border px-3 py-2.5 w-full text-left font-mono text-xs transition-colors ${
            disabled
              ? 'border-white/5 text-[#64748b] cursor-not-allowed bg-white/3'
              : 'border-white/10 text-white hover:border-[#2962ff]/50 bg-transparent cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <LockIcon size={12} className={disabled ? 'text-[#64748b]' : 'text-[#2962ff]'} />
            <span className="truncate">
              {comingSoon ? (
                <span className="text-[#64748b]">{label}</span>
              ) : selected ? (
                <span>
                  Lock {selected.tokenId}{' '}
                  <span className="text-[#2962ff]">— {selected.votingPower}</span>
                </span>
              ) : (
                <span className="text-[#64748b]">{label}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {comingSoon && (
              <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#ffaf52]/40 text-[#ffaf52]/80 bg-[#ffaf52]/5">
                Coming Soon
              </span>
            )}
            {open ? (
              <ChevronUp size={12} className="text-[#64748b]" />
            ) : (
              <ChevronDown size={12} className="text-[#64748b]" />
            )}
          </div>
        </button>
      </DropdownMenu.Trigger>

      {!disabled && !comingSoon && (
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="border border-[#2962ff]/30 bg-black px-2 py-2 space-y-1 z-50 font-mono text-xs shadow-xl w-[var(--radix-popper-anchor-width)]"
            sideOffset={4}
          >
            {locks.length === 0 ? (
              <p className="text-[#64748b] px-3 py-2">No locks found</p>
            ) : (
              locks.map((lock) => (
                <DropdownMenu.Item
                  key={lock.id}
                  onClick={() => onSelect(lock.id)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    selectedId === lock.id
                      ? 'bg-[#2962ff]/10 text-[#2962ff]'
                      : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Lock {lock.tokenId}</span>
                    <span className="text-[#64748b] text-[10px]">
                      {lock.amount} · Expires {lock.expires}
                    </span>
                  </div>
                  <span className="text-[#00ff9d] font-bold whitespace-nowrap">
                    {lock.votingPower}
                  </span>
                </DropdownMenu.Item>
              ))
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      )}
    </DropdownMenu.Root>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────

export const MainView: React.FC = () => {
  const { assetsDictionary } = useGHAssetsContext();
  const dimensions = useDimensions();
  const isMobile = useMemo(() => dimensions.width <= SCREEN_WIDTHS.mobile, [dimensions.width]);

  // Data
  const { data: ALL_POOLS, isLoading: poolsLoading } = useAllPools(
    0,
    OP_SETTINGS.default_gql_items_limit,
    OP_SETTINGS.default_refetch_interval,
  );
  useAccountInfo(); // warm up account info cache

  // Selections
  const [selectedLockId, setSelectedLockId] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [searchValue, setSearchValue] = useState('');
  const [activeSwitchIndex, setActiveSwitchIndex] = useState(0);

  // Pool type filter (mirrors liquidity page pattern)
  const poolTypeFilter: PoolType | undefined = useMemo(() => {
    switch (activeSwitchIndex) {
      case 0:
        return undefined;
      case 1:
        return 'STABLE';
      case 2:
        return 'VOLATILE';
      case 3:
        return 'CONCENTRATED';
    }
  }, [activeSwitchIndex]);

  const filteredPools = useMemo(() => {
    let data = [...ALL_POOLS];
    if (poolTypeFilter) data = data.filter((p) => p.poolType === poolTypeFilter);
    if (searchValue) {
      const v = searchValue.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(v) ||
          p.token0.name.toLowerCase().includes(v) ||
          p.token0.symbol.toLowerCase().includes(v) ||
          p.token1.name.toLowerCase().includes(v) ||
          p.token1.symbol.toLowerCase().includes(v),
      );
    }
    return data;
  }, [ALL_POOLS, poolTypeFilter, searchValue]);

  // Helpers
  const getAssetInfo = useCallback(
    (address: string) => assetsDictionary[address.toLowerCase()],
    [assetsDictionary],
  );

  const badgeColorForPoolType = useCallback((poolType: PoolType) => {
    switch (poolType) {
      case 'STABLE':
        return 'bg-[#00ff9d]/10 text-[#00ff9d]';
      case 'VOLATILE':
        return 'bg-[#ffaf52]/10 text-[#ffaf52]';
      case 'CONCENTRATED':
        return 'bg-[#2962ff]/10 text-[#2962ff]';
    }
  }, []);

  const handleAllocationChange = useCallback((poolId: string, raw: string) => {
    const value = Math.min(100, Math.max(0, parseFloat(raw) || 0));
    setAllocations((prev) => {
      if (value === 0) {
        const next = { ...prev };
        delete next[poolId];
        return next;
      }
      return { ...prev, [poolId]: value };
    });
  }, []);

  // Summary stats
  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + v, 0),
    [allocations],
  );
  const selectedPoolCount = useMemo(() => Object.keys(allocations).length, [allocations]);
  const isOverAllocated = totalAllocated > 100;
  const isReadyToVote = selectedLockId !== null && totalAllocated > 0 && !isOverAllocated;

  const selectedLock = MOCK_LOCKS.find((l) => l.id === selectedLockId);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Lock Selectors ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Owned locks */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest font-mono">
            Vote With Lock
          </p>
          <LockDropdown
            label="Select a lock…"
            selectedId={selectedLockId}
            locks={MOCK_LOCKS}
            onSelect={setSelectedLockId}
          />
          {selectedLock && (
            <p className="text-[10px] font-mono text-[#64748b]">
              Voting power: <span className="text-[#00ff9d]">{selectedLock.votingPower}</span>
            </p>
          )}
        </div>

        {/* Rented locks — coming soon */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest font-mono">
            Rented Lock <span className="text-[#ffaf52]/70">(ve-Rentals)</span>
          </p>
          <LockDropdown
            label="No rented locks"
            selectedId={null}
            locks={[]}
            onSelect={() => {}}
            disabled
            comingSoon
          />
          <p className="text-[10px] font-mono text-[#64748b]">
            Rent veMGN locks to vote without locking your own tokens.
          </p>
        </div>
      </div>

      {/* ── Pool List ─────────────────────────────────────────────────── */}
      <FancyCard>
        <div className="flex flex-col gap-4 w-full">
          {/* Toolbar */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 w-full">
            <div className="w-full lg:w-1/3">
              <SwitchGroup
                onSwitchClicked={setActiveSwitchIndex}
                activeSwitchIndex={activeSwitchIndex}
                switchLabels={['All', 'Stable', 'Volatile', 'Concentrated']}
                fullWidth
              />
            </div>

            <div className="border border-white/10 flex items-center gap-2 px-3 py-2 bg-transparent w-full xl:w-auto xl:min-w-56">
              <SearchIcon size={14} className="text-[#64748b] shrink-0" />
              <input
                className="bg-transparent text-xs font-mono text-white placeholder:text-[#64748b] outline-none w-full"
                placeholder="Search pools…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {poolsLoading ? (
            <div className="flex flex-col gap-2 w-full mt-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table<(typeof filteredPools)[number]>
              headers={
                isMobile
                  ? [
                      { label: 'Pool', align: 'left' },
                      { label: 'Votes %', align: 'right' },
                      { label: 'Allocate %', align: 'right' },
                    ]
                  : [
                      { label: 'Pool', align: 'left' },
                      { label: 'TVL', align: 'right' },
                      { label: 'APR', align: 'right' },
                      { label: 'Total Votes', align: 'right' },
                      { label: 'Allocate %', align: 'right' },
                    ]
              }
              data={filteredPools}
              renderRow={(item) => {
                const token0Info = getAssetInfo(item.token0.address as string);
                const token1Info = getAssetInfo(item.token1.address as string);
                const currentAlloc = allocations[item.id] ?? 0;

                return (
                  <>
                    {/* Pool name + icons */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="-space-x-3 flex items-center">
                          {token0Info ? (
                            <Image
                              src={token0Info.logoURI}
                              alt={item.token0.symbol}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full border border-black bg-amber-100"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-black bg-amber-100" />
                          )}
                          {token1Info ? (
                            <Image
                              src={token1Info.logoURI}
                              alt={item.token1.symbol}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full border border-black bg-blue-100"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-black bg-blue-100" />
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <h3 className="font-bold text-white uppercase whitespace-nowrap">
                            {item.name}
                          </h3>
                          <span
                            className={`uppercase text-[10px] ${badgeColorForPoolType(
                              item.poolType,
                            )} px-1.5 py-0.5 whitespace-nowrap hidden sm:inline`}
                          >
                            {item.poolType.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Desktop-only columns */}
                    {!isMobile && (
                      <>
                        <td className="py-3 pr-4 text-white text-right font-bold w-1/5">
                          {formatNumber(item.reserveUSD as string, 'en-US', 2, true)}
                        </td>
                        <td className="py-3 pr-4 text-[#00ff9d] text-right font-bold w-1/6">
                          {(item.gauge?.rewardRate as string) || 0}%
                        </td>
                        <td className="py-3 pr-4 text-[#64748b] text-right font-bold w-1/6">
                          {formatNumber((item.totalVotes as unknown as string) || '0', 'en-US', 0)}
                        </td>
                      </>
                    )}

                    {/* Mobile-only votes column */}
                    {isMobile && (
                      <td className="py-3 pr-4 text-[#64748b] text-right font-bold w-1/5">
                        {formatNumber((item.totalVotes as unknown as string) || '0', 'en-US', 0)}
                      </td>
                    )}

                    {/* Allocation input */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={currentAlloc === 0 ? '' : currentAlloc}
                          placeholder="0"
                          onChange={(e) => handleAllocationChange(item.id, e.target.value)}
                          className={`w-16 bg-transparent border text-right font-mono text-xs px-2 py-1.5 outline-none transition-colors ${
                            currentAlloc > 0
                              ? 'border-[#2962ff]/60 text-[#2962ff] focus:border-[#2962ff]'
                              : 'border-white/10 text-[#64748b] focus:border-white/30 hover:border-white/20'
                          }`}
                        />
                        <span className="text-[#64748b] text-xs font-mono">%</span>
                      </div>
                    </td>
                  </>
                );
              }}
              renderEmpty={() => (
                <div className="w-full flex flex-col items-center justify-center gap-6 py-16">
                  <div className="border-2 border-dashed border-white/10 p-6">
                    <VoteIcon size={56} className="text-[#64748b]" />
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="text-white font-bold text-lg uppercase tracking-widest font-mono">
                      No Eligible Pools
                    </h4>
                    <p className="text-[#64748b] font-mono text-xs">
                      No gauge pools match your search.
                    </p>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </FancyCard>

      {/* ── Vote Summary Bar ───────────────────────────────────────────── */}
      <div
        className={`border bg-black px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
          isOverAllocated
            ? 'border-[#ff4757]/40'
            : selectedPoolCount > 0
            ? 'border-[#2962ff]/40'
            : 'border-white/5'
        }`}
      >
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#64748b] uppercase tracking-widest text-[10px]">
              Selected Pools
            </span>
            <span className="text-white font-bold text-sm">{selectedPoolCount}</span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[#64748b] uppercase tracking-widest text-[10px]">
              Total Allocated
            </span>
            <span
              className={`font-bold text-sm ${
                isOverAllocated
                  ? 'text-[#ff4757]'
                  : totalAllocated === 100
                  ? 'text-[#00ff9d]'
                  : 'text-white'
              }`}
            >
              {totalAllocated.toFixed(1)}%
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 hidden md:block" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[#64748b] uppercase tracking-widest text-[10px]">
              Voting Lock
            </span>
            <span className="text-white font-bold text-sm">
              {selectedLock ? (
                <>
                  Lock {selectedLock.tokenId}{' '}
                  <span className="text-[#2962ff]">({selectedLock.votingPower})</span>
                </>
              ) : (
                <span className="text-[#64748b]">—</span>
              )}
            </span>
          </div>

          {isOverAllocated && (
            <div className="flex items-center gap-1.5 text-[#ff4757]">
              <AlertCircleIcon size={12} />
              <span className="text-[10px] uppercase tracking-widest">
                Exceeds 100% — reduce allocation
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {selectedPoolCount > 0 && (
            <SecondaryButton className="text-xs font-mono gap-2" onClick={() => setAllocations({})}>
              Clear All
            </SecondaryButton>
          )}
          <PrimaryButton className="gap-2 text-xs font-mono" disabled={!isReadyToVote}>
            <Vote size={14} />
            <span>Cast Vote</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
