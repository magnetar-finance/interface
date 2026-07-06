import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import { BI_ZERO, CHAINS_INFORMATION, REFETCH_INTERVALS, V2_ROUTERS } from '@/constants';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { useChainId } from 'wagmi';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import { Address, parseEther, parseUnits } from 'viem';
import useRemoveLiquidityV2 from '@/hooks/exchange/useRemoveLiquidityV2';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useRemoveLiquidityCL from '@/hooks/exchange/useRemoveLiquidityCL';
import { Spinner } from '@/components/Spinner';

type LiquidityPosition = NonNullable<GetAccountInfoQuery['user']>['lpPositions'][number];

export interface RemoveLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liquidityPosition: LiquidityPosition;
}

export const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  open,
  onOpenChange,
  liquidityPosition,
}) => {
  const [percentage, setPercentage] = useState<number>(0);

  const handlePercentageClick = (value: number) => {
    setPercentage(value);
  };

  const [token0Amount, token1Amount] = useMemo(() => {
    const percentageContributed =
      parseFloat(liquidityPosition.position as string) /
      parseFloat(liquidityPosition.pool.totalSupply as string);
    const token0Contibuted =
      percentageContributed * parseFloat(liquidityPosition.pool.reserve0 as string);
    const token1Contributed =
      percentageContributed * parseFloat(liquidityPosition.pool.reserve1 as string);
    return [token0Contibuted, token1Contributed];
  }, [
    liquidityPosition.pool.reserve0,
    liquidityPosition.pool.reserve1,
    liquidityPosition.pool.totalSupply,
    liquidityPosition.position,
  ]);

  const receiveToken0 = useMemo(
    () => (token0Amount * percentage) / 100,
    [percentage, token0Amount],
  );
  const receiveToken1 = useMemo(
    () => (token1Amount * percentage) / 100,
    [percentage, token1Amount],
  );
  const receivedLiquidity = useMemo(
    () => (parseFloat(liquidityPosition.position as string) * percentage) / 100,
    [liquidityPosition.position, percentage],
  );

  const { assetsDictionary } = useGHAssetsContext();

  const getAssetInfo = useCallback(
    (address: string) => assetsDictionary[address.toLowerCase()],
    [assetsDictionary],
  );

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();
  const v2Router = useMemo(() => V2_ROUTERS[chainId], [chainId]);

  const routerLPAllowance = useGetAllowance(
    liquidityPosition.pool.address as Address,
    v2Router,
    REFETCH_INTERVALS,
  );

  // Approval
  const routerLPApproval = useApproveSpend(
    liquidityPosition.pool.address as Address,
    v2Router,
    parseEther(receivedLiquidity.toString()),
  );

  // Remove liquidity
  const v2LPRemoval = useRemoveLiquidityV2(
    liquidityPosition.pool.token0.address as Address,
    liquidityPosition.pool.token1.address as Address,
    liquidityPosition.pool.poolType === 'STABLE',
    parseEther(receivedLiquidity.toString()),
    parseUnits(receiveToken0.toString(), liquidityPosition.pool.token0.decimals),
    parseUnits(receiveToken1.toString(), liquidityPosition.pool.token1.decimals),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );
  const clLPRemoval = useRemoveLiquidityCL(
    BigInt((liquidityPosition.clPositionTokenId as string) || '0'),
    parseEther(receivedLiquidity.toString()),
    BI_ZERO,
    BI_ZERO,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateTransaction = useCallback(() => {
    const isCL = liquidityPosition.pool.poolType === 'CONCENTRATED';

    if (isCL) {
      clLPRemoval.execute();
    } else {
      if (routerLPAllowance < parseEther(receivedLiquidity.toString())) {
        routerLPApproval.execute();
      } else {
        v2LPRemoval.execute();
      }
    }
  }, [
    clLPRemoval,
    liquidityPosition.pool.poolType,
    receivedLiquidity,
    routerLPAllowance,
    routerLPApproval,
    v2LPRemoval,
  ]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Remove Liquidity">
        <div className="flex flex-col p-5 gap-6">
          <div className="flex justify-between items-center w-full">
            <span className="text-[#94a3b8] font-semibold text-sm">Pool</span>
            <span className="text-white font-bold text-sm tracking-wide">
              {liquidityPosition.pool.name}
            </span>
          </div>

          {/* Percentage Section */}
          <div className="flex flex-col gap-4 bg-white/5 border border-white/5 p-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-[#94a3b8] text-sm font-semibold">Amount to Remove</span>
              <span className="text-[#00e0ff] text-xl font-bold">{percentage}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#00e0ff]"
            />

            <div className="flex w-full gap-2 mt-2">
              {[25, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => handlePercentageClick(val)}
                  className="flex-1 py-1.5 border border-white/10 text-xs font-mono text-[#94a3b8] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider"
                >
                  {val === 100 ? 'Max' : `${val}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Receive Section */}
          <div className="flex flex-col gap-4">
            <span className="text-[#94a3b8] text-sm font-semibold">You will receive</span>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-[#131525]/60 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  {getAssetInfo(liquidityPosition.pool.token0.address as string)?.logoURI ? (
                    <Image
                      src={getAssetInfo(liquidityPosition.pool.token0.address as string).logoURI}
                      alt={getAssetInfo(liquidityPosition.pool.token0.address as string).symbol}
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
                    {getAssetInfo(liquidityPosition.pool.token0.address as string)?.symbol ||
                      'Token 0'}
                  </span>
                </div>
                <span className="text-white font-mono text-sm">
                  {receiveToken0.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#131525]/60 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  {getAssetInfo(liquidityPosition.pool.token1.address as string)?.logoURI ? (
                    <Image
                      src={getAssetInfo(liquidityPosition.pool.token1.address as string).logoURI}
                      alt={getAssetInfo(liquidityPosition.pool.token1.address as string).symbol}
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
                    {getAssetInfo(liquidityPosition.pool.token1.address as string)?.symbol ||
                      'Token 1'}
                  </span>
                </div>
                <span className="text-white font-mono text-sm">
                  {receiveToken1.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <PrimaryButton
            disabled={percentage === 0}
            className="w-full py-4 uppercase tracking-widest font-bold"
            onClick={initiateTransaction}
          >
            {percentage === 0
              ? 'Enter Amount'
              : liquidityPosition.pool.poolType !== 'CONCENTRATED' &&
                routerLPAllowance < parseEther(receivedLiquidity.toString())
              ? 'Approve to spend liquidity'
              : 'Remove Liquidity'}{' '}
            {(routerLPApproval.isLoading || v2LPRemoval.isLoading || clLPRemoval.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        </div>
      </Modal>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          routerLPApproval.reset();
          v2LPRemoval.reset();
          clLPRemoval.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Liquidity removed successfully!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          routerLPApproval.reset();
          v2LPRemoval.reset();
          clLPRemoval.reset();
        }}
        message={'An error occurred while removing liquidity. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
