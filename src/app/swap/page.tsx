'use client';

import { MainView } from '@/views/swap/MainView';
import { PageHeader } from '@/components/PageHeader';

export default function Page() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full max-w-lg">
        <PageHeader
          align="center"
          title="Swap"
          subtitle="Trade tokens instantly at the best available rate"
        />
      </div>
      <MainView />
    </main>
  );
}
