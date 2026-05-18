'use client';
import { MainView } from '@/views/liquidity/deposit/MainView';
import { Suspense } from 'react';

export default function Page() {
  return (
    <main className="w-full flex justify-center items-center mt-10 md:mt-14">
      <Suspense
        fallback={<div className="w-full h-96 flex justify-center items-center">Loading...</div>}
      >
        <MainView />
      </Suspense>
    </main>
  );
}
