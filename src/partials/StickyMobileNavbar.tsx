"use client";

import {
  HomeIcon,
  ArrowRightLeftIcon,
  DropletsIcon,
  LockIcon,
  VoteIcon,
  HandCoinsIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "radix-ui";

export const StickyMobileNavbar: React.FC = () => {
  const pathname = usePathname();
  return (
    <NavigationMenu.Root className="bg-[#0a0a12] border border-[rgb(39,39,42)] py-3 w-full rounded-3xl">
      <NavigationMenu.List className="w-full text-[#fafafa] text-xs flex justify-between items-center gap-1 px-3">
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-2 hover:text-[#6c5dd3] ${
            pathname === "/" && "text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/" className="flex justify-center">
            <HomeIcon />
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-2 hover:text-[#6c5dd3] ${
            pathname.startsWith("/swap") && "text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/swap" className="flex justify-center">
            <ArrowRightLeftIcon />
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-2 hover:text-[#6c5dd3] ${
            pathname.startsWith("/liquidity") && "text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/liquidity" className="flex justify-center">
            <DropletsIcon />
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-2 hover:text-[#6c5dd3] ${
            pathname.startsWith("/locks") && "text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/locks" className="flex justify-center">
            <LockIcon />
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item
          className={`w-full rounded-2xl py-2 hover:text-[#6c5dd3] ${
            pathname.startsWith("/vote") && "text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/vote" className="flex justify-center">
            <VoteIcon />
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item
          className={`w-full rounded-2xl py-2 hover:text-[#6c5dd3] ${
            pathname.startsWith("/incentivize") && "text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/incentivize" className="flex justify-center">
            <HandCoinsIcon />
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
