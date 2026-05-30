'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MainView } from '@/views/vote/MainView';

// Standard ve(3,3) epochs are 1 week long. Using a placeholder start date (Jan 1, 2025) for accurate counting
const START_TIMESTAMP = 1735689600; // Jan 1, 2025
const SECONDS_PER_EPOCH = 604800; // 7 days in seconds

export default function Page() {
  const [epochInfo, setEpochInfo] = useState({ current: 1, countdown: '' });

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsedSinceStart = now - START_TIMESTAMP;
      const currentEpoch = Math.max(1, Math.floor(elapsedSinceStart / SECONDS_PER_EPOCH));

      const nextEpochStart = START_TIMESTAMP + currentEpoch * SECONDS_PER_EPOCH;
      const remainingSeconds = Math.max(0, nextEpochStart - now);

      const days = Math.floor(remainingSeconds / 86400);
      const hours = Math.floor((remainingSeconds % 86400) / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      const countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      setEpochInfo({ current: currentEpoch, countdown });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="w-full flex flex-col gap-8 mt-10 md:mt-14 px-4 md:px-8">
      <PageHeader
        title="Vote"
        subtitle="Direct MAG emissions to your favourite pools each epoch"
        chips={[
          { label: `Epoch ${epochInfo.current}`, color: 'amber' },
          {
            label: `Enters next epoch in ${epochInfo.countdown || '--d --h --m --s'}`,
            color: 'amber',
          },
          { label: 'Epoch Voting', color: 'blue' },
          { label: 'Live', color: 'green' },
        ]}
      />
      <MainView />
    </main>
  );
}
