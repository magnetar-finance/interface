'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { TrendingUpIcon } from 'lucide-react';
import { useChainId } from 'wagmi';
import { BI_ZERO, CHAINS_INFORMATION, MGN, REFETCH_INTERVALS, VE } from '@/constants';
import { formatEther, parseEther } from 'viem';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useIncreaseLockAmount from '@/hooks/governance/useIncreaseLockAmount';
import { formatNumber } from '@/utils';
import { Spinner } from '@/components/Spinner';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';

export interface IncreaseLockAmountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: bigint;
  currentAmount?: string;
  currentVotingPower?: string;
}

export const IncreaseLockAmountModal: React.FC<IncreaseLockAmountModalProps> = ({
  open,
  onOpenChange,
  tokenId = BI_ZERO,
  currentAmount = '0',
  currentVotingPower = '0',
}) => {
  const [amount, setAmount] = useState('');

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const isValid = parsedAmount > 0;

  const chainId = useChainId();
  const mgn = useMemo(() => MGN[chainId], [chainId]);
  const escrow = useMemo(() => VE[chainId], [chainId]);

  const amountBI = useMemo(() => parseEther(parsedAmount.toString()), [parsedAmount]);

  const balance = useGetBalance(mgn, REFETCH_INTERVALS);
  const escrowAllowance = useGetAllowance(mgn, escrow, REFETCH_INTERVALS);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  // Executions
  const escrowApproval = useApproveSpend(mgn, escrow, amountBI);
  const lockAmountIncrease = useIncreaseLockAmount(
    tokenId,
    amountBI,
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
    return 'Increase Lock Amount';
  }, [amount, amountBI, balance, escrowAllowance, parsedAmount]);

  const initiateTransaction = useCallback(() => {
    if (escrowAllowance < amountBI) {
      escrowApproval.reset();
      return escrowApproval.execute();
    }
    return lockAmountIncrease.execute();
  }, [amountBI, escrowAllowance, escrowApproval, lockAmountIncrease]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setAmount('');
  }, [open]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Increase Lock Amount">
        <div className="flex flex-col gap-6 p-5">
          {/* Current stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Currently Locked ({tokenId})
              </span>
              <span className="text-white font-bold font-mono text-xs">{currentAmount ?? '—'}</span>
            </div>
            <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Voting Power Used
              </span>
              <span className="text-[#2962ff] font-bold font-mono text-xs">
                {currentVotingPower ?? '—'}
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Amount to Add
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
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <PrimaryButton
            disabled={
              !isValid ||
              lockAmountIncrease.isLoading ||
              escrowApproval.isLoading ||
              balance < amountBI
            }
            className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={initiateTransaction}
          >
            <TrendingUpIcon size={14} />
            {buttonText}{' '}
            {(lockAmountIncrease.isLoading || escrowApproval.isLoading) && (
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
          lockAmountIncrease.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Lock amount increased successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          escrowApproval.reset();
          lockAmountIncrease.reset();
        }}
        message={'An error occurred while increasing lock amount. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
