'use client';

import React from 'react';
import { FancyCard } from '@/components/Card';
import { Table } from '@/components/Table';
import { GiftIcon, LockIcon } from 'lucide-react';

type MockRewardRow = {
  id: string;
  pool: string;
  poolType: string;
  token0Symbol: string;
  token1Symbol: string;
  valueAPR: string;
  rewards: string;
};

const MOCK_ROWS: MockRewardRow[] = [
  {
    id: '1',
    pool: 'ETH / USDC',
    poolType: 'CONCENTRATED',
    token0Symbol: 'ETH',
    token1Symbol: 'USDC',
    valueAPR: '12.40%',
    rewards: '$0.00',
  },
  {
    id: '2',
    pool: 'WBTC / ETH',
    poolType: 'VOLATILE',
    token0Symbol: 'WBTC',
    token1Symbol: 'ETH',
    valueAPR: '8.20%',
    rewards: '$0.00',
  },
  {
    id: '3',
    pool: 'USDC / USDT',
    poolType: 'STABLE',
    token0Symbol: 'USDC',
    token1Symbol: 'USDT',
    valueAPR: '4.50%',
    rewards: '$0.00',
  },
];

const POOL_TYPE_COLORS: Record<string, string> = {
  STABLE: 'text-[#00ff9d] bg-[#00ff9d]/10',
  VOLATILE: 'text-[#ffaf52] bg-[#ffaf52]/10',
  CONCENTRATED: 'text-[#2962ff] bg-[#2962ff]/10',
};

export const RewardsView: React.FC = () => {
  return (
    <div className="w-full">
      <FancyCard>
        <div className="flex flex-col gap-3 py-3 w-full justify-start items-center">
          {/* Header */}
          <div className="w-full flex justify-between items-center gap-6">
            <h4 className="text-white font-semibold text-lg md:text-xl">Rewards</h4>
            <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#2962ff]/40 text-[#2962ff]/70 bg-[#2962ff]/5">
              Coming Soon
            </span>
          </div>

          {/* Blurred table with overlay */}
          <div className="relative w-full mt-2">
            {/* Blurred mock table */}
            <div className="blur-sm pointer-events-none select-none">
              <Table<MockRewardRow>
                headers={[
                  { label: 'Pool', align: 'left' },
                  { label: 'Value APR', align: 'right' },
                  { label: 'Rewards', align: 'right' },
                  { label: 'Actions', align: 'right' },
                ]}
                data={MOCK_ROWS}
                renderRow={(item) => (
                  <>
                    {/* Pool */}
                    <td className="py-3 pr-4">
                      <div className="flex justify-start items-center gap-3">
                        <div className="-space-x-3 flex">
                          <div className="w-6 h-6 rounded-full border border-black bg-amber-100" />
                          <div className="w-6 h-6 rounded-full border border-black bg-blue-100" />
                        </div>
                        <div className="flex flex-col gap-0 justify-start items-start">
                          <h3 className="font-bold text-white uppercase whitespace-nowrap">
                            {item.pool}
                          </h3>
                          <span
                            className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 hidden sm:block ${
                              POOL_TYPE_COLORS[item.poolType]
                            }`}
                          >
                            {item.poolType.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Value APR */}
                    <td className="py-3 pr-4 text-[#00ff9d] font-bold text-right">
                      {item.valueAPR}
                    </td>

                    {/* Rewards */}
                    <td className="py-3 pr-4 text-[#ffaf52] font-bold text-right">
                      {item.rewards}
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <button
                        disabled
                        className="text-xs font-mono uppercase tracking-widest border border-[#2962ff]/30 text-[#2962ff]/60 px-3 py-1.5 cursor-not-allowed"
                      >
                        Claim
                      </button>
                    </td>
                  </>
                )}
              />
            </div>

            {/* Coming soon overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 z-10">
              <div className="border-2 border-dashed border-white/10 flex justify-center items-center p-4">
                <LockIcon size={48} color="#64748b" />
              </div>
              <div className="flex flex-col justify-center items-center gap-2 text-center">
                <h4 className="text-2xl md:text-3xl text-white font-extrabold">Coming Soon</h4>
                <p className="text-[#94a3b8] font-normal text-sm md:text-base max-w-sm">
                  Gauge rewards and veToken incentives are not yet available. Check back soon.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#64748b] text-xs font-mono uppercase tracking-widest">
                <GiftIcon size={12} />
                <span>Rewards will be distributed via gauges</span>
              </div>
            </div>
          </div>
        </div>
      </FancyCard>
    </div>
  );
};
