'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ShieldXIcon } from 'lucide-react';
import { formatEther, parseEther, zeroAddress } from 'viem';
import { BI_ZERO, CHAINS_INFORMATION, REFETCH_INTERVALS } from '@/constants';
import useCheckBalanceV2 from '@/hooks/gauges/useCheckBalanceV2';
import useUnstake from '@/hooks/gauges/useUnstake';
import { useChainId } from 'wagmi';
import { formatNumber } from '@/utils';
import useGetCLPositionOwner from '@/hooks/wallet/useGetCLPositionOwner';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';
import { Spinner } from '@/components/Spinner';

export interface UnstakeLPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolName?: string;
  gauge?: `0x${string}`;
  tokenId?: bigint;
}

export const UnstakeLPModal: React.FC<UnstakeLPModalProps> = ({
  open,
  onOpenChange,
  poolName,
  gauge = zeroAddress,
  tokenId = BI_ZERO,
}) => {
  const [percentage, setPercentage] = useState(0);
  const isV2 = useMemo(() => tokenId === BI_ZERO, [tokenId]);
  const gaugeBalanceV2 = useCheckBalanceV2(isV2 ? gauge : zeroAddress, REFETCH_INTERVALS);
  const tokenOwner = useGetCLPositionOwner(tokenId, REFETCH_INTERVALS);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setPercentage(0);
  }, [open]);

  const unstakeAmount = useMemo(
    () => (isV2 ? (percentage * parseFloat(formatEther(gaugeBalanceV2))) / 100 : 0),
    [isV2, percentage, gaugeBalanceV2],
  );

  const chainId = useChainId();

  const unstakeLP = useUnstake(
    gauge,
    isV2 ? parseEther(unstakeAmount.toString()) : tokenId,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Unstake LP">
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

          {/* Staked balance */}
          <div className="border border-white/5 bg-white/3 px-3 py-2.5 flex justify-between items-center">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Staked {isV2 ? 'Balance' : 'Position'}
            </span>
            <span className="text-white font-bold font-mono text-xs">
              {isV2 ? formatNumber(formatEther(gaugeBalanceV2)) : tokenId.toString()}
            </span>
          </div>

          {/* Percentage slider */}
          <div className="flex flex-col gap-4 bg-white/5 border border-white/5 p-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-[#94a3b8] text-sm font-mono font-semibold">
                Amount to Unstake
              </span>
              <span className="text-[#2962ff] text-xl font-bold font-mono">{percentage}%</span>
            </div>

            {isV2 && (
              <>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#2962ff]"
                />

                <div className="flex w-full gap-1.5">
                  {[25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPercentage(val)}
                      className="flex-1 py-1.5 border border-white/10 text-xs font-mono text-[#94a3b8] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      {val === 100 ? 'Max' : `${val}%`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Amount preview */}
          {percentage > 0 && isV2 && (
            <div className="flex justify-between items-center border border-[#ff4757]/20 bg-[#ff4757]/5 px-3 py-2.5">
              <span className="text-[#64748b] font-mono text-xs">You will unstake</span>
              <span className="text-[#ff4757] font-bold font-mono text-xs">
                {unstakeAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} LP
              </span>
            </div>
          )}

          <PrimaryButton
            disabled={
              (isV2
                ? percentage === 0 || gaugeBalanceV2 === BI_ZERO
                : tokenOwner.toLowerCase() !== gauge.toLowerCase() && gauge !== zeroAddress) ||
              unstakeLP.isLoading
            }
            className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={unstakeLP.execute}
          >
            <ShieldXIcon size={14} />
            Unstake LP
            {unstakeLP.isLoading && <Spinner size="sm" className="ml-2" />}
          </PrimaryButton>
        </div>
      </Modal>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          unstakeLP.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'LP successfully unstaked!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          unstakeLP.reset();
        }}
        message={'An error occurred while unstaking liquidity position. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
