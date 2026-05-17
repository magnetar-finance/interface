"use client";

import { PrimaryButton } from "@/components/Button";
import { AssetResponseType } from "@/config/github-assets.config";
import { TokenSelectModal } from "@/ui/modals/TokenSelectModal";
import { PlusIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { RangeDistributionChart } from "@/ui/charts/RangeDistributionChart";
import { useAccount } from "wagmi";
import { TokenInputRow } from "./components/TokenInputRow";

// Simulated distribution data for the Recharts graph
const DATA_LENGTH = 40;
// Price domain the chart x-axis maps to (arbitrary mock range: 0.8 → 1.2)
const PRICE_MIN = 0.8;
const PRICE_MAX = 1.2;

const MOCK_DISTRIBUTION_DATA = Array.from({ length: DATA_LENGTH }).map((_, i) => ({
  index: i,
  value: Math.exp(-Math.pow(i - 20, 2) / 50) * 100 + Math.random() * 10,
}));

/** Convert a bar index (0 … DATA_LENGTH-1) to a price string rounded to 4 dp */
function indexToPrice(index: number): string {
  const price = PRICE_MIN + (index / (DATA_LENGTH - 1)) * (PRICE_MAX - PRICE_MIN);
  return price.toFixed(4);
}

export const ConcentratedDepositView: React.FC<{
  initialTokenA: AssetResponseType[number] | null;
  initialTokenB: AssetResponseType[number] | null;
}> = ({ initialTokenA, initialTokenB }) => {
  const { isConnected } = useAccount();

  const [tokenA, setTokenA] = useState<AssetResponseType[number] | null>(initialTokenA);
  const [tokenB, setTokenB] = useState<AssetResponseType[number] | null>(initialTokenB);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const [minPrice, setMinPrice] = useState("0.95");
  const [maxPrice, setMaxPrice] = useState("1.05");

  const [modalType, setModalType] = useState<"A" | "B" | null>(null);

  const handleTokenSelect = useCallback(
    (token: AssetResponseType[number]) => {
      if (modalType === "A") {
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
    if (!amountA && !amountB) return true;
    if (parseFloat(amountA || "0") <= 0 && parseFloat(amountB || "0") <= 0) return true;
    if (!minPrice || !maxPrice || parseFloat(minPrice) >= parseFloat(maxPrice)) return true;
    return false;
  }, [tokenA, tokenB, amountA, amountB, minPrice, maxPrice]);

  const buttonText = useMemo(() => {
    if (!isConnected) return "Connect Wallet";
    if (!tokenA || !tokenB) return "Select tokens";
    if (!amountA && !amountB) return "Enter an amount";
    if (!minPrice || !maxPrice || parseFloat(minPrice) >= parseFloat(maxPrice))
      return "Invalid Price Range";
    return "Supply Concentrated Liquidity";
  }, [isConnected, tokenA, tokenB, amountA, amountB, minPrice, maxPrice]);

  // Derive active bounds for the chart highlighting (MOCK calculation)
  const chartMinIndex = useMemo(
    () =>
      Math.max(
        0,
        Math.min(
          DATA_LENGTH - 1,
          Math.round(
            ((parseFloat(minPrice || String(PRICE_MIN)) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) *
              (DATA_LENGTH - 1),
          ),
        ),
      ),
    [minPrice],
  );
  const chartMaxIndex = useMemo(
    () =>
      Math.max(
        0,
        Math.min(
          DATA_LENGTH - 1,
          Math.round(
            ((parseFloat(maxPrice || String(PRICE_MAX)) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) *
              (DATA_LENGTH - 1),
          ),
        ),
      ),
    [maxPrice],
  );

  const handleMinIndexChange = useCallback((index: number) => setMinPrice(indexToPrice(index)), []);
  const handleMaxIndexChange = useCallback((index: number) => setMaxPrice(indexToPrice(index)), []);

  return (
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Visualizer Region */}
      <div className="w-full bg-[#050508] border border-white/5 p-4 relative group">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#64748b] text-xs font-bold tracking-widest uppercase">
            Set Price Range
          </span>
          {tokenA && tokenB && (
            <span className="text-xs font-mono text-[#00ff9d]">
              Current: 1 {tokenA.symbol} = 1.00 {tokenB.symbol}
            </span>
          )}
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-32 mb-4 border-b border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
          <RangeDistributionChart
            data={MOCK_DISTRIBUTION_DATA}
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
                type="text"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-transparent text-white font-mono text-xl w-full outline-none"
              />
            </div>
            <span className="text-[#64748b] text-[10px] font-mono mt-1 block">
              {tokenB?.symbol || "B"} per {tokenA?.symbol || "A"}
            </span>
          </div>

          <div className="flex-1 bg-black border border-white/10 p-3 focus-within:border-[#2962ff]/80 transition-colors">
            <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest block mb-1">
              Max Price
            </span>
            <div className="flex items-center">
              <input
                type="text"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-transparent text-white font-mono text-xl w-full outline-none"
              />
            </div>
            <span className="text-[#64748b] text-[10px] font-mono mt-1 block">
              {tokenB?.symbol || "B"} per {tokenA?.symbol || "A"}
            </span>
          </div>
        </div>

        {/* Quick Range Actions */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 mt-4">
          <button
            onClick={() => {
              setMinPrice("0.90");
              setMaxPrice("1.10");
            }}
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
          >
            10%
          </button>
          <button
            onClick={() => {
              setMinPrice("0.80");
              setMaxPrice("1.20");
            }}
            className="flex-1 py-1 px-2 border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50 hover:text-[#2962ff] text-xs font-mono font-bold transition-colors bg-black"
          >
            20%
          </button>
          <button
            onClick={() => {
              setMinPrice("0.00");
              setMaxPrice("Infinity");
            }}
            className="flex-[2] py-1 px-2 border border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10 text-xs font-mono font-bold transition-colors bg-[#00ff9d]/5"
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
          onSelectClick={() => setModalType("A")}
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
          onSelectClick={() => setModalType("B")}
        />
      </div>

      {/* Action Button */}
      <div className="w-full">
        <PrimaryButton
          disabled={isSupplyDisabled && isConnected}
          className="w-full py-4 text-base tracking-widest font-bold"
        >
          {buttonText}
        </PrimaryButton>
      </div>

      {/* Select Token Modal */}
      <TokenSelectModal
        open={modalType !== null}
        onOpenChange={(v) => !v && setModalType(null)}
        selectedToken={null}
        disabledToken={modalType === "A" ? tokenB : tokenA}
        onTokenSelect={handleTokenSelect}
      />
    </div>
  );
};
