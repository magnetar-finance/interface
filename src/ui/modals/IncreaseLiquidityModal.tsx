import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { AssetResponseType } from '@/config/github-assets.config';
import Image from 'next/image';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { useChainId } from 'wagmi';
import { CHAINS_INFORMATION, ETHER, NFPM, REFETCH_INTERVALS } from '@/constants';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import { parseUnits, zeroAddress } from 'viem';
import useIncreaseLiquidityCL from '@/hooks/exchange/useIncreaseLiquidityCL';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import { Spinner } from '@/components/Spinner';

type LiquidityPosition = NonNullable<GetAccountInfoQuery['user']>['lpPositions'][number];

export interface IncreaseLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: LiquidityPosition | null;
  token0?: AssetResponseType[number];
  token1?: AssetResponseType[number];
}

export const IncreaseLiquidityModal: React.FC<IncreaseLiquidityModalProps> = ({
  open,
  onOpenChange,
  position,
  token0,
  token1,
}) => {
  const [amount0, setAmount0] = useState<string>('');
  const [amount1, setAmount1] = useState<string>('');

  const poolName = position?.pool?.name || 'Unknown Pool';

  const isInvalid = !amount0 && !amount1;

  const chainId = useChainId();
  const positionCreator = useMemo(() => NFPM[chainId], [chainId]);

  // Parsed amounts
  const [amount0Parsed, amount1Parsed] = useMemo(
    () => [
      parseUnits(amount0, token0?.decimals || 18),
      parseUnits(amount1, token1?.decimals || 18),
    ],
    [amount0, amount1, token0?.decimals, token1?.decimals],
  );

  // Allowances
  const allowanceA = useGetAllowance(token0?.address, positionCreator, REFETCH_INTERVALS);
  const allowanceB = useGetAllowance(token1?.address, positionCreator, REFETCH_INTERVALS);

  // Approvals
  const approvalA = useApproveSpend(token0?.address || zeroAddress, positionCreator, amount0Parsed);
  const approvalB = useApproveSpend(token1?.address || zeroAddress, positionCreator, amount1Parsed);

  const isETH = useMemo(
    () =>
      token0?.address.toLowerCase() === ETHER.toLowerCase() ||
      token1?.address.toLowerCase() === ETHER.toLowerCase(),
    [token0?.address, token1?.address],
  );
  const nonETHIndex = useMemo(
    () => (isETH ? (token0?.address.toLowerCase() === ETHER.toLowerCase() ? '0' : '1') : undefined),
    [isETH, token0?.address],
  );

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  // Increase liquidity
  const increaseLP = useIncreaseLiquidityCL(
    BigInt((position?.clPositionTokenId as string) || '0'),
    amount0Parsed,
    amount1Parsed,
    nonETHIndex,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  // Balances
  const balanceA = useGetBalance(token0?.address || zeroAddress);
  const balanceB = useGetBalance(token1?.address || zeroAddress);

  // Initiate transaction
  const initiateTransaction = useCallback(() => {
    if (allowanceA < amount0Parsed) {
      approvalA.reset();
      return approvalA.execute();
    }
    if (allowanceB < amount1Parsed) {
      approvalB.reset();
      return approvalB.execute();
    }

    increaseLP.reset();
    return increaseLP.execute();
  }, [increaseLP, allowanceA, allowanceB, amount0Parsed, amount1Parsed, approvalA, approvalB]);

  const buttonText = useMemo(() => {
    if (!token0 || !token1) return 'Select tokens';
    if (!amount0 && !amount1) return 'Enter an amount';
    if (balanceA < amount0Parsed || balanceB < amount1Parsed) return 'Insufficient balance';
    if (allowanceA < amount0Parsed) return `Approve ${token0.symbol}`;
    if (allowanceB < amount1Parsed) return `Approve ${token1.symbol}`;
    return 'Supply Liquidity';
  }, [
    token0,
    token1,
    amount0,
    amount1,
    balanceA,
    amount0Parsed,
    balanceB,
    amount1Parsed,
    allowanceA,
    allowanceB,
  ]);

  // Clear state when modal closes
  useEffect(() => {
    if (!open) {
      setAmount0('');
      setAmount1('');
    }
  }, [open]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Increase Liquidity">
        <div className="flex flex-col p-5 gap-6">
          <div className="flex justify-between items-center w-full">
            <span className="text-[#94a3b8] font-semibold text-sm">Pool</span>
            <span className="text-white font-bold text-sm tracking-wide">{poolName}</span>
          </div>

          {/* Amount Input Section */}
          <div className="flex flex-col gap-4">
            <span className="text-[#94a3b8] text-sm font-semibold">Amounts</span>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-[#131525]/60 backdrop-blur-sm border border-white/10 rounded-xl p-3 h-15">
                <div className="flex items-center gap-2 max-w-30 w-30">
                  {token0?.logoURI ? (
                    <Image
                      src={token0.logoURI}
                      alt={token0?.symbol || 'Token 0'}
                      width={24}
                      height={24}
                      className="rounded-full w-6 h-6 bg-white/10"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-[10px] font-bold">T0</span>
                    </div>
                  )}
                  <span className="text-white font-bold text-sm">
                    {token0?.symbol || position?.pool?.token0?.symbol || 'Token 0'}
                  </span>
                </div>
                <input
                  type="number"
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-white font-mono text-xl outline-none text-right flex-1 min-w-0"
                />
              </div>

              <div className="flex justify-between items-center bg-[#131525]/60 backdrop-blur-sm border border-white/10 rounded-xl p-3 h-15">
                <div className="flex items-center gap-2 max-w-30 w-30">
                  {token1?.logoURI ? (
                    <Image
                      src={token1.logoURI}
                      alt={token1?.symbol || 'Token 1'}
                      width={24}
                      height={24}
                      className="rounded-full w-6 h-6 bg-white/10"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-amber-600 text-[10px] font-bold">T1</span>
                    </div>
                  )}
                  <span className="text-white font-bold text-sm">
                    {token1?.symbol || position?.pool?.token1?.symbol || 'Token 1'}
                  </span>
                </div>
                <input
                  type="number"
                  value={amount1}
                  onChange={(e) => setAmount1(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-white font-mono text-xl outline-none text-right flex-1 min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <PrimaryButton
            disabled={isInvalid}
            className="w-full py-4 uppercase tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={initiateTransaction}
          >
            {buttonText}{' '}
            {(increaseLP.isLoading || approvalA.isLoading || approvalB.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        </div>
      </Modal>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          approvalA.reset();
          approvalB.reset();
          increaseLP.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Liquidity added successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          approvalA.reset();
          approvalB.reset();
          increaseLP.reset();
        }}
        message={'An error occurred while adding liquidity. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
