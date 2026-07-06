'use client';

import { AssetResponseType } from '@/config/github-assets.config';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { SearchIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import React, { useMemo, useState } from 'react';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import { REFETCH_INTERVALS } from '@/constants';
import { formatNumber } from '@/utils';
import { formatUnits } from 'viem';

interface TokenSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: AssetResponseType[number] | null;
  disabledToken?: AssetResponseType[number] | null;
  onTokenSelect: (token: AssetResponseType[number]) => void;
}

const TokenView: React.FC<{
  token: AssetResponseType[number];
  isSelected?: boolean;
  isDisabled?: boolean;
  onSingleTokenClick: (token: AssetResponseType[number]) => void;
}> = ({ token, isDisabled, isSelected, onSingleTokenClick }) => {
  const balance = useGetBalance(token.address, REFETCH_INTERVALS);

  return (
    <button
      disabled={isDisabled}
      onClick={() => onSingleTokenClick(token)}
      className={`
        w-full flex justify-between items-center px-5 py-3.5
        transition-all duration-200 rounded-xl mx-1
        ${isSelected ? 'opacity-50' : 'hover:bg-[#2962ff]/5 hover:border hover:border-[#2962ff]/10'}
        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          <Image
            src={token.logoURI}
            alt={token.symbol}
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{token.symbol.slice(0, 2)}</span>
          </div>
        )}
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-bold text-base font-sans">{token.symbol}</span>
          <span className="text-white/40 text-xs font-mono">{token.name}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-white text-sm font-medium">
          {formatNumber(formatUnits(balance, token.decimals), 'en-US', 4)}
        </span>
      </div>
    </button>
  );
};

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  open,
  onOpenChange,
  selectedToken,
  disabledToken,
  onTokenSelect,
}) => {
  const { assets, isLoading } = useGHAssetsContext();
  const [search, setSearch] = useState('');

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase().trim();
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().startsWith(q) ||
        a.name.toLowerCase().startsWith(q) ||
        a.address.toLowerCase() === q,
    );
  }, [assets, search]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Select a token" className="h-[500px]">
      <div className="px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 bg-[#131525]/60 rounded-xl px-4 py-3 border border-white/5 focus-within:border-[#2962ff]/30 focus-within:bg-[#2962ff]/5 transition-all duration-200">
          <SearchIcon size={18} className="text-[#2962ff]/60 shrink-0" />
          <input
            className="bg-transparent text-white text-base flex-1 outline-none placeholder:text-white/30 font-medium"
            placeholder="Search name or paste address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-white/40 hover:text-white rounded-md p-0.5 hover:bg-white/10 transition-all"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/[0.06] shrink-0" />

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <Spinner size="md" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 gap-2">
            <span className="text-white/50 text-sm">No tokens found</span>
          </div>
        ) : (
          <div className="py-2">
            {filteredAssets.map((token) => (
              <TokenView
                key={token.address}
                token={token}
                isDisabled={disabledToken?.address === token.address}
                isSelected={selectedToken?.address === token.address}
                onSingleTokenClick={(t) => {
                  onTokenSelect(t);
                  onOpenChange(false);
                  setSearch('');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
