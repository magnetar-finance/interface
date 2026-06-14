'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MainView } from '@/views/vote/MainView';
import useNextVoteEpoch from '@/hooks/governance/useNextVoteEpoch';
import { REFETCH_INTERVALS, EPOCH_START_TIMESTAMP, SECONDS_PER_EPOCH } from '@/constants';

export default function Page() {
  const [epochInfo, setEpochInfo] = useState({ current: 1, countdown: '' });
  const nextEpochStart = useNextVoteEpoch(REFETCH_INTERVALS);

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsedSinceStart = now - EPOCH_START_TIMESTAMP;
      const currentEpoch = Math.max(1, Math.floor(elapsedSinceStart / SECONDS_PER_EPOCH));
      const remainingSeconds = Math.max(0, parseInt(nextEpochStart.toString()) - now);

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
  }, [nextEpochStart]);

  return (
    <main className="w-full flex flex-col gap-8 mt-10 md:mt-14 px-4 md:px-8">
      <PageHeader
        title="Vote"
        subtitle="Direct MGN emissions to your favourite pools each epoch"
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
