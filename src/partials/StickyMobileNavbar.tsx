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
        flex flex-col items-center justify-center gap-1.5 flex-1 py-3 transition-all duration-300
        font-sans uppercase relative
        ${
          isActive
            ? 'text-[#2962ff] bg-[#2962ff]/5'
            : 'text-[#64748b] hover:text-[#f8fafc] hover:bg-white/5'
        }
      `}
    >
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-[#2962ff] to-transparent shadow-[0_0_10px_rgba(41,98,255,0.8)]" />
      )}
      <span className={isActive ? 'drop-shadow-[0_0_8px_rgba(41,98,255,0.4)]' : ''}>
        {item.icon}
      </span>
      <span className="text-[9px] font-bold tracking-widest">{item.label}</span>
    </Link>
  );
};

export const StickyMobileNavbar: React.FC = () => (
  <nav className="bg-[#131525]/90 backdrop-blur-xl border-t border-[#2962ff]/15 w-full shadow-[0_-8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(41,98,255,0.05)]">
    <div className="flex justify-around items-stretch w-full">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  </nav>
);
