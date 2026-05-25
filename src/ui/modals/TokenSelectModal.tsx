'use client';

import { AssetResponseType } from '@/config/github-assets.config';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { SearchIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '@/components/Modal';
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

interface TokenViewProps {
  token: AssetResponseType[number];
  isSelected?: boolean;
  isDisabled?: boolean;
  onSingleTokenClick: (token: AssetResponseType[number]) => void;
}

const TokenView: React.FC<TokenViewProps> = ({
  token,
  isDisabled,
  isSelected,
  onSingleTokenClick,
}) => {
  const balance = useGetBalance(token.address, REFETCH_INTERVALS);

  return (
    <button
      key={token.address}
      disabled={isDisabled}
      onClick={() => onSingleTokenClick(token)}
      className={`w-full flex justify-between items-center px-5 py-3 transition-colors
                      ${
                        isSelected
                          ? 'bg-[#2962ff]/20 text-[#2962ff]'
                          : 'text-white hover:bg-white/5'
                      }
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          <Image
            src={token.logoURI}
            alt={token.symbol}
            width={32}
            height={32}
            className="rounded-full w-8 h-8 bg-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#2962ff]/20 flex items-center justify-center">
            <span className="text-[#2962ff] text-xs font-bold">{token.symbol.slice(0, 2)}</span>
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="font-semibold text-sm">{token.symbol}</span>
          <span className="text-[#64748b] text-xs">{token.name}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[#94a3b8] text-xs">
          {formatNumber(formatUnits(balance, token.decimals), 'en-US', 2)}
        </span>
        {isSelected && <span className="text-[#2962ff] text-xs mt-0.5">Selected</span>}
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

  const handleSelect = (token: AssetResponseType[number]) => {
    onTokenSelect(token);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Select Token" className="h-100">
      {/* Search */}
      <div className="px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 bg-black border border-white/10 px-3 py-2">
          <SearchIcon size={14} color="#64748b" />
          <input
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-[#64748b]"
            placeholder="Search name, symbol, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#64748b] hover:text-white">
              <XIcon size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Token List */}
      <div className="overflow-y-auto max-h-80 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="text-[#64748b] text-sm animate-pulse">Loading tokens...</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <span className="text-[#64748b] text-sm">No tokens found</span>
          </div>
        ) : (
          filteredAssets.map((token) => {
            const isSelected = selectedToken?.address === token.address;
            const isDisabled = disabledToken?.address === token.address;
            return (
              <TokenView
                key={token.address}
                token={token}
                isDisabled={isDisabled}
                isSelected={isSelected}
                onSingleTokenClick={handleSelect}
              />
            );
          })
        )}
      </div>
    </Modal>
  );
};
