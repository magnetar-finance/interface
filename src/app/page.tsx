"use client";

import { ConnectWalletPromptView } from "@/views/dashboard/ConnectWalletPromptView";
import { MainView } from "@/views/dashboard/MainView";
import { PositionsView } from "@/views/dashboard/PositionsView";
import { PageHeader } from "@/components/PageHeader";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <main className="w-full flex justify-center items-center">
      {isConnected ? (
        <div className="flex flex-col justify-center items-start gap-5 md:gap-12 w-full">
          <PageHeader
            title="Dashboard"
            subtitle="Your positions, rewards & voting power"
            chips={[{ label: "Live", color: "green" }]}
          />
          <MainView />
          <PositionsView />
        </div>
      ) : (
        <ConnectWalletPromptView />
      )}
    </main>
  );
}
