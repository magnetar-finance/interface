import { WalletConnectButton } from "@/components/Button";
import { WalletMinimalIcon } from "lucide-react";
import React from "react";

export const ConnectWalletPromptView: React.FC = () => (
  <div className="w-full md:w-1/3 flex justify-center items-center my-20 flex-col py-5 gap-10">
    <div className="border-2 border-dashed border-[rgba(41,98,255,0.3)] flex justify-center items-center p-4">
      <WalletMinimalIcon size={90} color="#2962ff" />
    </div>
    <div className="w-full flex justify-center items-center flex-col py-2 gap-5">
      <h4 className="text-3xl md:text-4xl text-white font-extrabold">Connect Your Wallet</h4>
      <p className="text-[#94a3b8] font-normal text-sm md:text-xl text-center text-wrap w-full lg:w-132">
        Connect your wallet to view your portfolio, voting power, and active liquidity positions.
      </p>
    </div>
    <div className="w-full flex flex-col gap-7 justify-center items-center">
      <WalletConnectButton hasIcon className="w-[70%] space-x-4 py-4" />
      <p className="text-[#64748b] font-normal text-sm text-center text-wrap w-full lg:w-132">
        Supports MetaMask, WalletConnect, Coinbase Wallet & more
      </p>
    </div>
  </div>
);
