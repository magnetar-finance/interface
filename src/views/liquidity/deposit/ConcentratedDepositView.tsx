'use client';

import { PrimaryButton, WalletConnectButton } from '@/components/Button';
import { AssetResponseType } from '@/config/github-assets.config';
import { TokenSelectModal } from '@/ui/modals/TokenSelectModal';
import { PlusIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RangeDistributionChart } from '@/ui/charts/RangeDistributionChart';
import { useAccount, useChainId } from 'wagmi';
import { TokenInputRow } from './components/TokenInputRow';
import { formatUnits, parseUnits, zeroAddress } from 'viem';
import useCLPool from '@/hooks/exchange/useCLPool';
import {
  BI_ZERO,
  CHAINS_INFORMATION,
  NFPM,
  OP_SETTINGS,
  REFETCH_INTERVALS,
  V3_SQRT_PRICE_BASIS,
  V3_TICK_BASIS,
} from '@/constants';
import useCLPoolSlot from '@/hooks/exchange/useClPoolSlot';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import useAddLiquidityCL from '@/hooks/exchange/useAddLiquidityCL';
import { TransactionSuccessModal } from '@/ui/modals/TransactionSuccessModal';
import { TransactionErrorModal } from '@/ui/modals/TransactionErrorModal';
import { Spinner } from '@/components/Spinner';
import useMarketValueUSD from '@/hooks/exchange/useMarketValueUSD';
import { formatNumber } from '@/utils/numbers';

const DATA_LENGTH = 40;
// Use a sensible tick window so handle drags return realistic prices.
// Tick ±5 000 corresponds roughly to a price range of 0.61 – 1.65 around 1.0.
const DATA_TICK_MIN = -5000;
const DATA_TICK_MAX = 5000;
const PRICE_MIN = parseFloat(tickToPrice(DATA_TICK_MIN));
const PRICE_MAX = parseFloat(tickToPrice(DATA_TICK_MAX));

const DISTRIBUTION_DATA = Array.from({ length: DATA_LENGTH }).map((_, i) => {
  // Space ticks linearly so every bar maps to a proportional price step.
  const tick = Math.round(
    DATA_TICK_MIN + (i / (DATA_LENGTH - 1)) * (DATA_TICK_MAX - DATA_TICK_MIN),
  );
  return {
    tick,
    value: Math.exp(-Math.pow(i - DATA_LENGTH / 2, 2) / 50) * 100 + Math.random() * 10,
  };
});

const TICK_SPACING = {
  100: 1,
  500: 50,
  600: 100,
  3000: 200,
  10000: 2000,
};

function tickToPrice(tick: number): string {
  const price = Math.pow(V3_TICK_BASIS, tick);
  return price < 0.0001 ? price.toFixed(8) : price.toFixed(4);
}

function priceToTick(price: number): number {
  if (price <= 0) return -887272;
  const tick = Math.floor(Math.log(price) / Math.log(V3_TICK_BASIS));
  return Math.max(-887272, Math.min(887272, tick));
}

enum SelectModalType {
  TOKEN_A,
  TOKEN_B,
}

export const ConcentratedDepositView: React.FC<{
  initialTokenA: AssetResponseType[number] | null;
  initialTokenB: AssetResponseType[number] | null;
}> = ({ initialTokenA, initialTokenB }) => {
  const { isConnected } = useAccount();

  const [tokenA, setTokenA] = useState<AssetResponseType[number] | null>(null);
  const [tokenB, setTokenB] = useState<AssetResponseType[number] | null>(null);
  const [feeTier, setFeeTier] = useState<number>(3000);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  const [minPrice, setMinPrice] = useState('0.95');
  const [maxPrice, setMaxPrice] = useState('1.05');

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

  // Derive active bounds for the chart highlighting (MOCK calculation)
  const chartMinIndex = useMemo(
    () => priceToTick(parseFloat(minPrice || String(PRICE_MIN))),
    [minPrice],
  );
  const chartMaxIndex = useMemo(
    () => priceToTick(parseFloat(maxPrice || String(PRICE_MAX))),
    [maxPrice],
  );

  const handleMinIndexChange = useCallback((tick: number) => setMinPrice(tickToPrice(tick)), []);
  const handleMaxIndexChange = useCallback((tick: number) => setMaxPrice(tickToPrice(tick)), []);

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

  const tickSpacing = TICK_SPACING[feeTier as keyof typeof TICK_SPACING] || 60;

  // Derived sorted tokens
  const isSorted = useMemo(() => {
    if (!tokenA || !tokenB) return true;
    return BigInt(tokenA.address) < BigInt(tokenB.address);
  }, [tokenA, tokenB]);

  const token0 = isSorted ? tokenA : tokenB;
  const token1 = isSorted ? tokenB : tokenA;

  const poolAddress = useCLPool(
    token0?.address || zeroAddress,
    token1?.address || zeroAddress,
    tickSpacing,
  );

  const [sqrtPriceX96] = useCLPoolSlot(
    token0?.address || zeroAddress,
    token1?.address || zeroAddress,
    tickSpacing,
  );

  // Balances
  const balanceA = useGetBalance(tokenA?.address || zeroAddress);
  const balanceB = useGetBalance(tokenB?.address || zeroAddress);

  const isSupplyDisabled = useMemo(() => {
    if (!tokenA || !tokenB) return true;
    if (!amountA || !amountB) return true;
    if (parseFloat(amountA || '0') <= 0 && parseFloat(amountB || '0') <= 0) return true;
    if (!minPrice || !maxPrice || parseFloat(minPrice) >= parseFloat(maxPrice)) return true;
    if (balanceA < amount0Parsed || balanceB < amount1Parsed) return true;
    return false;
  }, [
    tokenA,
    tokenB,
    amountA,
    amountB,
    minPrice,
    maxPrice,
    balanceA,
    amount0Parsed,
    balanceB,
    amount1Parsed,
  ]);

  const initialPrice = useMemo(() => {
    if (
      !isSupplyDisabled &&
      (!sqrtPriceX96 || sqrtPriceX96 === BI_ZERO) &&
      poolAddress === zeroAddress
    ) {
      return parseFloat(amountB) / parseFloat(amountA);
    }
    return 0;
  }, [amountA, amountB, isSupplyDisabled, sqrtPriceX96, poolAddress]);

  const initialSqrtPriceX96 = useMemo(() => {
    if (initialPrice === 0) return BI_ZERO;
    const ratio1_0 = isSorted ? initialPrice : 1 / initialPrice;
    return BigInt(
      Math.floor(
        Math.sqrt(ratio1_0 * Math.pow(10, (token1?.decimals || 18) - (token0?.decimals || 18))) *
          V3_SQRT_PRICE_BASIS,
      ),
    );
  }, [initialPrice, token0?.decimals, token1?.decimals, isSorted]);

  const sqrtPriceX96ToPrice = useMemo(() => {
    if (!sqrtPriceX96 || sqrtPriceX96 === BI_ZERO) return 0;
    const firstLayer = Number(sqrtPriceX96) / V3_SQRT_PRICE_BASIS;
    const price =
      Math.pow(firstLayer, 2) / Math.pow(10, (token1?.decimals || 18) - (token0?.decimals || 18));
    return isSorted ? price : 1 / price;
  }, [sqrtPriceX96, token0?.decimals, token1?.decimals, isSorted]);

  // const chartMinIndexSorted = useMemo(
  //   () => (isSorted ? chartMinIndex : -chartMaxIndex),
  //   [chartMinIndex, chartMaxIndex, isSorted],
  // );
  // const chartMaxIndexSorted = useMemo(
  //   () => (isSorted ? chartMaxIndex : -chartMinIndex),
  //   [chartMinIndex, chartMaxIndex, isSorted],
  // );

  const usableLowerTick = useMemo(() => {
    if (!token0 || !token1) return 0;
    const minP = parseFloat(minPrice || String(PRICE_MIN));
    const maxP = parseFloat(maxPrice || String(PRICE_MAX));
    const token0Dec = token0.decimals || 18;
    const token1Dec = token1.decimals || 18;

    let rawLowerPrice: number;
    if (isSorted) {
      rawLowerPrice = minP * Math.pow(10, token1Dec - token0Dec);
    } else {
      rawLowerPrice = (1 / maxP) * Math.pow(10, token1Dec - token0Dec);
    }
    return Math.floor(priceToTick(rawLowerPrice) / tickSpacing) * tickSpacing;
  }, [minPrice, maxPrice, isSorted, token0, token1, tickSpacing]);

  const usableUpperTick = useMemo(() => {
    if (!token0 || !token1) return 0;
    const minP = parseFloat(minPrice || String(PRICE_MIN));
    const maxP = parseFloat(maxPrice || String(PRICE_MAX));
    const token0Dec = token0.decimals || 18;
    const token1Dec = token1.decimals || 18;

    let rawUpperPrice: number;
    if (isSorted) {
      rawUpperPrice = maxP * Math.pow(10, token1Dec - token0Dec);
    } else {
      rawUpperPrice = (1 / minP) * Math.pow(10, token1Dec - token0Dec);
    }
    return Math.ceil(priceToTick(rawUpperPrice) / tickSpacing) * tickSpacing;
  }, [minPrice, maxPrice, isSorted, token0, token1, tickSpacing]);

  const chainId = useChainId();
  const positionCreator = useMemo(() => NFPM[chainId], [chainId]);

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

  // Allowances
  const allowanceA = useGetAllowance(tokenA?.address, positionCreator, REFETCH_INTERVALS);
  const allowanceB = useGetAllowance(tokenB?.address, positionCreator, REFETCH_INTERVALS);

  // Approvals
  const approvalA = useApproveSpend(tokenA?.address || zeroAddress, positionCreator);
  const approvalB = useApproveSpend(tokenB?.address || zeroAddress, positionCreator);

  const amount0ParsedSorted = isSorted ? amount0Parsed : amount1Parsed;
  const amount1ParsedSorted = isSorted ? amount1Parsed : amount0Parsed;

  // Add liquidity
  const addLiquidity = useAddLiquidityCL(
    token0?.address || zeroAddress,
    token1?.address || zeroAddress,
    tickSpacing,
    usableLowerTick,
    usableUpperTick,
    amount0ParsedSorted,
    amount1ParsedSorted,
    initialSqrtPriceX96,
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

  const buttonText = useMemo(() => {
    if (!tokenA || !tokenB) return 'Select tokens';
    if (!amountA && !amountB) return 'Enter an amount';
    if (!minPrice || !maxPrice || parseFloat(minPrice) >= parseFloat(maxPrice))
      return 'Invalid Price Range';
    if (balanceA < amount0Parsed || balanceB < amount1Parsed) return 'Insufficient balance';
    if (allowanceA < amount0Parsed) return `Approve ${tokenA.symbol}`;
    if (allowanceB < amount1Parsed) return `Approve ${tokenB.symbol}`;
    return 'Supply Concentrated Liquidity';
  }, [
    tokenA,
    tokenB,
    amountA,
    amountB,
    minPrice,
    maxPrice,
    balanceA,
    balanceB,
    allowanceA,
    amount0Parsed,
    allowanceB,
    amount1Parsed,
  ]);

  useEffect(() => {
    if (initialTokenA) setTokenA(initialTokenA);
    if (initialTokenB) setTokenB(initialTokenB);
  }, [initialTokenA, initialTokenB]);

  return (
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Fee Tier Selection */}
      <div className="w-full">
        <span className="mb-2 block text-xs font-semibold text-muted">Select fee tier</span>
        <div className="flex gap-2 w-full">
          {Object.keys(TICK_SPACING).map((tierStr) => {
            const tier = parseInt(tierStr);
            const percentage = (tier / 10000).toFixed(2);
            const isSelected = feeTier === tier;

            return (
              <button
                key={tier}
                onClick={() => setFeeTier(tier)}
                className={`flex-1 py-2 px-1 border rounded-lg text-[10px] sm:text-xs font-sans font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-accent/10 text-accent border-accent/50'
                    : 'bg-surface/50 border-white/10 text-muted hover:border-accent/30 hover:text-accent'
                }`}
              >
                {percentage}%
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualizer Region */}
      <div className="group relative w-full rounded-2xl border border-white/[0.07] bg-surface/60 p-4 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-muted">Set price range</span>
          {tokenA && tokenB && (
            <span className="text-xs font-mono text-accent">
              {sqrtPriceX96ToPrice !== 0
                ? `Current Price: 1 ${tokenA.symbol} = ${sqrtPriceX96ToPrice.toFixed(3)} ${
                    tokenB.symbol
                  }`
                : `Starting Price: 1 ${tokenA.symbol} = ${initialPrice.toFixed(3)} ${
                    tokenB.symbol
                  }`}
            </span>
          )}
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-32 mb-4 border-b border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
          <RangeDistributionChart
            data={DISTRIBUTION_DATA}
            chartMinIndex={chartMinIndex}
            chartMaxIndex={chartMaxIndex}
            activeColor="#2660f5"
            onMinIndexChange={handleMinIndexChange}
            onMaxIndexChange={handleMaxIndexChange}
          />
        </div>

        {/* Min/Max Inputs */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1 bg-surface/50 rounded-lg border border-white/10 p-3 focus-within:border-accent/80 transition-all duration-200">
            <span className="text-muted text-[11px] font-semibold block mb-1">Min Price</span>
            <div className="flex items-center">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-transparent text-foreground font-mono text-xl w-full outline-none"
              />
            </div>
            <span className="text-muted text-[10px] font-mono mt-1 block">
              {tokenB?.symbol || 'B'} per {tokenA?.symbol || 'A'}
            </span>
          </div>

          <div className="flex-1 bg-surface/50 rounded-lg border border-white/10 p-3 focus-within:border-accent/80 transition-all duration-200">
            <span className="text-muted text-[11px] font-semibold block mb-1">Max Price</span>
            <div className="flex items-center">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-transparent text-foreground font-mono text-xl w-full outline-none"
              />
            </div>
            <span className="text-muted text-[10px] font-mono mt-1 block">
              {tokenB?.symbol || 'B'} per {tokenA?.symbol || 'A'}
            </span>
          </div>
        </div>

        {/* Quick Range Actions */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 mt-4">
          <button
            onClick={() => {
              const value = 0.1 * initialPrice;
              const min = initialPrice - value;
              const max = initialPrice + value;
              setMinPrice(min.toFixed(4));
              setMaxPrice(max.toFixed(4));
            }}
            className="flex-1 py-1 px-2 border border-white/10 rounded-lg text-muted hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-xs font-mono font-bold transition-all duration-200 bg-surface/50"
          >
            10%
          </button>
          <button
            onClick={() => {
              const value = 0.199 * initialPrice;
              const min = initialPrice - value;
              const max = initialPrice + value;
              setMinPrice(min.toFixed(4));
              setMaxPrice(max.toFixed(4));
            }}
            className="flex-1 py-1 px-2 border border-white/10 rounded-lg text-muted hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-xs font-mono font-bold transition-all duration-200 bg-surface/50"
          >
            20%
          </button>
          <button
            onClick={() => {
              const value = 0.199 * initialPrice;
              const min = initialPrice - value;
              const max = initialPrice + value;
              setMinPrice(min.toFixed(4));
              setMaxPrice(max.toFixed(4));
            }}
            className="flex-1 py-1 px-2 border border-white/10 rounded-lg text-muted hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-xs font-mono font-bold transition-all duration-200 bg-surface/50"
          >
            20%
          </button>
          <button
            onClick={() => {
              const value = 0.299 * initialPrice;
              const min = initialPrice - value;
              const max = initialPrice + value;
              setMinPrice(min.toFixed(4));
              setMaxPrice(max.toFixed(4));
            }}
            className="flex-1 py-1 px-2 border border-white/10 rounded-lg text-muted hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-xs font-mono font-bold transition-all duration-200 bg-surface/50"
          >
            30%
          </button>
          <button
            onClick={() => {
              const value = 0.399 * initialPrice;
              const min = initialPrice - value;
              const max = initialPrice + value;
              setMinPrice(min.toFixed(4));
              setMaxPrice(max.toFixed(4));
            }}
            className="flex-1 py-1 px-2 border border-white/10 rounded-lg text-muted hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-xs font-mono font-bold transition-all duration-200 bg-surface/50"
          >
            40%
          </button>
          <button
            onClick={() => {
              // Use the absolute CL tick bounds for a true full-range position.
              setMinPrice(tickToPrice(-887272));
              setMaxPrice(tickToPrice(887272));
            }}
            className="flex-2 py-1 px-2 border border-accent/30 rounded-lg text-accent hover:bg-accent/10 text-xs font-mono font-bold transition-all duration-200 bg-accent/5"
          >
            Full Range
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col relative gap-1 mt-2">
        {/* First Token */}
        <TokenInputRow
          label="Deposit Amount"
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
            <div className="bg-surface/60 backdrop-blur-sm rounded-xl border border-accent/50 p-1 flex justify-center items-center text-accent">
              <PlusIcon size={16} />
            </div>
          </div>
        </div>

        {/* Second Token */}
        <TokenInputRow
          label="Deposit Amount"
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
            className="w-full"
            onClick={initiateTransaction}
          >
            {buttonText}{' '}
            {(addLiquidity.isLoading || approvalA.isLoading || approvalB.isLoading) && (
              <Spinner size="sm" className="ml-2" />
            )}
          </PrimaryButton>
        ) : (
          <WalletConnectButton className="w-full" size="lg" />
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
