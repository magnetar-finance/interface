'use client';

import { PrimaryButton, WalletConnectButton } from '@/components/Button';
import { AssetResponseType } from '@/config/github-assets.config';
import { TokenSelectModal } from '@/ui/modals/TokenSelectModal';
import { PlusIcon } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
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

  const [tokenA, setTokenA] = useState<AssetResponseType[number] | null>(initialTokenA);
  const [tokenB, setTokenB] = useState<AssetResponseType[number] | null>(initialTokenB);
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

  const isSupplyDisabled = useMemo(() => {
    if (!tokenA || !tokenB) return true;
    if (!amountA || !amountB) return true;
    if (parseFloat(amountA || '0') <= 0 && parseFloat(amountB || '0') <= 0) return true;
    if (!minPrice || !maxPrice || parseFloat(minPrice) >= parseFloat(maxPrice)) return true;
    return false;
  }, [tokenA, tokenB, amountA, amountB, minPrice, maxPrice]);

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

  // Balances
  const balanceA = useGetBalance(tokenA?.address || zeroAddress);
  const balanceB = useGetBalance(tokenB?.address || zeroAddress);

  // Allowances
  const allowanceA = useGetAllowance(tokenA?.address, positionCreator, REFETCH_INTERVALS);
  const allowanceB = useGetAllowance(tokenB?.address, positionCreator, REFETCH_INTERVALS);

  // Approvals
  const approvalA = useApproveSpend(tokenA?.address || zeroAddress, positionCreator, amount0Parsed);
  const approvalB = useApproveSpend(tokenB?.address || zeroAddress, positionCreator, amount1Parsed);

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
    if (balanceA == BI_ZERO || balanceB == BI_ZERO) return 'Insufficient balance';
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

  return (
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Fee Tier Selection */}
      <div className="w-full">
        <span className="text-[#64748b] text-xs font-bold tracking-widest uppercase mb-2 block">
          Select Fee Tier
        </span>
        <div className="flex gap-2 w-full">
          {Object.keys(TICK_SPACING).map((tierStr) => {
            const tier = parseInt(tierStr);
            const percentage = (tier / 10000).toFixed(2);
            const isSelected = feeTier === tier;

            return (
              <button
                key={tier}
                onClick={() => setFeeTier(tier)}
                className={`flex-1 py-2 px-1 border text-[10px] sm:text-xs font-mono font-bold transition-colors ${
                  isSelected
                    ? 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/50'
                    : 'bg-black border-white/10 text-[#64748b] hover:border-[#00ff9d]/30 hover:text-[#00ff9d]'
                }`}
              >
                {percentage}%
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualizer Region */}
      <div className="w-full bg-[#050508] border border-white/5 p-4 relative group">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#64748b] text-xs font-bold tracking-widest uppercase">
            Set Price Range
          </span>
          {tokenA && tokenB && (
            <span className="text-xs font-mono text-[#00ff9d]">
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
            activeColor="#2962ff"
            inactiveColor="rgba(255,255,255,0.05)"
            onMinIndexChange={handleMinIndexChange}
            onMaxIndexChange={handleMaxIndexChange}
          />
        </div>

        {/* Min/Max Inputs */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1 bg-black border border-white/10 p-3 focus-within:border-[#2962ff]/80 transition-colors">
            <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest block mb-1">
              Min Price
            </span>
            <div className="flex items-center">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-transparent text-white font-mono text-xl w-full outline-none"
              />
            </div>
            <span className="text-[#64748b] text-[10px] font-mono mt-1 block">
              {tokenB?.symbol || 'B'} per {tokenA?.symbol || 'A'}
            </span>
          </div>

          <div className="flex-1 bg-black border border-white/10 p-3 focus-within:border-[#2962ff]/80 transition-colors">
            <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest block mb-1">
              Max Price
            </span>
            <div className="flex items-center">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-transparent text-white font-mono text-xl w-full outline-none"
              />
            </div>
            <span className="text-[#64748b] text-[10px] font-mono mt-1 block">
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
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
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
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
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
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
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
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
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
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
          >
            40%
          </button>
          <button
            onClick={() => {
              // Use the absolute CL tick bounds for a true full-range position.
              setMinPrice(tickToPrice(-887272));
              setMaxPrice(tickToPrice(887272));
            }}
            className="flex-2 py-1 px-2 border border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10 text-xs font-mono font-bold transition-colors bg-[#00ff9d]/5"
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
          <div className="bg-[#050508] border border-[#2962ff]/30 p-1">
            <div className="bg-black border border-[#2962ff]/50 p-1 flex justify-center items-center text-[#2962ff]">
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
            disabled={isSupplyDisabled && isConnected}
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
