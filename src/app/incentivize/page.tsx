'use client';

import { PageHeader } from '@/components/PageHeader';
import { MainView } from '@/views/incentivize/MainView';

export default function Page() {
  return (
    <main className="w-full flex flex-col gap-8 mt-10 md:mt-14 px-4 md:px-8">
      <PageHeader
        title="Incentivize"
        subtitle="Add bribes to attract votes & boost your pool"
        chips={[
          { label: 'Bribe Market', color: 'blue' },
          { label: 'Live', color: 'green' },
        ]}
      />
      <MainView />
    </main>
  );
}
