"use client";

import { MainView } from "@/views/liquidity/main/MainView";
import { PageHeader } from "@/components/PageHeader";

export default function Liquidity() {
  return (
    <main className="w-full flex flex-col gap-6 mt-10 md:mt-14 px-4 md:px-8">
      <PageHeader
        title="Liquidity"
        subtitle="Deposit into pools to earn fees & gauge rewards"
        chips={[{ label: "ve(3,3)", color: "blue" }]}
      />
      <MainView />
    </main>
  );
}
