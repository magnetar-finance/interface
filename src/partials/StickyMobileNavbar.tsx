"use client";

import {
  HomeIcon,
  ArrowRightLeftIcon,
  DropletsIcon,
  LockIcon,
  VoteIcon,
  HandCoinsIcon,
  BarChart2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: <HomeIcon size={20} /> },
  { href: "/swap", label: "Swap", icon: <ArrowRightLeftIcon size={20} /> },
  { href: "/analytics", label: "Charts", icon: <BarChart2Icon size={20} /> },
  { href: "/liquidity", label: "Pools", icon: <DropletsIcon size={20} /> },
  { href: "/locks", label: "Locks", icon: <LockIcon size={20} /> },
  { href: "/vote", label: "Vote", icon: <VoteIcon size={20} /> },
  { href: "/incentivize", label: "Bribes", icon: <HandCoinsIcon size={20} /> },
];

const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
  const pathname = usePathname();
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={`group relative flex flex-col items-center justify-center gap-1 px-2 py-2.5 flex-1 transition-all duration-200 ${
        isActive ? "text-[#2962ff]" : "text-[#64748b] hover:text-white"
      }`}
    >
      {/* Top active indicator */}
      <span
        className={`absolute top-0 left-[15%] right-[15%] h-[2px] transition-all duration-200 ${
          isActive ? "bg-[#2962ff] shadow-[0_0_8px_rgba(41,98,255,0.9)]" : "bg-transparent"
        }`}
      />
      {/* Active glow bg */}
      {isActive && (
        <span className="absolute inset-0 bg-[#2962ff]/10 blur-xs pointer-events-none" />
      )}
      {/* Icon */}
      <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {item.icon}
      </span>
      {/* Label */}
      <span
        className={`relative z-10 text-[10px] font-mono uppercase tracking-widest transition-colors ${
          isActive ? "text-[#2962ff]" : "text-[#4b5563] group-hover:text-[#94a3b8]"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
};

export const StickyMobileNavbar: React.FC = () => {
  return (
    <nav className="bg-[#050508]/95 backdrop-blur-md border border-white/[0.08] relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2962ff]/40 to-transparent" />
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#2962ff]/60" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#2962ff]/60" />

      <div className="flex justify-around items-stretch w-full">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </nav>
  );
};
