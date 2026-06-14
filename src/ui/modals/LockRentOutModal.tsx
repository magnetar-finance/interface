'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import {
  KeyRoundIcon,
  PercentIcon,
  CoinsIcon,
  ClockIcon,
  ChevronDownIcon,
  CheckIcon,
} from 'lucide-react';
import { TokenSelectModal } from './TokenSelectModal';
import { AssetResponseType } from '@/config/github-assets.config';
import { DropdownMenu } from 'radix-ui';
import useAccountInfo from '@/hooks/api/useAccountInfo';
import {
  BI_ZERO,
  CHAINS_INFORMATION,
  REFETCH_INTERVALS,
  VE,
  VE_RENTAL_MARKETPLACE,
} from '@/constants';
import { formatNumber } from '@/utils';
import Image from 'next/image';
import useGetLockVP from '@/hooks/governance/useGetLockVP';
import { formatEther, parseUnits, zeroAddress } from 'viem';
import { useChainId } from 'wagmi';
import useERC721Allowance from '@/hooks/wallet/useERC721Allowance';
import useERC721Approve from '@/hooks/wallet/useERC721Approve';
import useCreateRental from '@/hooks/governance/useCreateRental';
import { Spinner } from '@/components/Spinner';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';

export interface LockRentOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DURATION_PRESETS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '60d', days: 60 },
  { label: '90d', days: 90 },
];

// Max commission is 1 % = 100 bps
const MAX_COMMISSION_BPS = 100;

export const LockRentOutModal: React.FC<LockRentOutModalProps> = ({ open, onOpenChange }) => {
  // ── form state ──────────────────────────────────────────────────────────────
  const [selectedLockId, setSelectedLockId] = useState<string | null>(null);
  const [commissionBps, setCommissionBps] = useState(50); // default 0.50 %
  const [durationDays, setDurationDays] = useState('');
  const [pricePerEpoch, setPricePerEpoch] = useState('');
  const [paymentToken, setPaymentToken] = useState<AssetResponseType[number] | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  // ── data ────────────────────────────────────────────────────────────────────
  const { data: accountInfo } = useAccountInfo(REFETCH_INTERVALS);

  const locks = useMemo(() => accountInfo?.lockPositions ?? [], [accountInfo]);
  const selectedLock = useMemo(
    () => locks.find((l) => l.id === selectedLockId) ?? null,
    [locks, selectedLockId],
  );

  const parsedDays = parseInt(durationDays, 10) || 0;
  const parsedPrice = parseFloat(pricePerEpoch) || 0;

  const isValid = !!selectedLockId && parsedDays >= 7 && parsedPrice > 0 && !!paymentToken;

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelectedLockId(null);
      setCommissionBps(50);
      setDurationDays('');
      setPricePerEpoch('');
      setPaymentToken(null);
    }
  }, [open]);

  // ── derived display ─────────────────────────────────────────────────────────
  const commissionPct = (commissionBps / 100).toFixed(2);
  const endDate = useMemo(() => {
    if (!parsedDays) return null;
    return new Date(Date.now() + parsedDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [parsedDays]);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const lockVP = useGetLockVP(
    selectedLock ? BigInt(selectedLock.lockId as string) : BI_ZERO,
    REFETCH_INTERVALS,
  );

  const chainId = useChainId();
  const ve = useMemo(() => VE[chainId], [chainId]);
  const rentalMarketplace = useMemo(() => VE_RENTAL_MARKETPLACE[chainId], [chainId]);

  // Check marketplace allowance
  const marketPlaceAllowed = useERC721Allowance(ve, rentalMarketplace, REFETCH_INTERVALS);
  const marketPlaceApproval = useERC721Approve(ve, rentalMarketplace);

  const createRental = useCreateRental(
    selectedLock ? BigInt(selectedLock.lockId as string) : BI_ZERO,
    paymentToken?.address || zeroAddress,
    parseUnits(pricePerEpoch || '0', paymentToken?.decimals || 18),
    BigInt(parsedDays * 24 * 60 * 60),
    BigInt(commissionBps),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateTransaction = useCallback(() => {
    if (!marketPlaceAllowed) {
      return marketPlaceApproval.execute();
    }
    return createRental.execute();
  }, [marketPlaceAllowed, marketPlaceApproval, createRental]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="List Lock for Rent">
        <div className="flex flex-col gap-5 p-5">
          {/* ── 1. Select Lock ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Select Lock
            </label>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-full flex items-center justify-between border border-white/10 bg-transparent px-3 py-3 font-mono text-xs text-white hover:border-[#2962ff]/50 focus:border-[#2962ff]/60 transition-colors outline-none cursor-pointer">
                  {selectedLock ? (
                    <span className="flex items-center gap-2">
                      <KeyRoundIcon size={12} className="text-[#2962ff]" />
                      Lock {selectedLock.lockId as string}
                      <span className="text-[#64748b]">
                        · {formatNumber(formatEther(lockVP), 'en-US', 2)} veMGN
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#64748b]">Choose a lock…</span>
                  )}
                  <ChevronDownIcon size={14} className="text-[#64748b]" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="border border-[#2962ff]/30 bg-black py-1 z-50 font-mono text-xs shadow-xl w-(--radix-dropdown-menu-trigger-width) max-h-52 overflow-y-auto"
                  sideOffset={4}
                >
                  {locks.length === 0 ? (
                    <div className="px-3 py-4 text-[#64748b] text-center">No locks found</div>
                  ) : (
                    locks.map((lock) => (
                      <DropdownMenu.Item
                        key={lock.id}
                        onClick={() => setSelectedLockId(lock.id)}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer text-[#94a3b8] hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white outline-none"
                      >
                        <span className="flex items-center gap-2">
                          <KeyRoundIcon size={11} className="text-[#2962ff]" />
                          Lock {lock.lockId as string}
                          <span className="text-[#64748b]">
                            {formatNumber(lock.totalVoteWeightGiven as string, 'en-US', 2)} veMGN
                          </span>
                        </span>
                        {lock.id === selectedLockId && (
                          <CheckIcon size={12} className="text-[#2962ff]" />
                        )}
                      </DropdownMenu.Item>
                    ))
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* ── 2. Commission Slider ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Reward Commission
              </label>
              <span className="flex items-center gap-1 font-mono text-xs font-bold text-[#ffaf52]">
                <PercentIcon size={10} />
                {commissionPct}%
                <span className="text-[#64748b] font-normal">({commissionBps} bps)</span>
              </span>
            </div>

            {/* Slider */}
            <div className="relative flex flex-col gap-1.5">
              <input
                type="range"
                min={0}
                max={MAX_COMMISSION_BPS}
                step={1}
                value={commissionBps}
                onChange={(e) => setCommissionBps(Number(e.target.value))}
                className="w-full h-1.5 appearance-none cursor-pointer rounded-none
                  bg-white/10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-none
                  [&::-webkit-slider-thumb]:bg-[#ffaf52]
                  [&::-webkit-slider-thumb]:border
                  [&::-webkit-slider-thumb]:border-[#ffaf52]/80
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,175,82,0.5)]
                  [&::-webkit-slider-thumb]:cursor-grab
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-none
                  [&::-moz-range-thumb]:bg-[#ffaf52]
                  [&::-moz-range-thumb]:border
                  [&::-moz-range-thumb]:border-[#ffaf52]/80
                  [&::-moz-range-thumb]:cursor-grab"
                style={{
                  background: `linear-gradient(to right, #ffaf52 ${commissionBps}%, rgba(255,255,255,0.1) ${commissionBps}%)`,
                }}
              />
              {/* Scale ticks */}
              <div className="flex justify-between font-mono text-[9px] text-[#64748b] px-0.5">
                <span>0%</span>
                <span>0.25%</span>
                <span>0.50%</span>
                <span>0.75%</span>
                <span>1.00%</span>
              </div>
            </div>

            <p className="text-[#64748b] font-mono text-[10px]">
              Renter gets{' '}
              <span className="text-white font-bold">
                {(100 - parseFloat(commissionPct)).toFixed(2)}%
              </span>{' '}
              of epoch rewards; you receive{' '}
              <span className="text-[#ffaf52] font-bold">{commissionPct}%</span> as commission.
            </p>
          </div>

          {/* ── 3. Duration ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Rent Duration (days)
            </label>

            <div className="flex items-center gap-2 border border-white/10 focus-within:border-[#2962ff]/60 transition-colors">
              <ClockIcon size={13} className="text-[#64748b] ml-3 shrink-0" />
              <input
                type="number"
                min={7}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="e.g. 28"
                className="bg-transparent px-2 py-3 font-mono text-sm text-white placeholder:text-[#64748b] outline-none flex-1 min-w-0"
              />
              <span className="text-[#64748b] font-mono text-xs px-3 shrink-0">days</span>
            </div>

            {/* Duration presets */}
            <div className="flex gap-1.5">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setDurationDays(String(p.days))}
                  className={`flex-1 border py-1.5 font-mono text-[10px] transition-colors ${
                    parsedDays === p.days
                      ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                      : 'border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {parsedDays > 0 && parsedDays < 7 && (
              <p className="text-[#ff4757] font-mono text-[10px]">
                Minimum rental duration is 7 days.
              </p>
            )}
            {endDate && parsedDays >= 7 && (
              <p className="text-[#64748b] font-mono text-[10px]">
                Listing expires <span className="text-white font-bold">{endDate}</span>
              </p>
            )}
          </div>

          {/* ── 4. Price per Epoch ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Price per Epoch
            </label>
            <div className="flex items-center gap-2 border border-white/10 focus-within:border-[#2962ff]/60 transition-colors">
              <CoinsIcon size={13} className="text-[#64748b] ml-3 shrink-0" />
              <input
                type="number"
                min={0}
                value={pricePerEpoch}
                onChange={(e) => setPricePerEpoch(e.target.value)}
                placeholder="0.00"
                className="bg-transparent px-2 py-3 font-mono text-sm text-white placeholder:text-[#64748b] outline-none flex-1 min-w-0"
              />
              {paymentToken && (
                <span className="text-[#64748b] font-mono text-xs px-3 shrink-0">
                  {paymentToken.symbol}
                </span>
              )}
            </div>
          </div>

          {/* ── 5. Payment Token ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Payment Token
            </label>
            <button
              onClick={() => setTokenModalOpen(true)}
              className="w-full flex items-center justify-between border border-white/10 bg-transparent px-3 py-3 hover:border-[#2962ff]/50 transition-colors cursor-pointer outline-none"
            >
              {paymentToken ? (
                <span className="flex items-center gap-2">
                  {paymentToken.logoURI ? (
                    <Image
                      src={paymentToken.logoURI}
                      alt={paymentToken.symbol}
                      width={18}
                      height={18}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full bg-white/10" />
                  )}
                  <span className="font-mono text-xs font-bold text-white">
                    {paymentToken.symbol}
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">{paymentToken.name}</span>
                </span>
              ) : (
                <span className="font-mono text-xs text-[#64748b]">Select a token…</span>
              )}
              <ChevronDownIcon size={14} className="text-[#64748b]" />
            </button>
          </div>

          {/* ── Summary Preview ──────────────────────────────────────────────── */}
          {isValid && selectedLock && (
            <div className="border border-[#2962ff]/20 bg-[#2962ff]/5 px-4 py-3 flex flex-col gap-2">
              {[
                {
                  label: 'Lock',
                  value: `Lock ${selectedLock.lockId} · ${formatNumber(
                    formatEther(lockVP),
                    'en-US',
                    2,
                  )} veMGN`,
                },
                {
                  label: 'Commission',
                  value: `${commissionPct}% of epoch rewards`,
                },
                {
                  label: 'Duration',
                  value: `${parsedDays} days → ${endDate}`,
                },
                {
                  label: 'Price',
                  value: `${formatNumber(parsedPrice.toString(), 'en-US', 4)} ${
                    paymentToken!.symbol
                  } / epoch`,
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[#64748b] font-mono text-xs">{row.label}</span>
                  <span className="text-white font-bold font-mono text-xs">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── CTA ──────────────────────────────────────────────────────────── */}
          <PrimaryButton
            disabled={!isValid || createRental.isLoading || marketPlaceApproval.isLoading}
            className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={initiateTransaction}
          >
            {!marketPlaceAllowed ? (
              'Approve'
            ) : (
              <>
                <KeyRoundIcon size={14} />
                <span>List Lock for Rent</span>
              </>
            )}
            {(createRental.isLoading || marketPlaceApproval.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        </div>
      </Modal>

      {/* Payment token picker */}
      <TokenSelectModal
        open={tokenModalOpen}
        onOpenChange={setTokenModalOpen}
        selectedToken={paymentToken}
        onTokenSelect={(t) => {
          setPaymentToken(t);
          setTokenModalOpen(false);
        }}
      />

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          marketPlaceApproval.reset();
          createRental.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Lock rented out successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          marketPlaceApproval.reset();
          createRental.reset();
        }}
        message={'An error occurred while renting out the lock. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
