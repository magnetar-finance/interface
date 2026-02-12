"use client";

import { WalletConnectButton } from "@/components/Button";
import { FancyCard } from "@/components/Card";
import { WalletMinimalIcon } from "lucide-react";
import { useConnection } from "wagmi";

export default function Home() {
  const { isConnected } = useConnection();
  return (
    <main className="w-full flex justify-center items-center">
      {isConnected ? (
        <div className="flex flex-col justify-center items-start gap-5 md:gap-12 w-full">
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-3 md:gap-7 w-full">
            <div className="w-full md:w-1/2 self-stretch">
              <FancyCard>
                <div className="flex flex-col gap-5 lg:gap-7 justify-start items-start pb-4 md:pb-10">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <h5 className="text-[#94a3b8] font-semibold text-lg md:text-xl">
                      Portfolio Value
                    </h5>
                    <span className="text-[#00ff9d] font-semibold text-xs md:text-sm">
                      +12.5% (24h)
                    </span>
                  </div>
                  <h3 className="font-extrabold text-4xl lg:text-5xl">$14,250.80</h3>
                </div>
              </FancyCard>
            </div>

            <div className="w-full md:w-1/2 self-stretch">
              <FancyCard>
                <div className="flex flex-col gap-5 lg:gap-7 justify-start items-start">
                  <div className="flex justify-between items-center gap-4 w-full">
                    <h5 className="text-[#94a3b8] font-semibold text-lg md:text-xl">
                      Voting Power
                    </h5>
                    <span className="text-[#94a3b8] font-semibold text-xs md:text-sm">
                      0.042% of total
                    </span>
                  </div>
                  <h3 className="font-extrabold text-4xl lg:text-5xl text-[#00e0ff]">
                    5,240 veMGN
                  </h3>
                  <div className="flex justify-between items-center gap-7 w-full mt-4">
                    <h5 className="text-[#94a3b8] font-normal text-xs md:text-sm">
                      Claimable Rewards
                    </h5>
                    <span className="text-[#00ff9d] font-semibold text-xs md:text-sm">$124.5</span>
                  </div>
                  <button className="bg-[rgba(0,255,157,0.3)] border border-[#00ff9d] flex justify-center items-center w-full py-4 px-4 text-[#00ff9d]">
                    Claim Rewards
                  </button>
                </div>
              </FancyCard>
            </div>
          </div>
          <div className="w-full">
            <FancyCard>
              <h4 className="text-white font-semibold text-xl">Active Positions</h4>
            </FancyCard>
          </div>
        </div>
      ) : (
        <div className="w-full md:w-1/3 flex justify-center items-center my-20 flex-col py-5 gap-10">
          <div className="border-2 border-dashed border-[rgba(41,98,255,0.3)] flex justify-center items-center p-4">
            <WalletMinimalIcon size={90} color="#2962ff" />
          </div>
          <div className="w-full flex justify-center items-center flex-col py-2 gap-5">
            <h4 className="text-3xl md:text-4xl text-white font-extrabold">Connect Your Wallet</h4>
            <p className="text-[#94a3b8] font-normal text-sm md:text-xl text-center text-wrap w-full lg:w-132">
              Connect your wallet to view your portfolio, voting power, and active liquidity
              positions.
            </p>
          </div>
          <div className="w-full flex flex-col gap-7 justify-center items-center">
            <WalletConnectButton hasIcon className="w-[70%] space-x-4 py-4" />
            <p className="text-[#64748b] font-normal text-sm text-center text-wrap w-full lg:w-132">
              Supports MetaMask, WalletConnect, Coinbase Wallet & more
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
