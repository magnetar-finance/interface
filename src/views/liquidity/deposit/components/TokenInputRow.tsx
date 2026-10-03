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
    <div className="group w-full flex flex-col rounded-2xl border border-white/[0.06] bg-background/55 p-4 transition-colors duration-200 focus-within:border-accent/35 hover:border-accent/20">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{label}</span>
        <div className="flex gap-2 text-xs text-muted">
          <span>Balance: {formatNumber(balance, 'en-US', 3)}</span>
          <button
            onClick={() => onAmountChange(balance)}
            className="cursor-pointer rounded-lg bg-accent/10 px-1.5 font-bold text-accent transition-colors hover:bg-accent/20 hover:text-foreground"
          >
            Max
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onSelectClick}
          className="flex min-w-30 items-center gap-2 rounded-full border border-white/10 bg-raised px-3 py-2 transition-all duration-200 hover:border-accent/40 hover:bg-accent/10"
        >
          {token ? (
            <>
              {token.logoURI ? (
                <Image
                  src={token.logoURI}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full bg-white/10"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                  <span className="text-[10px] font-bold text-accent">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              <span className="text-lg font-semibold text-foreground">{token.symbol}</span>
            </>
          ) : (
            <span className="w-full text-center text-lg font-semibold text-accent">Select</span>
          )}
          <span className="ml-auto text-xs text-muted">▼</span>
        </button>

        <div className="flex w-full flex-1 flex-col items-end overflow-hidden">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) onAmountChange(val);
            }}
            placeholder="0.0"
            className="w-full border-none bg-transparent text-right font-mono text-2xl text-foreground outline-none ring-0 placeholder:text-dim focus:outline-none"
          />
          <span className="mt-1 font-mono text-xs text-muted">${amount ? usdValue : ''}</span>
        </div>
      </div>
    </div>
  );
};
