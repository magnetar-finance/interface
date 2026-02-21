"use client";

import { ConnectWalletPromptView } from "@/views/dashboard/ConnectWalletPromptView";
import { MainView } from "@/views/dashboard/MainView";
import { PositionsView } from "@/views/dashboard/PositionsView";
import { useConnection } from "wagmi";

export default function Home() {
  const { isConnected } = useConnection();
  return (
    <main className="w-full flex justify-center items-center">
      {isConnected ? (
        <div className="flex flex-col justify-center items-start gap-5 md:gap-12 w-full">
          <MainView />
          <PositionsView />
        </div>
      ) : (
        <ConnectWalletPromptView />
      )}
    </main>
  );
}
