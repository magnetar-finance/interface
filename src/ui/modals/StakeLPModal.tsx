'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ShieldPlusIcon } from 'lucide-react';
import { formatEther, parseEther, zeroAddress } from 'viem';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import { BI_ZERO, CHAINS_INFORMATION, NFPM, REFETCH_INTERVALS } from '@/constants';
import useGetCLPosition from '@/hooks/wallet/useGetCLPosition';
import { formatNumber } from '@/utils';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useERC721Allowance from '@/hooks/wallet/useERC721Allowance';
import { useAccount, useChainId } from 'wagmi';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useERC721Approve from '@/hooks/wallet/useERC721Approve';
import useStake from '@/hooks/gauges/useStake';
import useGetCLPositionOwner from '@/hooks/wallet/useGetCLPositionOwner';
import { Spinner } from '@/components/Spinner';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';

export interface StakeLPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolName?: string;
  poolAddress?: `0x${string}`;
  isCL?: boolean;
  tokenId?: bigint;
  gauge?: `0x${string}`;
}

export const StakeLPModal: React.FC<StakeLPModalProps> = ({
  open,
  onOpenChange,
  poolName,
  poolAddress = zeroAddress,
  isCL = false,
  tokenId = BI_ZERO,
  gauge = zeroAddress,
}) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setAmount('');
  }, [open]);

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const isValid = useMemo(
    () => parsedAmount > 0 && gauge && gauge !== zeroAddress,
    [gauge, parsedAmount],
  );

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  // Pool balance
  const lpBalance = useGetBalance(isCL ? zeroAddress : poolAddress, REFETCH_INTERVALS);
  const clBalance = useGetCLPosition(tokenId, REFETCH_INTERVALS);

  // LP pool ownership
  const tokenOwner = useGetCLPositionOwner(tokenId, REFETCH_INTERVALS);
  const { address } = useAccount();
  const isOwner = useMemo(
    () => tokenOwner.toLowerCase() === address?.toLowerCase(),
    [address, tokenOwner],
  );

  const chainId = useChainId();
  const nfpm = useMemo(() => NFPM[chainId], [chainId]);

  // Allowance
  const gaugeAllowance = useGetAllowance(poolAddress, gauge, REFETCH_INTERVALS);
  const gaugeAllowanceCL = useERC721Allowance(nfpm, gauge, REFETCH_INTERVALS);

  // Approval
  const gaugeApproval = useApproveSpend(poolAddress, gauge);
  const gaugeApprovalCL = useERC721Approve(nfpm, gauge);

  // Stake
  const stakeLP = useStake(
    gauge,
    isCL ? tokenId : parseEther(parsedAmount.toString()),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const buttonText = useMemo(() => {
    if (!gauge || gauge === zeroAddress) return 'No Vault for LP';
    if (!isCL && (!amount || parsedAmount === 0)) return 'Enter Amount';
    if (
      (isCL && !gaugeAllowanceCL) ||
      (!isCL && gaugeAllowance < parseEther(parsedAmount.toString()))
    )
      return 'Approve LP Spend';
    if (!isCL && lpBalance < parseEther(parsedAmount.toString())) return 'Insufficient Balance';
    if (isCL && !isOwner) return 'Already Staked';
    return 'Stake LP';
  }, [amount, gauge, gaugeAllowance, gaugeAllowanceCL, isCL, isOwner, lpBalance, parsedAmount]);

  const initiateTransaction = useCallback(() => {
    if (isCL) {
      if (!gaugeAllowanceCL) {
        gaugeApprovalCL.reset();
        return gaugeApprovalCL.execute();
      }
    } else {
      if (gaugeAllowance < parseEther(parsedAmount.toString())) {
        gaugeApproval.reset();
        return gaugeApproval.execute();
      }
    }

    return stakeLP.execute();
  }, [
    gaugeAllowance,
    gaugeAllowanceCL,
    gaugeApproval,
    gaugeApprovalCL,
    isCL,
    parsedAmount,
    stakeLP,
  ]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Stake LP">
        <div className="flex flex-col gap-6 p-5">
          {/* Pool info */}
          {poolName && (
            <div className="flex justify-between items-center">
              <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Pool
              </span>
              <span className="text-white font-bold font-mono text-xs">{poolName}</span>
            </div>
          )}

          {/* LP amount input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                {isCL ? 'Token ID' : 'Amount'} to Stake
              </label>
              <span className="text-[#64748b] font-mono text-[10px]">
                Balance:{' '}
                <span className="text-white">
                  {formatNumber(formatEther(isCL ? clBalance : lpBalance), 'en-US', 3)}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 border border-white/10 focus-within:border-[#2962ff]/60 transition-colors">
              <input
                type="number"
                min="0"
                value={isCL ? tokenId.toString() : amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent px-3 py-3 font-mono text-sm text-white placeholder:text-[#64748b] outline-none flex-1 min-w-0"
                readOnly={isCL}
              />
              <span className="text-[#64748b] font-mono text-xs px-3 shrink-0">LP</span>
            </div>

            {/* Quick percent buttons */}
            {!isCL && (
              <div className="flex gap-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() =>
                      setAmount(String((pct * parseFloat(formatEther(lpBalance))) / 100))
                    } // Placeholder — replace with real balance math
                    className="flex-1 border border-white/10 py-1 font-mono text-[10px] text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] transition-colors"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info row */}
          {isValid && (
            <div className="flex justify-between items-center border border-[#00ff9d]/20 bg-[#00ff9d]/5 px-3 py-2.5">
              <span className="text-[#64748b] font-mono text-xs">You will stake</span>
              <span className="text-[#00ff9d] font-bold font-mono text-xs">
                {parsedAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} LP
              </span>
            </div>
          )}

          <PrimaryButton
            disabled={
              !isValid || gaugeApproval.isLoading || gaugeApprovalCL.isLoading || stakeLP.isLoading
            }
            className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={initiateTransaction}
          >
            <ShieldPlusIcon size={14} />
            {buttonText}{' '}
            {(gaugeApprovalCL.isLoading || gaugeApproval.isLoading || stakeLP.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        </div>
      </Modal>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          gaugeApprovalCL.reset();
          gaugeApproval.reset();
          stakeLP.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'LP staked successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          gaugeApprovalCL.reset();
          gaugeApproval.reset();
          stakeLP.reset();
        }}
        message={'An error occurred while staking liquidity. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
