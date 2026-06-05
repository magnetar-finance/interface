'use client';

import {
  HomeIcon,
  ArrowRightLeftIcon,
  DropletsIcon,
  LockIcon,
  VoteIcon,
  HandCoinsIcon,
  BarChart2Icon,
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
  { href: '/', label: 'Home', icon: <HomeIcon size={22} strokeWidth={1.5} /> },
  { href: '/swap', label: 'Swap', icon: <ArrowRightLeftIcon size={22} strokeWidth={1.5} /> },
  { href: '/analytics', label: 'Charts', icon: <BarChart2Icon size={22} strokeWidth={1.5} /> },
  { href: '/liquidity', label: 'Pools', icon: <DropletsIcon size={22} strokeWidth={1.5} /> },
  { href: '/locks', label: 'Locks', icon: <LockIcon size={22} strokeWidth={1.5} /> },
  { href: '/vote', label: 'Vote', icon: <VoteIcon size={22} strokeWidth={1.5} /> },
  { href: '/incentivize', label: 'Bribes', icon: <HandCoinsIcon size={22} strokeWidth={1.5} /> },
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
        flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors
        ${isActive ? 'text-[#fc72ff]' : 'text-white/40 hover:text-white/70'}
      `}
    >
      <span>{item.icon}</span>
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  );
};

export const StickyMobileNavbar: React.FC = () => (
  <nav className="bg-[#161618]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
    <div className="flex justify-around items-stretch w-full px-1">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  </nav>
);
