'use client';

import { CHAINS_INFORMATION } from '@/constants';
import {
  TerminalIcon,
  ArrowRightLeftIcon,
  ActivityIcon,
  DatabaseIcon,
  LockKeyholeIcon,
  VoteIcon,
  HandCoinsIcon,
  ZapIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useBlockNumber, useChainId, useEstimateGas } from 'wagmi';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'SYS.DASHBOARD', icon: <TerminalIcon size={14} /> },
  { href: '/swap', label: 'EXEC.SWAP', icon: <ArrowRightLeftIcon size={14} /> },
  { href: '/analytics', label: 'DATA.ANALYTICS', icon: <ActivityIcon size={14} /> },
  { href: '/liquidity', label: 'POOL.LIQUIDITY', icon: <DatabaseIcon size={14} /> },
  { href: '/locks', label: 'SEC.LOCKS', icon: <LockKeyholeIcon size={14} /> },
  { href: '/vote', label: 'GOV.VOTE', icon: <VoteIcon size={14} /> },
  { href: '/incentivize', label: 'INC.BRIBES', icon: <HandCoinsIcon size={14} /> },
];

const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
  const pathname = usePathname();
  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      className={`
        group relative flex items-center gap-3 px-4 py-2 mx-2 my-1
        transition-all duration-100 font-mono text-xs uppercase tracking-widest
        ${
          isActive
            ? 'text-[#2962ff] bg-[#2962ff]/5 border border-[#2962ff]/30'
            : 'text-[#64748b] border border-transparent hover:border-white/10 hover:text-white'
        }
      `}
    >
      <span className={isActive ? 'text-[#2962ff]' : 'text-[#64748b] group-hover:text-white'}>
        {isActive ? <span className="animate-blink mr-1">&gt;</span> : ''}
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const chainId = useChainId();
  const networkInfo = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const { data: gas = BigInt(0) } = useEstimateGas({ query: { refetchInterval: 60000 } });
  const { data: blockNumber = BigInt(0) } = useBlockNumber({ query: { refetchInterval: 60000 } });

  return (
    <aside className="bg-black min-h-screen border-r border-[#2962ff]/20 py-6 fixed left-0 top-0 bottom-0 w-[20%] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 mb-8 border-b border-[#2962ff]/20 pb-6 mx-2">
        <div className="border border-[#2962ff]/50 p-1 bg-[#2962ff]/10">
          <Image src="/assets/images/magnetar.png" alt="logo" width={24} height={24} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[#2962ff] text-sm font-bold tracking-[0.2em] font-mono">MAGNETAR</h3>
          <span className="text-[#2962ff] text-[9px] font-mono tracking-widest uppercase">
            SYS_ACTIVE
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col w-full flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Stats panel */}
      <div className="mx-4 mt-auto border border-[#2962ff]/30 bg-[#2962ff]/5 p-3 space-y-2 font-mono uppercase tracking-widest">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#2962ff] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2962ff] animate-pulse" />
            {networkInfo.name}
          </span>
          <ZapIcon size={10} className="text-[#2962ff]" />
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#94a3b8]">GAS</span>
          <span className="text-[#2962ff]">{formatUnits(gas, 9)} GWEI</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#94a3b8]">BLOCK</span>
          <span className="text-white">#{blockNumber.toString()}</span>
        </div>
      </div>
    </aside>
  );
};
