"use client";

import { AssetResponseType } from "@/config/github-assets.config";
import { PrimaryButton, SecondaryButton, WalletConnectButton } from "@/components/Button";
import { FancyCard } from "@/components/Card";
import {
  ArrowDownUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SettingsIcon,
  InfoIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { useConnection } from "wagmi";
import { TokenSelectModal } from "@/ui/modals/TokenSelectModal";

// ─── Types ──────────────────────────────────────────────────────────────────

type Token = AssetResponseType[number];

// ─── Slippage options ────────────────────────────────────────────────────────

const SLIPPAGE_PRESETS = ["0.1", "0.5", "1.0"];
const DEFAULT_DEADLINE = "20"; // minutes

// ─── Settings Panel ──────────────────────────────────────────────────────────

interface SettingsPanelProps {
  slippage: string;
  customSlippage: string;
  deadline: string;
  onSlippageSelect: (value: string) => void;
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
}) => {
  const isCustom = !SLIPPAGE_PRESETS.includes(slippage);

  return (
    <div className="bg-black border border-white/10 p-4 flex flex-col gap-4">
      {/* Slippage */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[#94a3b8] text-xs uppercase tracking-widest">
            Slippage Tolerance
          </span>
          <InfoIcon size={12} color="#64748b" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SLIPPAGE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onSlippageSelect(preset)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors
                ${
                  slippage === preset && !isCustom
                    ? "bg-[#2962ff] text-white"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
            >
              {preset}%
            </button>
          ))}
          <div
            className={`flex items-center border px-2 py-1 gap-1 flex-1 min-w-[80px]
              ${isCustom ? "border-[#2962ff]" : "border-white/10"}`}
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
              className="bg-transparent text-white text-xs w-full outline-none placeholder:text-[#64748b]"
            />
            <span className="text-[#64748b] text-xs">%</span>
          </div>
        </div>
        {parseFloat(slippage) > 5 && (
          <span className="text-[#ffaf52] text-xs">
            ⚠ High slippage — your trade may be frontrun
          </span>
        )}
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-2">
        <span className="text-[#94a3b8] text-xs uppercase tracking-widest">Tx Deadline</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-white/10 px-2 py-1 gap-1 w-24">
            <input
              type="number"
              min="1"
              max="180"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
              className="bg-transparent text-white text-xs w-full outline-none"
            />
          </div>
          <span className="text-[#64748b] text-xs">minutes</span>
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
  <div className="flex flex-col gap-2 bg-black/60 border border-white/10 px-4 py-4 w-full">
    <div className="flex justify-between items-center">
      <span className="text-[#64748b] text-xs uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[#64748b] text-xs">Balance: {balance}</span>
        {!readOnly && onMaxClick && (
          <button
            onClick={onMaxClick}
            className="text-[#2962ff] text-xs font-semibold hover:text-white transition-colors"
          >
            MAX
          </button>
        )}
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Token Selector */}
      <button
        onClick={onTokenClick}
        className={`flex items-center gap-2 px-3 py-2 border shrink-0 transition-colors
          ${
            token
              ? "border-white/10 hover:border-[#2962ff] bg-white/5"
              : "border-[#2962ff] bg-[#2962ff]/10 animate-pulse"
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
              <div className="w-5 h-5 rounded-full bg-[#2962ff]/20 flex items-center justify-center">
                <span className="text-[#2962ff] text-xs">{token.symbol.slice(0, 1)}</span>
              </div>
            )}
            <span className="text-white text-sm font-semibold">{token.symbol}</span>
          </>
        ) : (
          <span className="text-[#2962ff] text-sm font-semibold">Select</span>
        )}
        <ChevronDownIcon size={14} color="#64748b" />
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
        className={`bg-transparent text-right text-2xl md:text-3xl font-bold text-white
          outline-none flex-1 min-w-0 placeholder:text-[#374151]
          ${readOnly ? "cursor-default" : ""}`}
      />
    </div>

    <div className="flex justify-end">
      <span className="text-[#64748b] text-xs">{usdValue ? `≈ $${usdValue}` : "—"}</span>
    </div>
  </div>
);

// ─── Price Info Row ───────────────────────────────────────────────────────────

interface PriceInfoRowProps {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  slippage: string;
}

const PriceInfoRow: React.FC<PriceInfoRowProps> = ({ tokenIn, tokenOut, amountIn, slippage }) => {
  const [expanded, setExpanded] = useState(false);

  const hasData = tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0;

  if (!hasData) return null;

  const exchangeRate = "1.00"; // stub
  const priceImpact = "< 0.01";
  const minReceived = (parseFloat(amountIn) * (1 - parseFloat(slippage) / 100)).toFixed(6);
  const fee = "0.05";

  return (
    <div className="w-full bg-black/40 border border-white/10 px-4 py-3">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex justify-between items-center"
      >
        <div className="flex items-center gap-1.5">
          <ZapIcon size={12} color="#00ff9d" />
          <span className="text-[#94a3b8] text-xs">
            1 {tokenIn.symbol} = <span className="text-white font-semibold">{exchangeRate}</span>{" "}
            {tokenOut.symbol}
          </span>
        </div>
        {expanded ? (
          <ChevronUpIcon size={14} color="#64748b" />
        ) : (
          <ChevronDownIcon size={14} color="#64748b" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] text-xs">Price Impact</span>
            <span className="text-[#00ff9d] text-xs font-semibold">{priceImpact}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] text-xs">Min. Received ({slippage}% slippage)</span>
            <span className="text-white text-xs font-semibold">
              {minReceived} {tokenOut.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] text-xs">Fee (0.05%)</span>
            <span className="text-white text-xs font-semibold">
              {fee} {tokenIn.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] text-xs">Route</span>
            <span className="text-[#94a3b8] text-xs font-semibold">
              {tokenIn.symbol} → {tokenOut.symbol}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────

export const MainView: React.FC = () => {
  const { isConnected } = useConnection();

  // Token state
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [selectingFor, setSelectingFor] = useState<"in" | "out" | null>(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");
  const [deadline, setDeadline] = useState(DEFAULT_DEADLINE);

  // Derived state
  const amountOut = useMemo(() => {
    // Stub: 1:1 ratio for now, real implementation will call router
    if (!amountIn || isNaN(parseFloat(amountIn))) return "";
    return (parseFloat(amountIn) * 1.0).toFixed(6);
  }, [amountIn]);

  const usdValueIn = useMemo(() => {
    if (!amountIn || isNaN(parseFloat(amountIn))) return "";
    return (parseFloat(amountIn) * 1.5).toFixed(2); // stub price
  }, [amountIn]);

  const usdValueOut = useMemo(() => {
    if (!amountOut || isNaN(parseFloat(amountOut))) return "";
    return (parseFloat(amountOut) * 1.5).toFixed(2);
  }, [amountOut]);

  // Handlers
  const handleSwapDirection = useCallback(() => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
  }, [tokenIn, tokenOut, amountOut]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      if (selectingFor === "in") setTokenIn(token);
      else if (selectingFor === "out") setTokenOut(token);
      setSelectingFor(null);
    },
    [selectingFor],
  );

  const handleSwap = useCallback(() => {
    // Stub: wire up wagmi write hook here
    console.log("Swap!", { tokenIn, tokenOut, amountIn, slippage, deadline });
  }, [tokenIn, tokenOut, amountIn, slippage, deadline]);

  // Button state
  const { label: actionLabel, disabled: actionDisabled } = useMemo(() => {
    if (!tokenIn || !tokenOut) return { label: "Select Tokens", disabled: true };
    if (!amountIn || parseFloat(amountIn) <= 0) return { label: "Enter an Amount", disabled: true };
    return { label: "Swap", disabled: false };
  }, [tokenIn, tokenOut, amountIn]);

  return (
    <>
      {/* Token Select Modal */}
      <TokenSelectModal
        open={selectingFor !== null}
        onOpenChange={(open) => {
          if (!open) setSelectingFor(null);
        }}
        selectedToken={selectingFor === "in" ? tokenIn : tokenOut}
        disabledToken={selectingFor === "in" ? tokenOut : tokenIn}
        onTokenSelect={handleTokenSelect}
      />

      <div className="w-full flex flex-col justify-start items-center gap-6">
        {/* Swap Widget */}
        <div className="w-full max-w-lg">
          <FancyCard>
            <div className="flex flex-col gap-4 w-full">
              {/* Card Header */}
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <h4 className="text-white font-semibold text-base tracking-wide">Swap Tokens</h4>
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className={`transition-colors p-1 ${
                    showSettings ? "text-[#2962ff]" : "text-[#64748b] hover:text-white"
                  }`}
                  title="Settings"
                >
                  <SettingsIcon size={16} />
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <SettingsPanel
                  slippage={slippage}
                  customSlippage={customSlippage}
                  deadline={deadline}
                  onSlippageSelect={setSlippage}
                  onCustomSlippageChange={setCustomSlippage}
                  onDeadlineChange={setDeadline}
                />
              )}

              {/* Token In */}
              <TokenInputRow
                label="You Pay"
                token={tokenIn}
                amount={amountIn}
                usdValue={usdValueIn}
                balance="0.00"
                onAmountChange={setAmountIn}
                onMaxClick={() => setAmountIn("0")} // stub: replace with real balance
                onTokenClick={() => setSelectingFor("in")}
              />

              {/* Swap Direction Toggle */}
              <div className="flex justify-center items-center -my-1">
                <button
                  onClick={handleSwapDirection}
                  title="Flip tokens"
                  className="group bg-black border border-white/10 p-2 hover:border-[#2962ff] hover:bg-[#2962ff]/10 transition-all"
                >
                  <ArrowDownUpIcon
                    size={16}
                    className="text-[#64748b] group-hover:text-[#2962ff] transition-colors"
                  />
                </button>
              </div>

              {/* Token Out */}
              <TokenInputRow
                label="You Receive"
                token={tokenOut}
                amount={amountOut}
                usdValue={usdValueOut}
                balance="0.00"
                readOnly
                onTokenClick={() => setSelectingFor("out")}
              />

              {/* Price Info */}
              <PriceInfoRow
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                amountIn={amountIn}
                slippage={slippage}
              />

              {/* Action Button */}
              <div className="pt-1">
                {isConnected ? (
                  <PrimaryButton
                    className="w-full py-4 text-sm"
                    disabled={actionDisabled}
                    onClick={handleSwap}
                  >
                    {actionLabel}
                  </PrimaryButton>
                ) : (
                  <WalletConnectButton className="w-full py-4 text-sm" hasIcon />
                )}
              </div>
            </div>
          </FancyCard>
        </div>

        {/* Info Strip */}
        <div className="w-full max-w-lg flex flex-wrap justify-between items-center px-1 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00ff9d] animate-pulse block" />
            <span className="text-[#64748b] text-xs">
              Slippage: <span className="text-white">{slippage}%</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#64748b] text-xs">
              Deadline: <span className="text-white">{deadline}m</span>
            </span>
            <SecondaryButton
              className="text-xs px-2 py-1"
              onClick={() => setShowSettings((v) => !v)}
            >
              {showSettings ? "Hide Settings" : "Settings"}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </>
  );
};
