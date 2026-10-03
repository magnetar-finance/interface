'use client';
import React from 'react';
import { TokenAnalyticsView } from '@/views/analytics/TokenAnalyticsView';

export default function Page({ params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = React.use(params);
  return (
    <main className="w-full pb-8">
      <TokenAnalyticsView tokenId={tokenId} />
    </main>
  );
}
