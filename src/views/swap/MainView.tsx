'use client';

import { AssetResponseType } from '@/config/github-assets.config';
import { PrimaryButton, SecondaryButton, WalletConnectButton } from '@/components/Button';
import { FancyCard } from '@/components/Card';
import {
  ArrowDownUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SettingsIcon,
  InfoIcon,
  ZapIcon,
} from 'lucide-react';
import Image from 'next/image';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { TokenSelectModal } from '@/ui/modals/TokenSelectModal';
import {
  AUTO_SWAP_EXECUTORS,
  BI_ZERO,
  CHAINS_INFORMATION,
  ETHER,
  REFETCH_INTERVALS,
  RouterType,
  V2_SWAP_EXECUTORS,
  V3_SWAP_EXECUTORS,
  WETH,
} from '@/constants';
import { useAtom } from 'jotai';
import { deadlineAtom, routerTypeAtom, slippageToleranceAtom } from '@/store';
import { useGHAssetsContext } from '@/contexts/github-assets';
import usePredictSwapMovement from '@/hooks/exchange/usePredictSwapMovement';
import { formatUnits, parseEther, parseUnits, zeroAddress } from 'viem';
import useMarketValueUSD from '@/hooks/exchange/useMarketValueUSD';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useWETHTx from '@/hooks/exchange/useWETHTx';
import useAutoSwap from '@/hooks/exchange/useAutoSwap';
import useV2Swap from '@/hooks/exchange/useV2Swap';
import useCLSwap from '@/hooks/exchange/useCLSwap';
import { TransactionSuccessModal } from '@/ui/modals/TransactionSuccessModal';
import { TransactionErrorModal } from '@/ui/modals/TransactionErrorModal';
import { Spinner } from '@/components/Spinner';
import { formatNumber } from '@/utils';
import useGetBalance from '@/hooks/wallet/useGetBalance';

// ─── Types ──────────────────────────────────────────────────────────────────

type Token = AssetResponseType[number];

// ─── Slippage options ────────────────────────────────────────────────────────

const SLIPPAGE_PRESETS = ['0.1', '0.5', '1'];
const DEFAULT_DEADLINE = '20'; // minutes

// ─── Settings Panel ──────────────────────────────────────────────────────────

interface SettingsPanelProps {
  slippage: string;
  customSlippage: string;
  deadline: string;
  routerType: (typeof RouterType)[keyof typeof RouterType];
  onSlippageSelect: (value: string) => void;
  onRouterTypeSelect: (value: (typeof RouterType)[keyof typeof RouterType]) => void;
  onCustomSlippageChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  slippage,
  customSlippage,
  deadline,
  onSlippageSelect,
  onCustomSlippageChange,
  onDeadlineChange,
  routerType,
  onRouterTypeSelect,
}) => {
  const isCustom = !SLIPPAGE_PRESETS.includes(slippage);

  return (
    <div className="bg-background/50 border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-4">
      {/* Slippage */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-muted text-xs font-semibold">Slippage Tolerance</span>
          <InfoIcon size={12} className="text-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SLIPPAGE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onSlippageSelect(preset)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 font-sans
                ${
                  slippage === preset && !isCustom
                    ? 'bg-accent text-accent-ink'
                    : 'bg-white/5 text-muted hover:bg-white/10 hover:text-foreground'
                }`}
            >
              {preset}%
            </button>
          ))}
          <div
            className={`flex items-center border px-2 py-1 gap-1 flex-1 min-w-20 rounded-lg
              ${isCustom ? 'border-accent' : 'border-white/10'}`}
          >
            <input
              type="number"
              min="0.01"
              max="50"
              step="0.1"
              placeholder="Custom"
              value={customSlippage}
              onChange={(e) => {
                onCustomSlippageChange(e.target.value);
                if (e.target.value) onSlippageSelect(e.target.value);
              }}
              className="bg-transparent text-foreground text-xs w-full outline-none placeholder:text-muted"
            />
            <span className="text-muted text-xs">%</span>
          </div>
        </div>
        {parseFloat(slippage) > 5 && (
          <span className="text-warning text-xs">
            ⚠ High slippage — your trade may be frontrun
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted text-xs font-semibold">Router</span>
        <div className="flex gap-2 w-full">
          {Object.keys(RouterType).map((router_type) => {
            const isSelected = routerType === RouterType[router_type as keyof typeof RouterType];

            return (
              <button
                key={router_type}
                onClick={() =>
                  onRouterTypeSelect(RouterType[router_type as keyof typeof RouterType])
                }
                className={`flex-1 py-2 px-1 border rounded-lg text-[10px] sm:text-xs font-sans font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-accent-2/10 text-accent-2 border-accent-2/50'
                    : 'bg-surface/50 border-white/10 text-muted hover:border-accent-2/30 hover:text-accent-2'
                }`}
              >
                {router_type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-2">
        <span className="text-muted text-xs font-semibold">Tx Deadline</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-white/10 px-2 py-1 gap-1 w-24 rounded-lg">
            <input
              type="number"
              min="1"
              max="180"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
              className="bg-transparent text-foreground text-xs w-full outline-none"
            />
          </div>
          <span className="text-muted text-xs">minutes</span>
        </div>
      </div>
    </div>
  );
};

// ─── Token Input Row ─────────────────────────────────────────────────────────

interface TokenInputRowProps {
  label: string;
  token: Token | null;
  amount: string;
  usdValue: string;
  balance: string;
  readOnly?: boolean;
  onAmountChange?: (value: string) => void;
  onMaxClick?: () => void;
  onTokenClick: () => void;
}

const TokenInputRow: React.FC<TokenInputRowProps> = ({
  label,
  token,
  amount,
  usdValue,
  balance,
  readOnly = false,
  onAmountChange,
  onMaxClick,
  onTokenClick,
}) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-background/55 px-4 py-4 w-full transition-colors duration-200 hover:border-accent/20 focus-within:border-accent/35">
    <div className="flex justify-between items-center">
      <span className="text-muted text-xs font-semibold">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-muted text-xs">Balance: {formatNumber(balance, 'en-US', 3)}</span>
        {!readOnly && onMaxClick && (
          <button
            onClick={onMaxClick}
            className="text-accent text-[11px] font-bold hover:text-foreground transition-colors px-1.5 py-0.5 rounded-lg bg-accent/10 hover:bg-accent/20"
          >
            Max
          </button>
        )}
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Token Selector */}
      <button
        onClick={onTokenClick}
        className={`flex items-center gap-2 px-3 py-2 border rounded-full shrink-0 transition-all duration-200
          ${
            token
              ? 'border-white/10 hover:border-accent/40 bg-raised hover:bg-accent/10'
              : 'border-accent bg-accent/10'
          }`}
      >
        {token ? (
          <>
            {token.logoURI ? (
              <Image
                src={token.logoURI}
                alt={token.symbol}
                width={20}
                height={20}
                className="rounded-full w-5 h-5"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-xs">{token.symbol.slice(0, 1)}</span>
              </div>
            )}
            <span className="text-foreground text-sm font-semibold">{token.symbol}</span>
          </>
        ) : (
          <span className="text-accent text-sm font-semibold">Select</span>
        )}
        <ChevronDownIcon size={14} className="text-muted" />
      </button>

      {/* Amount Input */}
      <input
        type="number"
        min="0"
        step="any"
        placeholder="0.00"
        value={amount}
        readOnly={readOnly}
        onChange={(e) => onAmountChange?.(e.target.value)}
        className={`bg-transparent text-right font-mono text-2xl font-medium text-foreground
          outline-none flex-1 min-w-0 placeholder:text-dim
          ${readOnly ? 'cursor-default' : ''}`}
      />
    </div>

    <div className="flex justify-end">
      <span className="text-muted text-xs">{usdValue ? `≈ $${usdValue}` : '—'}</span>
    </div>
  </div>
);

// ─── Price Info Row ───────────────────────────────────────────────────────────

interface PriceInfoRowProps {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  amountOut: string;
  slippage: string;
  route: string[];
  exchangeRate: string;
}

const PriceInfoRow: React.FC<PriceInfoRowProps> = ({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  slippage,
  route,
  exchangeRate,
}) => {
  const [expanded, setExpanded] = useState(false);

  const hasData = tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0;
  const { assetsDictionary } = useGHAssetsContext();

  if (!hasData) return null;

  const priceImpact = '< 0.01';
  const fee = (0.0099 * parseFloat(amountIn)).toFixed(3);
  const minAmountOut = parseFloat(amountOut) - (parseFloat(amountOut) * parseFloat(slippage)) / 100;

  return (
    <div className="w-full rounded-2xl border border-white/[0.06] bg-background/40 px-4 py-3 transition-colors hover:border-accent/20">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex justify-between items-center"
      >
        <div className="flex items-center gap-1.5">
          <ZapIcon size={12} className="text-accent-2" />
          <span className="text-muted text-xs">
            1 {tokenIn.symbol} ={' '}
            <span className="text-foreground font-semibold">{exchangeRate}</span> {tokenOut.symbol}
          </span>
        </div>
        {expanded ? (
          <ChevronUpIcon size={14} className="text-muted" />
        ) : (
          <ChevronDownIcon size={14} className="text-muted" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-muted text-xs">Price Impact</span>
            <span className="text-accent-2 text-xs font-semibold">{priceImpact}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted text-xs">Min. Received ({slippage}% slippage)</span>
            <span className="text-foreground text-xs font-semibold">
              {minAmountOut.toFixed(3)} {tokenOut.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted text-xs">Fee (1%)</span>
            <span className="text-foreground text-xs font-semibold">
              {fee} {tokenIn.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted text-xs">Route</span>
            <div className="text-muted text-xs font-semibold flex gap-1">
              {route.map((r, index) => {
                const token = assetsDictionary[r.toLowerCase()];
                return (
                  <Fragment key={index}>
                    {index > 0 && '->'}
                    <span>{token?.symbol || 'Unknown'}</span>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────

export const MainView: React.FC = () => {
  const { isConnected } = useAccount();

  // Token state
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState('');
  const [selectingFor, setSelectingFor] = useState<'in' | 'out' | null>(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useAtom(slippageToleranceAtom);
  const [customSlippage, setCustomSlippage] = useState('');
  const [deadline, setDeadline] = useAtom(deadlineAtom);
  const [routerType, setRouterType] = useAtom(routerTypeAtom);

  // Transaction state
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const chainId = useChainId();

  const amountInParsed = useMemo(
    () => parseUnits(amountIn || '0', tokenIn?.decimals || 18),
    [amountIn, tokenIn?.decimals],
  );

  const weth = useMemo(() => WETH[chainId], [chainId]);
  const isETHER_WETH = useMemo(
    () =>
      (tokenIn?.address.toLowerCase() === ETHER.toLowerCase() &&
        tokenOut?.address.toLowerCase() === weth.toLowerCase()) ||
      (tokenIn?.address.toLowerCase() === weth.toLowerCase() &&
        tokenOut?.address.toLowerCase() === ETHER.toLowerCase()),
    [tokenIn?.address, tokenOut?.address, weth],
  );

  const isWrap = useMemo(
    () => isETHER_WETH && tokenIn?.address.toLowerCase() === ETHER.toLowerCase(),
    [tokenIn?.address, isETHER_WETH],
  );

  // Predict swap movement
  const { data: swapMovement } = usePredictSwapMovement(
    tokenIn?.address || zeroAddress,
    tokenOut?.address || zeroAddress,
    amountInParsed,
    !isETHER_WETH,
    REFETCH_INTERVALS,
  );
  const tokenRoute = useMemo(() => {
    if (swapMovement.length === 1) return [swapMovement[0].tokenIn, swapMovement[0].tokenOut];
    return swapMovement
      .map((movement, index) =>
        index < swapMovement.length - 1
          ? [movement.tokenIn]
          : [movement.tokenIn, movement.tokenOut],
      )
      .flat();
  }, [swapMovement]);

  const amountOut = useMemo(() => {
    if (!amountIn || isNaN(parseFloat(amountIn))) return '0';
    if (isETHER_WETH) return amountIn;
    if (swapMovement.length) {
      const amountOutBI = swapMovement[swapMovement.length - 1].amountOut;
      return parseFloat(formatUnits(amountOutBI, tokenOut?.decimals || 18)).toFixed(3);
    }
    return '0';
  }, [amountIn, isETHER_WETH, swapMovement, tokenOut?.decimals]);

  const exchangeRate = useMemo(
    () => (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(3),
    [amountIn, amountOut],
  );

  // Market values
  const [amountInUSD] = useMarketValueUSD(tokenIn?.address, amountInParsed, REFETCH_INTERVALS);
  const [amountOutUSD] = useMarketValueUSD(
    tokenOut?.address,
    parseUnits(amountOut, tokenOut?.decimals || 18),
    REFETCH_INTERVALS,
  );

  const usdValueIn = useMemo(() => {
    return parseFloat(formatUnits(amountInUSD, 18)).toFixed(3);
  }, [amountInUSD]);

  const usdValueOut = useMemo(() => {
    return parseFloat(formatUnits(amountOutUSD, 18)).toFixed(3);
  }, [amountOutUSD]);

  const autoSwapper = useMemo(() => AUTO_SWAP_EXECUTORS[chainId], [chainId]);
  const v2Swapper = useMemo(() => V2_SWAP_EXECUTORS[chainId], [chainId]);
  const clSwapper = useMemo(() => V3_SWAP_EXECUTORS[chainId], [chainId]);

  // Allowances
  const autoSwapperAllowance = useGetAllowance(tokenIn?.address, autoSwapper, REFETCH_INTERVALS);
  const v2SwapperAllowance = useGetAllowance(tokenIn?.address, v2Swapper, REFETCH_INTERVALS);
  const clSwapperAllowance = useGetAllowance(tokenIn?.address, clSwapper, REFETCH_INTERVALS);

  // Approvals
  const autoSwapperApproval = useApproveSpend(tokenIn?.address || zeroAddress, autoSwapper);
  const v2SwapperApproval = useApproveSpend(tokenIn?.address || zeroAddress, v2Swapper);
  const clSwapperApproval = useApproveSpend(tokenIn?.address || zeroAddress, clSwapper);

  const { useDeposit, useWithdrawal } = useWETHTx();
  const depositETH = useDeposit(
    parseEther(amountIn),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );
  const unwrapETH = useWithdrawal(
    parseEther(amountIn),
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const requiresApproval = useMemo(() => {
    if (isETHER_WETH) return false;
    switch (routerType) {
      case RouterType.AUTO:
        return autoSwapperAllowance < amountInParsed;
      case RouterType.V2:
        return v2SwapperAllowance < amountInParsed;
      case RouterType.V3:
        return clSwapperAllowance < amountInParsed;
      default:
        return false;
    }
  }, [
    isETHER_WETH,
    routerType,
    autoSwapperAllowance,
    amountInParsed,
    v2SwapperAllowance,
    clSwapperAllowance,
  ]);

  // Handlers
  const handleSwapDirection = useCallback(() => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
  }, [tokenIn, tokenOut, amountOut]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      if (selectingFor === 'in') setTokenIn(token);
      else if (selectingFor === 'out') setTokenOut(token);
      setSelectingFor(null);
    },
    [selectingFor],
  );

  // Swap executions
  const autoSwap = useAutoSwap(
    tokenIn?.address || zeroAddress,
    tokenOut?.address || zeroAddress,
    parseUnits(amountIn, tokenIn?.decimals || 18),
    swapMovement[swapMovement.length - 1]?.amountOut || BI_ZERO,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );
  const v2Swap = useV2Swap(
    tokenIn?.address || zeroAddress,
    tokenOut?.address || zeroAddress,
    parseUnits(amountIn, tokenIn?.decimals ?? 18),
    swapMovement[swapMovement.length - 1]?.amountOut || BI_ZERO,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );
  const clSwap = useCLSwap(
    tokenIn?.address || zeroAddress,
    tokenOut?.address || zeroAddress,
    parseUnits(amountIn, tokenIn?.decimals ?? 18),
    swapMovement[swapMovement.length - 1]?.amountOut || BI_ZERO,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateProcess = useCallback(() => {
    if (isETHER_WETH) {
      if (isWrap) depositETH.execute();
      else unwrapETH.execute();

      return;
    }

    switch (routerType) {
      case RouterType.AUTO: {
        if (requiresApproval) autoSwapperApproval.execute();
        else autoSwap.execute();
        break;
      }
      case RouterType.V2: {
        if (requiresApproval) v2SwapperApproval.execute();
        else v2Swap.execute();
        break;
      }
      case RouterType.V3: {
        if (requiresApproval) clSwapperApproval.execute();
        else clSwap.execute();
        break;
      }
    }
  }, [
    isETHER_WETH,
    routerType,
    isWrap,
    depositETH,
    unwrapETH,
    requiresApproval,
    autoSwapperApproval,
    autoSwap,
    v2SwapperApproval,
    v2Swap,
    clSwapperApproval,
    clSwap,
  ]);

  // Balances
  const balanceA = useGetBalance(tokenIn?.address || zeroAddress);
  const balanceB = useGetBalance(tokenOut?.address || zeroAddress);
  const balanceAParsed = useMemo(
    () => formatUnits(balanceA, tokenIn?.decimals || 18),
    [balanceA, tokenIn?.decimals],
  );
  const balanceBParsed = useMemo(
    () => formatUnits(balanceB, tokenOut?.decimals || 18),
    [balanceB, tokenOut?.decimals],
  );

  // Button state
  const { label: actionLabel, disabled: actionDisabled } = useMemo(() => {
    if (!tokenIn || !tokenOut) return { label: 'Select Tokens', disabled: true };
    if (!amountIn || parseFloat(amountIn) <= 0) return { label: 'Enter an Amount', disabled: true };
    if (balanceA < amountInParsed) return { label: 'Insufficient Balance', disabled: true };
    if (isETHER_WETH) {
      if (isWrap) return { label: 'Wrap ' + tokenIn.symbol, disabled: false };
      else return { label: 'Unwrap ' + tokenIn.symbol, disabled: false };
    }
    if (requiresApproval) return { label: `Approve ${tokenIn.symbol}`, disabled: false };
    return { label: 'Swap', disabled: false };
  }, [
    tokenIn,
    tokenOut,
    amountIn,
    balanceA,
    amountInParsed,
    isETHER_WETH,
    requiresApproval,
    isWrap,
  ]);

  return (
    <>
      {/* Token Select Modal */}
      <TokenSelectModal
        open={selectingFor !== null}
        onOpenChange={(open) => {
          if (!open) setSelectingFor(null);
        }}
        selectedToken={selectingFor === 'in' ? tokenIn : tokenOut}
        disabledToken={selectingFor === 'in' ? tokenOut : tokenIn}
        onTokenSelect={handleTokenSelect}
      />

      <div className="w-full flex flex-col justify-start items-center gap-6">
        {/* Swap Widget */}
        <div className="w-full max-w-lg">
          <FancyCard>
            <div className="flex flex-col gap-4 w-full">
              {/* Card Header */}
              <div className="flex justify-between items-center pb-1">
                <h4 className="text-foreground font-semibold text-base tracking-tight">Swap</h4>
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className={`transition-colors p-1.5 rounded-xl ${
                    showSettings
                      ? 'text-accent bg-accent/10'
                      : 'text-muted hover:text-foreground hover:bg-white/5'
                  }`}
                  title="Settings"
                >
                  <SettingsIcon size={16} />
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <SettingsPanel
                  slippage={slippage.toString()}
                  customSlippage={customSlippage}
                  deadline={deadline?.toString() || DEFAULT_DEADLINE}
                  onSlippageSelect={(s) => setSlippage(parseFloat(s))}
                  onCustomSlippageChange={setCustomSlippage}
                  onDeadlineChange={(d) => setDeadline(parseInt(d))}
                  routerType={routerType}
                  onRouterTypeSelect={setRouterType}
                />
              )}

              {/* Token In */}
              <TokenInputRow
                label="Sell"
                token={tokenIn}
                amount={amountIn}
                usdValue={usdValueIn}
                balance={balanceAParsed}
                onAmountChange={setAmountIn}
                onMaxClick={() => setAmountIn(balanceAParsed)}
                onTokenClick={() => setSelectingFor('in')}
              />

              {/* Swap Direction Toggle */}
              <div className="flex justify-center items-center -my-1">
                <button
                  onClick={handleSwapDirection}
                  title="Flip tokens"
                  className="group z-10 bg-surface border border-white/10 p-2.5 rounded-xl hover:border-accent/40 hover:bg-accent/10 transition-all duration-200 shadow-sm"
                >
                  <ArrowDownUpIcon
                    size={16}
                    className="text-muted group-hover:text-accent transition-colors"
                  />
                </button>
              </div>

              {/* Token Out */}
              <TokenInputRow
                label="Buy"
                token={tokenOut}
                amount={amountOut}
                usdValue={usdValueOut}
                balance={balanceBParsed}
                readOnly
                onTokenClick={() => setSelectingFor('out')}
              />

              {/* Price Info */}
              <PriceInfoRow
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                amountIn={amountIn}
                amountOut={amountOut}
                route={tokenRoute}
                slippage={slippage.toString()}
                exchangeRate={exchangeRate}
              />

              {/* Action Button */}
              <div className="pt-1">
                {isConnected ? (
                  <PrimaryButton
                    className="w-full"
                    size="lg"
                    disabled={
                      actionDisabled ||
                      autoSwap.isLoading ||
                      v2Swap.isLoading ||
                      clSwap.isLoading ||
                      autoSwapperApproval.isLoading ||
                      v2SwapperApproval.isLoading ||
                      clSwapperApproval.isLoading ||
                      depositETH.isLoading ||
                      unwrapETH.isLoading
                    }
                    onClick={initiateProcess}
                  >
                    {actionLabel}{' '}
                    {(autoSwap.isLoading ||
                      v2Swap.isLoading ||
                      clSwap.isLoading ||
                      autoSwapperApproval.isLoading ||
                      v2SwapperApproval.isLoading ||
                      clSwapperApproval.isLoading ||
                      depositETH.isLoading ||
                      unwrapETH.isLoading) && <Spinner size="sm" className="ml-2" />}
                  </PrimaryButton>
                ) : (
                  <WalletConnectButton className="w-full" size="lg" hasIcon />
                )}
              </div>
            </div>
          </FancyCard>
        </div>

        {/* Info Strip */}
        <div className="w-full max-w-lg flex flex-wrap justify-between items-center px-1 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse block" />
            <span className="text-muted text-xs">
              Slippage: <span className="text-foreground">{slippage}%</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted text-xs">
              Deadline: <span className="text-foreground">{deadline}m</span>
            </span>
            <SecondaryButton
              className="text-xs px-2 py-1"
              onClick={() => setShowSettings((v) => !v)}
            >
              {showSettings ? 'Hide Settings' : 'Settings'}
            </SecondaryButton>
          </div>
        </div>
      </div>
      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          v2SwapperApproval.reset();
          clSwapperApproval.reset();
          autoSwapperApproval.reset();
          v2Swap.reset();
          clSwap.reset();
          autoSwap.reset();
          depositETH.reset();
          unwrapETH.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={
          isETHER_WETH
            ? (isWrap ? 'Successfully wrapped ' : 'Successfully unwrapped') + tokenIn?.symbol
            : `Successfully swapped ${amountIn} ${tokenIn?.symbol}`
        }
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          v2SwapperApproval.reset();
          clSwapperApproval.reset();
          autoSwapperApproval.reset();
          v2Swap.reset();
          clSwap.reset();
          autoSwap.reset();
          depositETH.reset();
          unwrapETH.reset();
        }}
        message={'An error occurred while swapping tokens. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
