'use client';

import { isNavActive, NAV_ITEMS } from '@/partials/nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export const StickyMobileNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border border-white/[0.08] bg-surface/90 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex w-full items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2
                text-[10px] font-medium transition-colors
                ${active ? 'text-accent' : 'text-muted hover:text-foreground'}
              `}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-accent" />
              )}
              <span className={active ? 'scale-110' : ''}>{item.icon}</span>
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
