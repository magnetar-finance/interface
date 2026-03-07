"use client";

import { CHAINS_INFORMATION } from "@/constants";
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
import React, { useMemo } from "react";
import { formatUnits } from "viem";
import { useBlockNumber, useChainId, useEstimateGas } from "wagmi";

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
  const chainId = useChainId();
  const networkInfo = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const { data: gas = BigInt(0) } = useEstimateGas({ query: { refetchInterval: 60000 } });
  const { data: blockNumber = BigInt(0) } = useBlockNumber({ query: { refetchInterval: 60000 } });

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

        <NavigationMenu.Item className="bg-black border border-[rgba(255,255,255,0.06)] w-full flex flex-col gap-2 justify-center items-center mt-20 px-2 py-4">
          <div className="flex w-full justify-between items-center gap-3">
            <div className="flex justify-center gap-1 items-center">
              <span className="px-1 py-1 bg-[#00ff9d]"></span>
              <h6 className="text-[#64748b] font-normal text-sm">Network</h6>
            </div>
            <span className="text-[#00ff9d] font-normal text-sm">{networkInfo.name}</span>
          </div>

          <div className="flex w-full justify-between items-center gap-3">
            <div className="flex justify-center gap-1 items-center">
              <h6 className="text-[#64748b] font-normal text-sm">Gas</h6>
            </div>
            <span className="text-[#00ff9d] font-normal text-sm">{formatUnits(gas, 9)} Gwei</span>
          </div>
          <div className="flex w-full justify-between items-center gap-3">
            <div className="flex justify-center gap-1 items-center">
              <h6 className="text-[#64748b] font-normal text-sm">Block</h6>
            </div>
            <span className="text-[#00ff9d] font-normal text-sm">#{blockNumber.toString()}</span>
          </div>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
