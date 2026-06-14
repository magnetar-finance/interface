'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton, SecondaryButton } from '@/components/Button';
import {
  KeyRoundIcon,
  CoinsIcon,
  ClockIcon,
  UserIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { formatNumber, splitString, timestampToEpoch, getCurrentEpoch } from '@/utils';
import { RentalsQuery } from '@/gql/codegen/graphql';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import { Address, parseUnits, zeroAddress } from 'viem';
import { CHAINS_INFORMATION, REFETCH_INTERVALS } from '@/constants';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import useBuyRental from '@/hooks/governance/useBuyRental';
import { useChainId } from 'wagmi';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import { Spinner } from '@/components/Spinner';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';

export interface RentLockPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: RentalsQuery['rentals'][number] | null;
}

export const RentLockPreviewModal: React.FC<RentLockPreviewModalProps> = ({
  open,
  onOpenChange,
  rental,
}) => {
  // Calculate epochs and total payment
  const { currentEpoch, expiryEpoch, epochsRemaining, totalAmountToPay } = useMemo(() => {
    if (!rental) {
      return { currentEpoch: 0, expiryEpoch: 0, epochsRemaining: 0, totalAmountToPay: 0 };
    }

    const current = getCurrentEpoch();
    const expiry = timestampToEpoch(Number(rental.runsUntil));
    const remaining = Math.max(0, expiry - current);
    const total = remaining * parseFloat(String(rental.price));

    return {
      currentEpoch: current,
      expiryEpoch: expiry,
      epochsRemaining: remaining,
      totalAmountToPay: total,
    };
  }, [rental]);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();

  const rentalAllowance = useGetAllowance(
    (rental?.paymentToken.id as Address) || zeroAddress,
    (rental?.id as Address) || zeroAddress,
    REFETCH_INTERVALS,
  );

  const totalAmountToPayParsed = useMemo(
    () => parseUnits(totalAmountToPay.toString(), rental?.paymentToken.decimals || 18),
    [rental?.paymentToken.decimals, totalAmountToPay],
  );

  const balance = useGetBalance((rental?.paymentToken.id as Address) || zeroAddress);

  const requiresApproval = useMemo(
    () => rentalAllowance < totalAmountToPayParsed,
    [rentalAllowance, totalAmountToPayParsed],
  );

  const buttonText = useMemo(() => {
    if (requiresApproval) return 'Approve';
    if (balance < totalAmountToPayParsed) return 'Insufficient Balance';
    return 'Proceed';
  }, [requiresApproval, balance, totalAmountToPayParsed]);

  const approveRental = useApproveSpend(
    (rental?.paymentToken.id as Address) || zeroAddress,
    (rental?.id as Address) || zeroAddress,
    totalAmountToPayParsed,
  );

  const buyRental = useBuyRental(
    rental?.id as Address,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateTransaction = useCallback(() => {
    if (requiresApproval) {
      return approveRental.execute();
    } else {
      return buyRental.execute();
    }
  }, [approveRental, buyRental, requiresApproval]);

  if (!rental) return null;

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Rent Lock Preview" className="max-w-lg">
        <div className="flex flex-col gap-5 w-full max-h-[80vh] overflow-y-auto px-2 py-1">
          {/* Subtitle */}
          <div className="flex items-center gap-2">
            <KeyRoundIcon size={14} className="text-[#2962ff]" />
            <p className="text-[#64748b] font-mono text-[10px]">
              Review rental details before proceeding
            </p>
          </div>

          {/* Lock Details */}
          <div className="border border-white/10 bg-black p-4">
            <h4 className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
              <KeyRoundIcon size={12} className="text-[#64748b]" />
              Lock Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Lock ID */}
              <div className="col-span-1">
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Lock ID
                </p>
                <p className="font-mono text-sm text-white font-bold">
                  #{String(rental.lock.lockId)}
                </p>
              </div>

              {/* Amount Locked */}
              <div className="col-span-1">
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Amount Locked
                </p>
                <p className="font-mono text-sm text-white font-bold">
                  {formatNumber(String(rental.lock.position), 'en-US', 2)} MGN
                </p>
              </div>

              {/* Seller Address */}
              <div className="col-span-2">
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <UserIcon size={9} />
                  Seller Address
                </p>
                <p className="font-mono text-sm text-white font-bold break-all">
                  {splitString(String(rental.seller.address))}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border border-white/10 bg-black p-4">
            <h4 className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
              <CoinsIcon size={12} className="text-[#64748b]" />
              Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Payment Token */}
              <div className="col-span-1">
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Token
                </p>
                <p className="font-mono text-sm text-white font-bold">
                  {rental.paymentToken.symbol}
                </p>
              </div>

              {/* Price per Epoch */}
              <div className="col-span-1">
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Price / Epoch
                </p>
                <p className="font-mono text-sm text-[#00ff9d] font-bold">
                  {formatNumber(String(rental.price), 'en-US', 2)}
                </p>
              </div>
            </div>
          </div>

          {/* Epoch Calculation */}
          <div className="border border-[#2962ff]/30 bg-[#2962ff]/5 p-4">
            <h4 className="text-[#2962ff] font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2 font-bold">
              <ClockIcon size={12} className="text-[#2962ff]" />
              Rental Period
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Current
                </p>
                <p className="font-mono text-sm text-white font-bold">Epoch #{currentEpoch}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRightIcon size={16} className="text-[#2962ff]" />
              </div>
              <div>
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Expires
                </p>
                <p className="font-mono text-sm text-white font-bold">Epoch #{expiryEpoch}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2962ff]/20">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-wider">
                  Epochs Remaining
                </span>
                <span className="font-mono text-lg text-[#2962ff] font-bold">
                  {epochsRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Total Payment Calculation */}
          <div className="border-2 border-[#00ff9d]/40 bg-[#00ff9d]/10 p-4">
            <h4 className="text-[#00ff9d] font-mono text-[10px] uppercase tracking-widest mb-3 font-bold">
              Total Payment
            </h4>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#64748b] font-mono text-xs">
                {epochsRemaining} {epochsRemaining === 1 ? 'epoch' : 'epochs'} ×{' '}
                {formatNumber(String(rental.price), 'en-US', 2)} {rental.paymentToken.symbol}
              </p>
            </div>
            <div className="flex items-baseline justify-between pt-3 border-t border-[#00ff9d]/20">
              <span className="text-[#64748b] font-mono text-sm uppercase tracking-wider">
                Total Due
              </span>
              <div className="text-right">
                <p className="font-mono text-2xl text-[#00ff9d] font-bold">
                  {formatNumber(totalAmountToPay.toString(), 'en-US', 2)}
                </p>
                <p className="font-mono text-xs text-[#64748b] mt-1">
                  {rental.paymentToken.symbol}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          {epochsRemaining === 0 && (
            <div className="border border-[#ff4757]/40 bg-[#ff4757]/10 p-4 flex items-start gap-3">
              <AlertCircleIcon size={16} className="text-[#ff4757] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#ff4757] font-mono text-xs font-bold mb-1">Rental Expired</p>
                <p className="text-[#ff4757] font-mono text-[10px] leading-relaxed">
                  This rental has expired or is about to expire. You will not be able to rent this
                  lock.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-black pb-1">
            <SecondaryButton onClick={() => onOpenChange(false)} className="flex-1 py-3">
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={initiateTransaction}
              disabled={
                epochsRemaining === 0 ||
                balance < totalAmountToPayParsed ||
                approveRental.isLoading ||
                buyRental.isLoading
              }
              className="flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText}{' '}
              {(buyRental.isLoading || approveRental.isLoading) && (
                <Spinner size="sm" className="ml-2" />
              )}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          approveRental.reset();
          buyRental.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Rented lock successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          approveRental.reset();
          buyRental.reset();
        }}
        message={'An error occurred while renting lock. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
