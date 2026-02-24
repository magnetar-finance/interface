"use client";

import {
  ArrowRightLeftIcon,
  DropletsIcon,
  HandCoinsIcon,
  HomeIcon,
  LockIcon,
  VoteIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "radix-ui";
import React from "react";

interface NavItemProp {
  href: string;
  children: React.ReactNode;
}

const NavMenuItem: React.FC<NavItemProp> = ({ href, children }) => {
  const pathname = usePathname();
  if (pathname === "/" && href === pathname)
    return (
      <NavigationMenu.Item className="w-full bg-[#6c5dd3]/20 py-4 px-3 hover:bg-[#6c5dd3]">
        <NavigationMenu.Link href={href} className="flex justify-start w-full space-x-2">
          {children}
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    );

  return (
    <NavigationMenu.Item
      className={`w-full py-4 px-3 hover:bg-[#6c5dd3] ${
        href !== "/" && pathname.startsWith(href) && "bg-[#6c5dd3]/20"
      }`}
    >
      <NavigationMenu.Link href={href} className="flex justify-start w-full space-x-2">
        {children}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <NavigationMenu.Root className="bg-[#050508] min-h-screen border-r border-[rgb(82,82,91)] py-15 fixed left-0 bottom-0 w-96">
      <NavigationMenu.List className="w-full text-white text-lg gap-3 flex flex-col justify-center items-start px-4">
        <NavigationMenu.Item className="w-full mb-10 mt-3 flex justify-center">
          <div className="w-full flex justify-start items-center gap-5">
            <Image
              src="/assets/images/magnetar.svg"
              alt="logo"
              width={40}
              height={40}
              className="rounded-full border border-[#7c3aed]"
            />
            <h3 className="text-white text-2xl font-semibold">Magnetar</h3>
          </div>
        </NavigationMenu.Item>
        <NavMenuItem href="/">
          <HomeIcon />
          <span>Dashboard</span>
        </NavMenuItem>
        <NavMenuItem href="/swap">
          <ArrowRightLeftIcon />
          <span>Swap</span>
        </NavMenuItem>
        <NavMenuItem href="/liquidity">
          <DropletsIcon />
          <span>Liquidity</span>
        </NavMenuItem>
        <NavMenuItem href="/locks">
          <LockIcon />
          <span>Locks</span>
        </NavMenuItem>

        <NavMenuItem href="/vote">
          <VoteIcon />
          <span>Vote</span>
        </NavMenuItem>

        <NavMenuItem href="/incentivize">
          <HandCoinsIcon />
          <span>Incentivize</span>
        </NavMenuItem>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
