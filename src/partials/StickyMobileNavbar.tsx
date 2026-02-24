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

interface NavItemProp {
  href: string;
  children: React.ReactNode;
}

const NavMenuItem: React.FC<NavItemProp> = ({ href, children }) => {
  const pathname = usePathname();
  if (pathname === "/" && href === pathname)
    return (
      <NavigationMenu.Item className="w-full text-[#2962ff] py-4 px-3">
        <NavigationMenu.Link href={href} className="flex justify-center">
          {children}
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    );

  return (
    <NavigationMenu.Item
      className={`w-full py-4 px-3 hover:text-[#2962ff] ${
        href !== "/" && pathname.startsWith(href) && "text-[#2962ff]"
      }`}
    >
      <NavigationMenu.Link href={href} className="flex justify-start w-full space-x-2">
        {children}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
};

export const StickyMobileNavbar: React.FC = () => {
  return (
    <NavigationMenu.Root className="bg-[#0a0a12] border border-[rgb(39,39,42)] py-3 w-full">
      <NavigationMenu.List className="w-full text-[#fafafa] text-xs flex justify-between items-center gap-1 px-3">
        <NavMenuItem href="/">
          <HomeIcon />
        </NavMenuItem>
        <NavMenuItem href="/swap">
          <ArrowRightLeftIcon />
        </NavMenuItem>
        <NavMenuItem href="/liquidity">
          <DropletsIcon />
        </NavMenuItem>
        <NavMenuItem href="/locks">
          <LockIcon />
        </NavMenuItem>
        <NavMenuItem href="/vote">
          <VoteIcon />
        </NavMenuItem>
        <NavMenuItem href="/incentivize">
          <HandCoinsIcon />
        </NavMenuItem>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
