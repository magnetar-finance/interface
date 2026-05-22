'use client';

import { MainView } from '@/views/swap/MainView';
import { PageHeader } from '@/components/PageHeader';

export default function Page() {
  return (
    <main className="w-full flex flex-col items-center gap-6 mt-10 md:mt-14 px-4 md:px-8">
      <div className="w-full max-w-lg">
        <PageHeader title="Swap" subtitle="Trade tokens instantly at best price" />
      </div>
      <MainView />
    </main>
  );
}
