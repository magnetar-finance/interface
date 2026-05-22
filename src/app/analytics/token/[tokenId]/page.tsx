'use client';
import React from 'react';
import { TokenAnalyticsView } from '@/views/analytics/TokenAnalyticsView';

export default function Page({ params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = React.use(params);
  return (
    <main className="w-full px-4 md:px-8 mt-10 md:mt-14 pb-20">
      <TokenAnalyticsView tokenId={tokenId} />
    </main>
  );
}
