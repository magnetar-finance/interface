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

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  return (
    <NavigationMenu.Root className="bg-[#050508] min-h-screen border-r border-[rgb(82,82,91)] py-15 w-full">
      <NavigationMenu.List className="w-full text-[#a1a1aa] text-lg gap-3 flex flex-col justify-center items-start px-4">
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
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-4 px-3 hover:bg-[#6c5dd3] ${
            pathname === "/" && "bg-[#6c5dd3]/20 text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/" className="flex justify-start w-full space-x-2">
            <HomeIcon />
            <span>Dashboard</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-4 px-3 hover:bg-[#6c5dd3] ${
            pathname.startsWith("/swap") && "bg-[#6c5dd3]/20 text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/swap" className="flex justify-start w-full space-x-2">
            <ArrowRightLeftIcon />
            <span>Swap</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-4 px-3 hover:bg-[#6c5dd3] ${
            pathname.startsWith("/liquidity") && "bg-[#6c5dd3]/20 text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/liquidity" className="flex justify-start w-full space-x-2">
            <DropletsIcon />
            <span>Liquidity</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item
          className={`w-full rounded-2xl py-4 px-3 hover:bg-[#6c5dd3] ${
            pathname.startsWith("/locks") && "bg-[#6c5dd3]/20 text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/locks" className="flex justify-start w-full space-x-2">
            <LockIcon />
            <span>Locks</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item
          className={`w-full rounded-2xl py-4 px-3 hover:bg-[#6c5dd3] ${
            pathname.startsWith("/vote") && "bg-[#6c5dd3]/20 text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/vote" className="flex justify-start w-full space-x-2">
            <VoteIcon />
            <span>Vote</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item
          className={`w-full rounded-2xl py-4 px-3 hover:bg-[#6c5dd3] ${
            pathname.startsWith("/incentivize") && "bg-[#6c5dd3]/20 text-[#7c3aed]"
          }`}
        >
          <NavigationMenu.Link href="/incentivize" className="flex justify-start w-full space-x-2">
            <HandCoinsIcon />
            <span>Incentivize</span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
