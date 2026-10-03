'use client';
import { MainView } from '@/views/liquidity/deposit/MainView';
import { Suspense } from 'react';

export default function Page() {
  return (
    <main className="flex w-full justify-center">
      <Suspense
        fallback={<div className="w-full h-96 flex justify-center items-center">Loading...</div>}
      >
        <MainView />
      </Suspense>
    </main>
  );
}
