'use client';

import { SecondaryButton, WalletConnectButton } from '@/components/Button';
import { CHAINS_INFORMATION } from '@/constants';
import { NAV_ITEMS, isNavActive } from '@/partials/nav';
import { CheckSquareIcon, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DropdownMenu } from 'radix-ui';
import React, { useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useBlockNumber, useChainId, useEstimateGas, useSwitchChain } from 'wagmi';

const DesktopNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              rounded-lg px-2.5 py-1.5 text-[13px] font-medium tracking-tight
              transition-colors duration-150
              ${active ? 'text-accent' : 'text-muted hover:text-foreground'}
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export const Header: React.FC = () => {
  const chainId = useChainId();
  const selectedChainInformation = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const [, setShowChainSwitch] = useState(false);
  const switchChain = useSwitchChain();
  const { data: gas = BigInt(0) } = useEstimateGas({ query: { refetchInterval: 60000 } });
  const { data: blockNumber = BigInt(0) } = useBlockNumber({ query: { refetchInterval: 60000 } });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/assets/images/magnetar.png" alt="Magnetar" width={22} height={22} />
            <span className="text-sm font-semibold tracking-tight text-foreground">Magnetar</span>
          </Link>
          <DesktopNav />
        </div>

        <div className="flex items-center gap-1.5">
          <div className="mr-1 hidden items-center gap-2 font-mono text-[11px] text-dim xl:flex">
            <span>{Number(formatUnits(gas, 9)).toFixed(1)} gwei</span>
            <span className="text-white/15">·</span>
            <span>#{blockNumber.toString()}</span>
          </div>

          <DropdownMenu.Root onOpenChange={setShowChainSwitch}>
            <DropdownMenu.Trigger asChild>
              <SecondaryButton size="sm" className="px-2 text-foreground">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Image
                      src={selectedChainInformation.img}
                      height={18}
                      width={18}
                      alt={selectedChainInformation.symbol}
                      className="rounded-full"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-surface bg-success" />
                  </div>
                  <span className="hidden sm:inline text-xs font-medium">
                    {selectedChainInformation.symbol}
                  </span>
                </div>
                <ChevronDown size={13} className="opacity-50" />
              </SecondaryButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 mt-2 w-[220px] rounded-2xl border border-white/[0.08] bg-surface/95 p-1.5 backdrop-blur-xl
                  shadow-[0_16px_60px_rgba(0,0,0,0.45)]
                  data-[state=open]:animate-dropdown-enter data-[state=closed]:animate-dropdown-exit"
              >
                {Object.entries(CHAINS_INFORMATION).map(([key, value]) => (
                  <DropdownMenu.Item
                    key={key}
                    disabled={value.chainId === chainId}
                    onClick={() => switchChain.switchChain({ chainId: value.chainId })}
                    className={`
                      flex w-full cursor-pointer items-center justify-between rounded-xl
                      px-3 py-2.5 text-xs font-semibold outline-none transition-colors
                      ${
                        value.chainId === chainId
                          ? 'bg-accent/10 text-accent'
                          : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={value.img}
                        height={18}
                        width={18}
                        alt={value.symbol}
                        className="rounded-full"
                      />
                      <span>{value.name}</span>
                    </div>
                    {value.chainId === chainId && <CheckSquareIcon size={13} />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
};
