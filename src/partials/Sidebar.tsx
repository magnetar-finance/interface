'use client';

import { CHAINS_INFORMATION } from '@/constants';
import {
  ArrowRightLeftIcon,
  BarChart2Icon,
  DropletsIcon,
  HandCoinsIcon,
  HomeIcon,
  LockIcon,
  VoteIcon,
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
  { href: '/', label: 'Dashboard', icon: <HomeIcon size={18} /> },
  { href: '/swap', label: 'Swap', icon: <ArrowRightLeftIcon size={18} /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart2Icon size={18} /> },
  { href: '/liquidity', label: 'Liquidity', icon: <DropletsIcon size={18} /> },
  { href: '/locks', label: 'Locks', icon: <LockIcon size={18} /> },
  { href: '/vote', label: 'Vote', icon: <VoteIcon size={18} /> },
  { href: '/incentivize', label: 'Incentivize', icon: <HandCoinsIcon size={18} /> },
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
      className={`group relative flex items-center gap-3 px-4 py-3 w-full transition-all duration-200 font-mono text-sm tracking-wide ${
        isActive ? 'text-white' : 'text-[#64748b] hover:text-white'
      }`}
    >
      {/* Active left bar */}
      <span
        className={`absolute left-0 top-0 h-full w-[2px] transition-all duration-200 ${
          isActive ? 'bg-[#2962ff] shadow-[0_0_8px_rgba(41,98,255,0.8)]' : 'bg-transparent'
        }`}
      />
      {/* Active row bg */}
      <span
        className={`absolute inset-0 transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-[#2962ff]/15 to-transparent'
            : 'bg-transparent group-hover:bg-white/[0.04]'
        }`}
      />
      {/* Icon */}
      <span
        className={`relative z-10 transition-colors ${
          isActive ? 'text-[#2962ff]' : 'text-[#64748b] group-hover:text-[#94a3b8]'
        }`}
      >
        {item.icon}
      </span>
      {/* Label */}
      <span className="relative z-10">{item.label}</span>
      {/* Active dot */}
      {isActive && (
        <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-[#2962ff] shadow-[0_0_6px_rgba(41,98,255,1)]" />
      )}
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const chainId = useChainId();
  const networkInfo = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const { data: gas = BigInt(0) } = useEstimateGas({ query: { refetchInterval: 60000 } });
  const { data: blockNumber = BigInt(0) } = useBlockNumber({ query: { refetchInterval: 60000 } });

  return (
    <aside className="bg-[#050508] min-h-screen border-r border-white/[0.06] py-6 fixed left-0 top-0 bottom-0 w-[20%] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#2962ff]/20 blur-sm rounded-sm" />
          <Image
            src="/assets/images/magnetar.svg"
            alt="logo"
            width={36}
            height={36}
            className="relative border border-[#2962ff]/60 p-0.5"
          />
        </div>
        <div>
          <h3 className="text-white text-base font-bold tracking-widest uppercase font-mono">
            Magnetar
          </h3>
          <p className="text-[#64748b] text-[10px] font-mono uppercase tracking-widest">Finance</p>
        </div>
      </div>

      {/* Section label */}
      <p className="px-5 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#374151]">
        Navigation
      </p>

      {/* Nav items */}
      <nav className="flex flex-col w-full flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Stats panel */}
      <div className="mx-4 mt-4 border border-white/[0.06] bg-black/40 px-4 py-3 space-y-2 relative">
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#2962ff]/50" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#2962ff]/50" />

        <p className="text-[10px] font-mono uppercase tracking-widest text-[#374151] mb-2">
          Network Stats
        </p>

        <div className="flex justify-between items-center">
          <span className="text-[#64748b] text-xs font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse inline-block" />
            {networkInfo.name}
          </span>
          <ZapIcon size={10} className="text-[#2962ff]" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#64748b] text-[11px] font-mono">Gas</span>
          <span className="text-[#00ff9d] text-[11px] font-mono">{formatUnits(gas, 9)} Gwei</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#64748b] text-[11px] font-mono">Block</span>
          <span className="text-[#00ff9d] text-[11px] font-mono">#{blockNumber.toString()}</span>
        </div>
      </div>
    </aside>
  );
};
