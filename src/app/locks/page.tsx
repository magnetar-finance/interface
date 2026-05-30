'use client';

import { PageHeader } from '@/components/PageHeader';
import { MainView } from '@/views/locks/MainView';

export default function Page() {
  return (
    <main className="w-full flex flex-col gap-8 mt-10 md:mt-14 px-4 md:px-8">
      <PageHeader
        title="Locks"
        subtitle="Lock MGN to earn veMGN voting power and direct emissions"
        chips={[
          { label: 've(3,3)', color: 'blue' },
          { label: 'Live', color: 'green' },
        ]}
      />
      <MainView />
    </main>
  );
}
