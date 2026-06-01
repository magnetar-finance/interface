'use client';

import { AssetResponseType } from '@/config/github-assets.config';
import { formatNumber } from '@/utils';
import Image from 'next/image';
import React from 'react';

export interface TokenInputRowProps {
  label: string;
  token: AssetResponseType[number] | null;
  amount: string;
  onAmountChange: (val: string) => void;
  onSelectClick: () => void;
  balance?: string;
  usdValue?: string;
}

export const TokenInputRow: React.FC<TokenInputRowProps> = ({
  label,
  token,
  amount,
  onAmountChange,
  onSelectClick,
  balance = '0.00',
  usdValue = '0.00',
}) => {
  return (
    <div className="w-full flex flex-col bg-black border border-white/5 p-4 transition-all duration-300 group hover:border-[#2962ff]/30 focus-within:border-[#2962ff] focus-within:shadow-[0_0_15px_rgba(41,98,255,0.2)]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[#64748b] text-xs font-bold tracking-widest uppercase">{label}</span>
        <div className="text-xs text-[#64748b] flex gap-2">
          <span>Balance: {formatNumber(balance, 'en-US', 3)}</span>
          <button
            onClick={() => onAmountChange(balance)}
            className="text-[#2962ff] font-bold hover:text-[#00ff9d] transition-colors uppercase cursor-pointer"
          >
            Max
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        {/* Token Selector */}
        <button
          onClick={onSelectClick}
          className="flex items-center gap-2 bg-[#050508] border border-white/10 hover:bg-[#2962ff]/10 hover:border-[#2962ff]/50 px-3 py-2 transition-all min-w-30"
        >
          {token ? (
            <>
              {token.logoURI ? (
                <Image
                  src={token.logoURI}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className="rounded-full w-6 h-6 bg-white/10"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#2962ff]/20 flex items-center justify-center">
                  <span className="text-[#2962ff] text-[10px] font-bold">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              <span className="text-white font-semibold text-lg">{token.symbol}</span>
            </>
          ) : (
            <span className="text-[#2962ff] font-semibold text-lg w-full text-center">Select</span>
          )}
          <span className="text-[#64748b] ml-auto text-xs">▼</span>
        </button>

        {/* Amount Input */}
        <div className="flex flex-col items-end flex-1 w-full overflow-hidden">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) onAmountChange(val);
            }}
            placeholder="0.0"
            className="w-full bg-transparent text-right text-3xl md:text-4xl text-[#00ff9d] font-mono outline-none placeholder:text-[#64748b]/50 border-none ring-0 focus:outline-none"
          />
          <span className="text-[#64748b] text-xs font-mono mt-1">${amount ? usdValue : ''}</span>
        </div>
      </div>
    </div>
  );
};
