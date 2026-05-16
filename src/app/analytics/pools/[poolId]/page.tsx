"use client";
import React from "react";
import { PoolAnalyticsView } from "@/views/analytics/PoolAnalyticsView";

export default function Page({ params }: { params: Promise<{ poolId: string }> }) {
  const { poolId } = React.use(params);
  return (
    <main className="w-full px-4 md:px-8 mt-10 md:mt-14 pb-20">
      <PoolAnalyticsView poolId={poolId} />
    </main>
  );
}
