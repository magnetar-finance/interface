'use client';
import React from 'react';
import { PoolAnalyticsView } from '@/views/analytics/PoolAnalyticsView';

export default function Page({ params }: { params: Promise<{ poolId: string }> }) {
  const { poolId } = React.use(params);
  return (
    <main className="w-full pb-8">
      <PoolAnalyticsView poolId={poolId} />
    </main>
  );
}
