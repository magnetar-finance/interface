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
  { href: '/', label: 'SYS', icon: <TerminalIcon size={17} /> },
  { href: '/swap', label: 'SWP', icon: <ArrowRightLeftIcon size={17} /> },
  { href: '/analytics', label: 'DAT', icon: <ActivityIcon size={17} /> },
  { href: '/liquidity', label: 'POL', icon: <DatabaseIcon size={17} /> },
  { href: '/locks', label: 'LCK', icon: <LockKeyholeIcon size={17} /> },
  { href: '/vote', label: 'VOT', icon: <VoteIcon size={17} /> },
  { href: '/incentivize', label: 'INC', icon: <HandCoinsIcon size={17} /> },
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
        flex flex-col items-center justify-center gap-1.5 flex-1 py-4 transition-all duration-300
        font-sans uppercase relative
        ${isActive ? 'text-[#2962ff]' : 'text-[#64748b] hover:text-[#f8fafc] hover:bg-white/[0.03]'}
      `}
    >
      {/* Active top indicator pill */}
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-gradient-to-r from-transparent via-[#2962ff] to-transparent shadow-[0_0_12px_rgba(41,98,255,0.9)] rounded-b-full" />
      )}

      {/* Icon with glow for active */}
      <span
        className={
          isActive
            ? 'drop-shadow-[0_0_10px_rgba(41,98,255,0.6)] scale-110 transition-transform'
            : 'transition-transform'
        }
      >
        {item.icon}
      </span>
      <span className={`text-[9px] font-bold tracking-widest ${isActive ? 'text-[#2962ff]' : ''}`}>
        {item.label}
      </span>

      {/* Active bottom dot */}
      {isActive && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2962ff] shadow-[0_0_6px_rgba(41,98,255,0.8)]" />
      )}
    </Link>
  );
};

export const StickyMobileNavbar: React.FC = () => (
  <nav className="bg-[#0f1020]/95 backdrop-blur-xl border border-[#2962ff]/15 w-full rounded-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(41,98,255,0.08)] overflow-hidden">
    {/* Top gradient accent */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#2962ff]/50 to-transparent" />
    <div className="flex justify-around items-stretch w-full">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  </nav>
);
