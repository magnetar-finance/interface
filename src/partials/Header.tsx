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
    <div className="flex justify-between items-center w-full pb-4 border-b border-[#2962ff]/15 mb-4">
      <div className="flex items-center gap-3">
        <div className="md:hidden shrink-0 border border-[#2962ff]/40 p-1 bg-[#2962ff]/10 rounded-lg shadow-[0_0_10px_rgba(41,98,255,0.2)]">
          <Image
            src="/assets/images/magnetar.png"
            alt="logo"
            width={24}
            height={24}
            className="hue-rotate-[-45deg] saturate-150 brightness-110"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <DropdownMenu.Root onOpenChange={setShowChainSwitch}>
          <DropdownMenu.Trigger asChild>
            <SecondaryButton className="px-3 md:px-4 py-2 border border-[#2962ff]/20 text-[#2962ff] hover:bg-[#2962ff]/10">
              <div className="flex items-center gap-2">
                <Image
                  src={selectedChainInformation.img}
                  height={16}
                  width={16}
                  alt={selectedChainInformation.symbol}
                  className="rounded-full border border-[#2962ff]/40 shadow-[0_0_8px_rgba(41,98,255,0.2)]"
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
              className="bg-[#131525]/90 backdrop-blur-xl border border-[#2962ff]/20 p-1.5 w-[220px] z-50 rounded-xl
                shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(41,98,255,0.1)]
                data-[state=open]:animate-dropdown-enter data-[state=closed]:animate-dropdown-exit"
            >
              {Object.entries(CHAINS_INFORMATION).map(([key, value]) => (
                <DropdownMenu.Item
                  key={key}
                  disabled={value.chainId === chainId}
                  onClick={() => switchChain.switchChain({ chainId: value.chainId })}
                  className={`
                    w-full flex justify-between items-center rounded-lg
                    px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-widest cursor-pointer border border-transparent
                    transition-all duration-200 outline-none
                    ${
                      value.chainId === chainId
                        ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30 shadow-[0_0_10px_rgba(41,98,255,0.1)]'
                        : 'text-[#94a3b8] hover:bg-[#2962ff]/5 hover:border-[#2962ff]/20 hover:text-white hover:shadow-[0_0_10px_rgba(41,98,255,0.05)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={value.img}
                      height={18}
                      width={18}
                      alt={value.symbol}
                      className="rounded-full border border-white/10"
                    />
                    <span>{value.name}</span>
                  </div>
                  {value.chainId === chainId && (
                    <CheckSquareIcon size={14} className="text-[#2962ff]" />
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
