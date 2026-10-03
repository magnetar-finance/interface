import {
  ActivityIcon,
  ArrowRightLeftIcon,
  DatabaseIcon,
  HandCoinsIcon,
  LockKeyholeIcon,
  TerminalIcon,
  VoteIcon,
} from 'lucide-react';
import React from 'react';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', shortLabel: 'Home', icon: <TerminalIcon size={15} /> },
  { href: '/swap', label: 'Swap', shortLabel: 'Swap', icon: <ArrowRightLeftIcon size={15} /> },
  {
    href: '/analytics',
    label: 'Analytics',
    shortLabel: 'Data',
    icon: <ActivityIcon size={15} />,
  },
  {
    href: '/liquidity',
    label: 'Liquidity',
    shortLabel: 'Pools',
    icon: <DatabaseIcon size={15} />,
  },
  { href: '/locks', label: 'Locks', shortLabel: 'Locks', icon: <LockKeyholeIcon size={15} /> },
  { href: '/vote', label: 'Vote', shortLabel: 'Vote', icon: <VoteIcon size={15} /> },
  {
    href: '/incentivize',
    label: 'Incentivize',
    shortLabel: 'Bribes',
    icon: <HandCoinsIcon size={15} />,
  },
];

export function isNavActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
