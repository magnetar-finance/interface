'use client';

import { MainView } from '@/views/liquidity/main/MainView';
import { PageHeader } from '@/components/PageHeader';

export default function Liquidity() {
  return (
    <main className="flex w-full flex-col gap-6">
      <PageHeader
        title="Liquidity"
        subtitle="Deposit into pools to earn fees & gauge rewards"
        chips={[{ label: 've(3,3)', color: 'blue' }]}
      />
      <MainView />
    </main>
  );
}
