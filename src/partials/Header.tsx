'use client';

import { SecondaryButton, WalletConnectButton } from '@/components/Button';
import { CHAINS_INFORMATION } from '@/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { DropdownMenu } from 'radix-ui';
import React, { useMemo, useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export const Header: React.FC = () => {
  const chainId = useChainId();
  const selectedChainInformation = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const [showChainSwitch, setShowChainSwitch] = useState(false);
  const switchChain = useSwitchChain();

  return (
    <div className="flex justify-between items-center gap-3 md:gap-5 w-full text-white">
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="md:hidden relative shrink-0">
          <div className="absolute inset-0 bg-[#2962ff]/20 blur-sm rounded-sm" />
          <Image
            src="/assets/images/magnetar.png"
            alt="logo"
            width={24}
            height={24}
            className="relative border border-[#2962ff]/60 p-0.5 rounded-full"
          />
        </div>
      </div>
      <div className="flex justify-center items-start gap-2 md:gap-3">
        <DropdownMenu.Root onOpenChange={(isOpen) => setShowChainSwitch(isOpen)}>
          <DropdownMenu.Trigger asChild>
            <SecondaryButton className="pl-2 pr-2 md:px-3">
              <div className="flex justify-between items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                <Image
                  src={selectedChainInformation.img}
                  height={16}
                  width={16}
                  alt={selectedChainInformation.symbol}
                />
                <span className="hidden md:inline text-xs md:text-sm">
                  {selectedChainInformation.name}
                </span>
                {showChainSwitch ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </SecondaryButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-[#0a0a10] flex border border-white/10 w-full flex-col gap-1 z-40">
              {Object.entries(CHAINS_INFORMATION).map(([key, value]) => (
                <DropdownMenu.Item
                  key={key}
                  disabled={value.chainId === chainId}
                  onClick={() => switchChain.switchChain({ chainId: value.chainId })}
                  className={`w-full ${
                    value.chainId === chainId
                      ? 'bg-[#2962ff]/60 text-[#2962ff]'
                      : 'hover:bg-[#2962ff] text-white'
                  } flex justify-between items-center gap-3 text-xs md:text-sm px-1 py-3`}
                >
                  <div className="flex justify-center items-center gap-2">
                    <Image src={value.img} height={20} width={20} alt={value.symbol} />
                    <span>{value.name}</span>
                  </div>
                  {value.chainId === chainId && <span className="px-1 py-1 bg-[#00ff9d]"></span>}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <WalletConnectButton />
      </div>
    </div>
  );
};
