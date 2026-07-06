'use client';

import { PrimaryButton, WalletConnectButton } from '@/components/Button';
import { SwitchGroup } from '@/components/SwitchGroup';
import { AssetResponseType } from '@/config/github-assets.config';
import { TokenSelectModal } from '@/ui/modals/TokenSelectModal';
import { PlusIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { TokenInputRow } from './components/TokenInputRow';
import { formatUnits, parseUnits, zeroAddress } from 'viem';
import { CHAINS_INFORMATION, OP_SETTINGS, V2_ROUTERS } from '@/constants';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useAddLiquidityV2 from '@/hooks/exchange/useAddLiquidityV2';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import useMarketValueUSD from '@/hooks/exchange/useMarketValueUSD';
import { formatNumber } from '@/utils';
import { TransactionSuccessModal } from '@/ui/modals/TransactionSuccessModal';
import { TransactionErrorModal } from '@/ui/modals/TransactionErrorModal';
import { Spinner } from '@/components/Spinner';

enum SelectModalType {
  TOKEN_A,
  TOKEN_B,
}

export const StandardDepositView: React.FC<{
  initialTokenA: AssetResponseType[number] | null;
  initialTokenB: AssetResponseType[number] | null;
  initialPoolTypeIndex: number;
}> = ({ initialTokenA, initialTokenB, initialPoolTypeIndex }) => {
  const { isConnected } = useAccount();

  const [tokenA, setTokenA] = useState<AssetResponseType[number] | null>(null);
  const [tokenB, setTokenB] = useState<AssetResponseType[number] | null>(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  // Standard Pools only support Stable (0) or Volatile (1).
  // If concentrated was passed, default to volatile.
  const [activePoolTypeIndex, setActivePoolTypeIndex] = useState(0);

  const [modalType, setModalType] = useState<SelectModalType | null>(null);

  const handleTokenSelect = useCallback(
    (token: AssetResponseType[number]) => {
      if (modalType === SelectModalType.TOKEN_A) {
        if (tokenB?.address === token.address) setTokenB(tokenA);
        setTokenA(token);
      } else {
        if (tokenA?.address === token.address) setTokenA(tokenB);
        setTokenB(token);
      }
    },
    [modalType, tokenA, tokenB],
  );

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  // Parsed amounts
  const [amount0Parsed, amount1Parsed] = useMemo(
    () => [
      parseUnits(amountA, tokenA?.decimals || 18),
      parseUnits(amountB, tokenB?.decimals || 18),
    ],
    [amountA, amountB, tokenA?.decimals, tokenB?.decimals],
  );

  const chainId = useChainId();
  const router = useMemo(() => V2_ROUTERS[chainId], [chainId]);

  // Allowances
  const allowanceA = useGetAllowance(tokenA?.address || zeroAddress, router);
  const allowanceB = useGetAllowance(tokenB?.address || zeroAddress, router);

  // Approvals
  const approvalA = useApproveSpend(tokenA?.address || zeroAddress, router, amount0Parsed);
  const approvalB = useApproveSpend(tokenB?.address || zeroAddress, router, amount1Parsed);

  // Add liquidity
  const addLiquidity = useAddLiquidityV2(
    tokenA?.address || zeroAddress,
    tokenB?.address || zeroAddress,
    activePoolTypeIndex === 0, // stable if index is 0
    amount0Parsed,
    amount1Parsed,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

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

    addLiquidity.reset();
    return addLiquidity.execute();
  }, [addLiquidity, allowanceA, allowanceB, amount0Parsed, amount1Parsed, approvalA, approvalB]);

  // Balances
  const balanceA = useGetBalance(tokenA?.address || zeroAddress);
  const balanceB = useGetBalance(tokenB?.address || zeroAddress);

  // Market value
  const [amountAUSD] = useMarketValueUSD(
    tokenA?.address || zeroAddress,
    amount0Parsed,
    OP_SETTINGS.default_refetch_interval,
  );
  const [amountBUSD] = useMarketValueUSD(
    tokenB?.address || zeroAddress,
    amount1Parsed,
    OP_SETTINGS.default_refetch_interval,
  );

  const isSupplyDisabled = useMemo(() => {
    if (!tokenA || !tokenB) return true;
    if (!amountA && !amountB) return true;
    if (balanceA < amount0Parsed || balanceB < amount1Parsed) return true;
    if (parseFloat(amountA || '0') <= 0 && parseFloat(amountB || '0') <= 0) return true;
    return false;
  }, [tokenA, tokenB, amountA, amountB, balanceA, amount0Parsed, balanceB, amount1Parsed]);

  const buttonText = useMemo(() => {
    if (!tokenA || !tokenB) return 'Select tokens';
    if (!amountA && !amountB) return 'Enter an amount';
    if (balanceA < amount0Parsed || balanceB < amount1Parsed) return 'Insufficient balance';
    if (allowanceA < amount0Parsed) return `Approve ${tokenA.symbol}`;
    if (allowanceB < amount1Parsed) return `Approve ${tokenB.symbol}`;
    return 'Supply Standard Liquidity';
  }, [
    tokenA,
    tokenB,
    amountA,
    amountB,
    allowanceA,
    amount0Parsed,
    allowanceB,
    amount1Parsed,
    balanceA,
    balanceB,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialTokenA) setTokenA(initialTokenA);
    if (initialTokenB) setTokenB(initialTokenB);
    if (initialPoolTypeIndex !== undefined && initialPoolTypeIndex !== null)
      setActivePoolTypeIndex(initialPoolTypeIndex);
  }, [initialTokenA, initialTokenB, initialPoolTypeIndex]);

  return (
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Type Selector */}
      <div className="w-full relative z-10">
        <SwitchGroup
          switchLabels={['Stable', 'Volatile']}
          activeSwitchIndex={activePoolTypeIndex}
          onSwitchClicked={setActivePoolTypeIndex}
          fullWidth
        />
      </div>

      <div className="w-full flex flex-col relative gap-1">
        {/* First Token */}
        <TokenInputRow
          label="Token A"
          token={tokenA}
          amount={amountA}
          onAmountChange={setAmountA}
          onSelectClick={() => setModalType(SelectModalType.TOKEN_A)}
          usdValue={amountA ? `${formatNumber(formatUnits(amountAUSD, 18), 'en-US', 3)}` : '0.00'}
          balance={balanceA ? formatUnits(balanceA, tokenA?.decimals ?? 18) : '0.00'}
        />

        {/* Plus Divider */}
        <div className="w-full flex justify-center -my-3 z-10">
          <div className="bg-transparent border border-transparent p-1">
            <div className="bg-[#131525]/60 backdrop-blur-sm rounded-xl border border-[#2962ff]/50 p-1 flex justify-center items-center text-[#2962ff] shadow-[0_0_15px_rgba(41,98,255,0.2)]">
              <PlusIcon size={16} />
            </div>
          </div>
        </div>

        {/* Second Token */}
        <TokenInputRow
          label="Token B"
          token={tokenB}
          amount={amountB}
          onAmountChange={setAmountB}
          onSelectClick={() => setModalType(SelectModalType.TOKEN_B)}
          usdValue={amountB ? `${formatNumber(formatUnits(amountBUSD, 18), 'en-US', 3)}` : '0.00'}
          balance={balanceB ? formatUnits(balanceB, tokenB?.decimals ?? 18) : '0.00'}
        />
      </div>

      {/* Action Button */}
      <div className="w-full">
        {isConnected ? (
          <PrimaryButton
            disabled={
              (isSupplyDisabled ||
                addLiquidity.isLoading ||
                approvalA.isLoading ||
                approvalB.isLoading) &&
              isConnected
            }
            className="w-full py-4 text-base tracking-widest font-bold"
            onClick={initiateTransaction}
          >
            {buttonText}{' '}
            {(addLiquidity.isLoading || approvalA.isLoading || approvalB.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        ) : (
          <WalletConnectButton className="w-full py-4 tracking-widest font-bold" />
        )}
      </div>

      {/* Select Token Modal */}
      <TokenSelectModal
        open={modalType !== null}
        onOpenChange={(v) => !v && setModalType(null)}
        selectedToken={null}
        disabledToken={modalType === SelectModalType.TOKEN_A ? tokenB : tokenA}
        onTokenSelect={handleTokenSelect}
      />

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          approvalA.reset();
          approvalB.reset();
          addLiquidity.reset();
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
          addLiquidity.reset();
        }}
        message={'An error occurred while adding liquidity. Please try again.'}
        title="Transaction Failed"
      />
    </div>
  );
};
