'use client';

import { SecondaryButton, WalletConnectButton } from '@/components/Button';
import { CHAINS_INFORMATION } from '@/constants';
import { ChevronDown, CheckSquareIcon } from 'lucide-react';
import Image from 'next/image';
import { DropdownMenu } from 'radix-ui';
import React, { useMemo, useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export const Header: React.FC = () => {
  const chainId = useChainId();
  const selectedChainInformation = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const [, setShowChainSwitch] = useState(false);
  const switchChain = useSwitchChain();

  return (
    <div className="flex justify-between items-center w-full pb-4 border-b border-[#2962ff]/20 mb-4">
      <div className="flex items-center gap-3">
        <div className="md:hidden shrink-0 border border-[#2962ff]/50 p-1 bg-[#2962ff]/10">
          <Image src="/assets/images/magnetar.png" alt="logo" width={24} height={24} />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <DropdownMenu.Root onOpenChange={setShowChainSwitch}>
          <DropdownMenu.Trigger asChild>
            <SecondaryButton className="px-3 md:px-4 py-2 border border-[#2962ff]/30 text-[#2962ff] hover:bg-[#2962ff]/10">
              <div className="flex items-center gap-2">
                <Image
                  src={selectedChainInformation.img}
                  height={16}
                  width={16}
                  alt={selectedChainInformation.symbol}
                  className="rounded-none border border-[#2962ff]/50"
                />
                <span className="hidden md:inline font-mono tracking-widest text-xs uppercase">
                  [{selectedChainInformation.name}]
                </span>
              </div>
              <ChevronDown size={14} className="ml-1" />
            </SecondaryButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-black border border-[#2962ff]/50 p-1 w-[220px] z-50
                shadow-[0_0_20px_rgba(41,98,255,0.15)]
                data-[state=open]:animate-dropdown-enter data-[state=closed]:animate-dropdown-exit"
            >
              {Object.entries(CHAINS_INFORMATION).map(([key, value]) => (
                <DropdownMenu.Item
                  key={key}
                  disabled={value.chainId === chainId}
                  onClick={() => switchChain.switchChain({ chainId: value.chainId })}
                  className={`
                    w-full flex justify-between items-center
                    px-3 py-2 font-mono text-xs uppercase tracking-widest cursor-pointer border border-transparent
                    transition-colors duration-100
                    ${
                      value.chainId === chainId
                        ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                        : 'text-[#94a3b8] hover:border-white/20 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={value.img}
                      height={16}
                      width={16}
                      alt={value.symbol}
                      className="rounded-none border border-white/20"
                    />
                    <span>{value.name}</span>
                  </div>
                  {value.chainId === chainId && (
                    <CheckSquareIcon size={12} className="text-[#2962ff]" />
                  )}
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
