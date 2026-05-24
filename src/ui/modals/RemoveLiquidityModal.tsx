import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { AssetResponseType } from '@/config/github-assets.config';
import Image from 'next/image';
import React, { useState } from 'react';

export interface RemoveLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolName?: string;
  token0?: AssetResponseType[number];
  token1?: AssetResponseType[number];
  // Mock data for display purposes
  mockToken0Amount?: number;
  mockToken1Amount?: number;
}

export const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  open,
  onOpenChange,
  poolName = 'Unknown Pool',
  token0,
  token1,
  mockToken0Amount = 1500,
  mockToken1Amount = 3.2,
}) => {
  const [percentage, setPercentage] = useState<number>(0);

  const handlePercentageClick = (value: number) => {
    setPercentage(value);
  };

  const receiveToken0 = (mockToken0Amount * percentage) / 100;
  const receiveToken1 = (mockToken1Amount * percentage) / 100;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Remove Liquidity">
      <div className="flex flex-col p-5 gap-6">
        <div className="flex justify-between items-center w-full">
          <span className="text-[#94a3b8] font-semibold text-sm">Pool</span>
          <span className="text-white font-bold text-sm tracking-wide">{poolName}</span>
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
            <div className="flex justify-between items-center bg-black border border-white/10 p-3">
              <div className="flex items-center gap-2">
                {token0?.logoURI ? (
                  <Image
                    src={token0.logoURI}
                    alt={token0.symbol}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 bg-white/10"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-[10px] font-bold">T0</span>
                  </div>
                )}
                <span className="text-white font-bold text-sm">{token0?.symbol || 'Token 0'}</span>
              </div>
              <span className="text-white font-mono text-sm">
                {receiveToken0.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </span>
            </div>

            <div className="flex justify-between items-center bg-black border border-white/10 p-3">
              <div className="flex items-center gap-2">
                {token1?.logoURI ? (
                  <Image
                    src={token1.logoURI}
                    alt={token1.symbol}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 bg-white/10"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 text-[10px] font-bold">T1</span>
                  </div>
                )}
                <span className="text-white font-bold text-sm">{token1?.symbol || 'Token 1'}</span>
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
          onClick={() => {
            // Placeholder logic for execution
            onOpenChange(false);
          }}
        >
          {percentage === 0 ? 'Enter Amount' : 'Remove Liquidity'}
        </PrimaryButton>
      </div>
    </Modal>
  );
};
