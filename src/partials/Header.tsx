"use client";

import { SecondaryButton, WalletConnectButton } from "@/components/Button";
import { CHAINS_INFORMATION } from "@/constants";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";

export const Header: React.FC = () => {
  const chainId = useChainId();
  const selectedChainInformation = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);
  const [showChainSwitch, setShowChainSwitch] = useState(false);
  const switchChain = useSwitchChain();

  const pathname = usePathname();

  return (
    <div className="flex justify-between items-center gap-5 w-full text-white">
      <h3 className="font-semibold text-2xl md:text-4xl">
        {pathname === "/" && "Dashboard"}
        {pathname.startsWith("/swap") && "Swap"}
        {pathname.startsWith("/liquidity") && "Liquidity"}
        {pathname.startsWith("/vote") && "Vote"}
        {pathname.startsWith("/locks") && "Locks"}
        {pathname.startsWith("/incentivize") && "Incentivize"}
      </h3>
      <div className="flex justify-center items-start gap-3">
        <div className="flex flex-col justify-start items-center gap-1 relative">
          <SecondaryButton onClick={() => setShowChainSwitch((show) => !show)}>
            <div className="flex justify-between items-center gap-2">
              <Image
                src={selectedChainInformation.img}
                height={20}
                width={20}
                alt={selectedChainInformation.symbol}
              />
              <span>{selectedChainInformation.name}</span>
              {showChainSwitch ? <ChevronUp /> : <ChevronDown />}
            </div>
          </SecondaryButton>
          {showChainSwitch && (
            <div className="bg-[#0a0a10] flex border border-white/10 w-full flex-col gap-1 absolute z-40 top-14 px-2 py-2">
              {Object.entries(CHAINS_INFORMATION).map(([key, value]) => (
                <button
                  key={key}
                  disabled={value.chainId === chainId}
                  onClick={() => switchChain.mutate({ chainId: value.chainId })}
                  className={`w-full ${
                    value.chainId === chainId
                      ? "bg-[#2962ff]/60 text-[#2962ff]"
                      : "hover:bg-[#2962ff] text-white"
                  } flex justify-between items-center gap-3 text-sm px-1 py-3`}
                >
                  <div className="flex justify-center items-center gap-2">
                    <Image src={value.img} height={20} width={20} alt={value.symbol} />
                    <span>{value.name}</span>
                  </div>
                  {value.chainId === chainId && <span className="px-1 py-1 bg-[#00ff9d]"></span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <WalletConnectButton />
      </div>
    </div>
  );
};
