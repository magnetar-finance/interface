'use client';

import {
  TerminalIcon,
  ArrowRightLeftIcon,
  ActivityIcon,
  DatabaseIcon,
  LockKeyholeIcon,
  VoteIcon,
  HandCoinsIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'SYS', icon: <TerminalIcon size={16} /> },
  { href: '/swap', label: 'SWP', icon: <ArrowRightLeftIcon size={16} /> },
  { href: '/analytics', label: 'DAT', icon: <ActivityIcon size={16} /> },
  { href: '/liquidity', label: 'POL', icon: <DatabaseIcon size={16} /> },
  { href: '/locks', label: 'LCK', icon: <LockKeyholeIcon size={16} /> },
  { href: '/vote', label: 'VOT', icon: <VoteIcon size={16} /> },
  { href: '/incentivize', label: 'INC', icon: <HandCoinsIcon size={16} /> },
];

const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
  const pathname = usePathname();
  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      className={`
        flex flex-col items-center justify-center gap-1.5 flex-1 py-3 transition-colors
        font-mono uppercase
        ${
          isActive
            ? 'text-[#2962ff] bg-[#2962ff]/10 border-t border-[#2962ff]'
            : 'text-[#64748b] border-t border-transparent hover:text-white hover:bg-white/5'
        }
      `}
    >
      <span>{item.icon}</span>
      <span className="text-[9px] font-bold tracking-widest">{item.label}</span>
    </Link>
  );
};

export const StickyMobileNavbar: React.FC = () => (
  <nav className="bg-black border border-[#2962ff]/30 w-full shadow-[0_0_15px_rgba(41,98,255,0.15)]">
    <div className="flex justify-around items-stretch w-full">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  </nav>
);
