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
        group relative flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5
        transition-all duration-200 font-sans text-xs uppercase tracking-widest font-bold rounded-lg
        overflow-hidden
        ${
          isActive
            ? 'text-white bg-gradient-to-r from-[#2962ff]/15 to-transparent border border-[#2962ff]/35 shadow-[0_0_20px_rgba(41,98,255,0.08)]'
            : 'text-[#64748b] border border-transparent hover:border-white/8 hover:text-[#f8fafc] hover:bg-white/[0.03]'
        }
      `}
    >
      {/* Active left-side accent bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-[#2962ff] to-[#9d4edd] rounded-full shadow-[0_0_8px_rgba(41,98,255,0.8)]" />
      )}

      <span
        className={
          isActive
            ? 'text-[#2962ff] drop-shadow-[0_0_6px_rgba(41,98,255,0.6)]'
            : 'text-[#64748b] group-hover:text-[#2962ff]/70 transition-colors'
        }
      >
        {item.icon}
      </span>
      <span
        className={
          isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#94a3b8]' : ''
        }
      >
        {item.label}
      </span>

      {/* Active cursor indicator */}
      {isActive && (
        <span className="ml-auto font-mono text-[#2962ff]/50 text-[10px] animate-blink">▋</span>
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
    <aside className="bg-[#0f1020]/80 backdrop-blur-xl min-h-screen border-r border-[#2962ff]/12 py-6 fixed left-0 top-0 bottom-0 w-[20%] flex flex-col z-40 shadow-[4px_0_40px_rgba(0,0,0,0.4)]">
      {/* Top glow gradient */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#2962ff]/[0.06] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 mb-8 border-b border-[#2962ff]/10 pb-6 mx-2 relative">
        <div className="border border-[#2962ff]/50 p-1.5 bg-gradient-to-br from-[#2962ff]/20 to-[#9d4edd]/10 rounded-xl shadow-[0_0_20px_rgba(41,98,255,0.3)] animate-pulse-glow">
          <Image
            src="/assets/images/magnetar.png"
            alt="logo"
            width={26}
            height={26}
            className="hue-rotate-[-45deg] saturate-150 brightness-110"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] via-[#7b9fff] to-[#9d4edd] text-sm font-bold tracking-[0.2em] font-sans animate-gradient-shift">
            MAGNETAR
          </h3>
          <span className="text-[#2962ff]/70 text-[9px] font-mono tracking-widest uppercase flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#00ff9d] shadow-[0_0_4px_rgba(0,255,157,0.8)] animate-pulse" />
            SYS_ACTIVE
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col w-full flex-1 relative">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Stats panel */}
      <div className="mx-4 mt-auto border border-[#2962ff]/20 bg-gradient-to-b from-[#2962ff]/[0.05] to-transparent rounded-xl p-3.5 space-y-2.5 font-mono uppercase tracking-widest backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_20px_rgba(41,98,255,0.05)]">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#2962ff] flex items-center gap-2 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.9)] animate-pulse" />
            {networkInfo.name}
          </span>
          <ZapIcon size={10} className="text-[#2962ff]" />
        </div>
        <div className="h-px bg-gradient-to-r from-[#2962ff]/20 to-transparent" />
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#475569]">GAS</span>
          <span className="text-[#4c82fb] font-bold">{formatUnits(gas, 9)} GWEI</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#475569]">BLOCK</span>
          <span className="text-white font-bold">#{blockNumber.toString()}</span>
        </div>
      </div>
    </aside>
  );
};
