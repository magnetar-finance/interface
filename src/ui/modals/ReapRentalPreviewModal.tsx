'use client';

import React, { useCallback, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton, SecondaryButton } from '@/components/Button';
import { KeyRoundIcon, CoinsIcon, ClockIcon, UserIcon } from 'lucide-react';
import { formatNumber, splitString, timestampToEpoch, getCurrentEpoch } from '@/utils';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { Address, zeroAddress } from 'viem';
import { CHAINS_INFORMATION } from '@/constants';
import useReapRental from '@/hooks/governance/useReapRental';
import { useChainId } from 'wagmi';
import { Spinner } from '@/components/Spinner';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';

type RentalType = NonNullable<GetAccountInfoQuery['user']>['buyerRentals'][number];

export interface ReapRentalPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: RentalType | null;
}

export const ReapRentalPreviewModal: React.FC<ReapRentalPreviewModalProps> = ({
  open,
  onOpenChange,
  rental,
}) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();

  const reapRental = useReapRental(
    (rental?.id as Address) || zeroAddress,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateTransaction = useCallback(() => {
    reapRental.execute();
  }, [reapRental]);

  if (!rental) return null;

  const currentEpoch = getCurrentEpoch();
  const expiryEpoch = timestampToEpoch(Number(rental.runsUntil));

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Claim Rewards Preview"
        className="max-w-lg"
      >
        <div className="flex flex-col gap-5 w-full max-h-[80vh] overflow-y-auto px-2 py-1">
          {/* Subtitle */}
          <div className="flex items-center gap-2">
            <CoinsIcon size={14} className="text-[#2962ff]" />
            <p className="text-[#64748b] font-mono text-[10px]">
              Review rental reward details before claiming
            </p>
          </div>

          {/* Lock Details */}
          <div className="border border-white/10 bg-[#131525]/50 backdrop-blur-sm rounded-xl ">
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
                <p className="font-mono text-sm text-white font-bold">#{String(rental.lock.id)}</p>
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
                  Owner Address
                </p>
                <p className="font-mono text-sm text-white font-bold break-all">
                  {splitString(String(rental.seller.address))}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Current
                </p>
                <p className="font-mono text-sm text-white font-bold">Epoch #{currentEpoch}</p>
              </div>
              <div>
                <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-wider mb-1">
                  Expires
                </p>
                <p className="font-mono text-sm text-white font-bold">Epoch #{expiryEpoch}</p>
              </div>
            </div>
          </div>

          {/* Reward Details */}
          <div className="border-2 border-[#00ff9d]/40 bg-[#00ff9d]/10 p-4">
            <h4 className="text-[#00ff9d] font-mono text-[10px] uppercase tracking-widest mb-3 font-bold">
              Reward Overview
            </h4>
            <div className="flex items-baseline justify-between pt-2 border-t border-[#00ff9d]/20 mt-2">
              <span className="text-[#64748b] font-mono text-sm uppercase tracking-wider">
                Price Paid
              </span>
              <div className="text-right">
                <p className="font-mono text-2xl text-[#00ff9d] font-bold">
                  {formatNumber(String(rental.price), 'en-US', 2)}
                </p>
                <p className="font-mono text-xs text-[#64748b] mt-1">
                  {rental.paymentToken.symbol}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-black pb-1">
            <SecondaryButton onClick={() => onOpenChange(false)} className="flex-1 py-3">
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={initiateTransaction}
              disabled={rental.reaped || reapRental.isLoading}
              className="flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rental.reaped ? 'Already Claimed' : 'Claim Rewards'}
              {reapRental.isLoading && <Spinner size="sm" className="ml-2" />}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          reapRental.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
            onOpenChange(false);
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Rewards successfully claimed!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          reapRental.reset();
        }}
        message={'An error occurred while claiming rewards. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
