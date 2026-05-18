/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { FancyCard } from '@/components/Card';
import { AssetResponseType } from '@/config/github-assets.config';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { PoolType } from '@/utils/http-api';
import { ArrowLeftIcon, SettingsIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ConcentratedDepositView } from './ConcentratedDepositView';
import { StandardDepositView } from './StandardDepositView';

export const MainView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assetsDictionary } = useGHAssetsContext();

  const [initialTokenA, setInitialTokenA] = useState<AssetResponseType[number] | null>(null);
  const [initialTokenB, setInitialTokenB] = useState<AssetResponseType[number] | null>(null);
  const [initialPoolTypeIndex, setInitialPoolTypeIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<'STANDARD' | 'CONCENTRATED'>('STANDARD');

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [deadline, setDeadline] = useState('20');

  // Parse URL Parameters once
  useEffect(() => {
    const t0 = searchParams.get('token0');
    const t1 = searchParams.get('token1');
    const pType = searchParams.get('poolType');

    if (t0 && assetsDictionary[t0.toLowerCase()]) {
      setInitialTokenA(assetsDictionary[t0.toLowerCase()]);
    }
    if (t1 && assetsDictionary[t1.toLowerCase()]) {
      setInitialTokenB(assetsDictionary[t1.toLowerCase()]);
    }
    if (pType) {
      if (pType.toLowerCase() === PoolType.CONCENTRATED.toLowerCase()) {
        setActiveTab('CONCENTRATED');
      } else {
        setActiveTab('STANDARD');
        setInitialPoolTypeIndex(pType.toLowerCase() === PoolType.VOLATILE.toLowerCase() ? 1 : 0);
      }
    }
  }, [searchParams, assetsDictionary]);

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 mb-20 gap-4">
      {/* Return Navigation */}
      <div className="w-full max-w-lg flex justify-start mb-2">
        <button
          onClick={() => router.push('/liquidity')}
          className="flex items-center gap-2 text-[#94a3b8] hover:text-[#00ff9d] transition-colors group font-mono text-sm uppercase font-bold tracking-widest"
        >
          <ArrowLeftIcon size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Pools</span>
        </button>
      </div>

      <div className="w-full max-w-lg">
        <FancyCard>
          <div className="w-full flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="text-white font-bold text-xl tracking-wide uppercase">
                Add Liquidity
              </h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-[#64748b] hover:text-[#2962ff] transition-colors p-2"
              >
                <SettingsIcon size={20} />
              </button>
            </div>

            {/* Settings Panel (Inline) */}
            {showSettings && (
              <div className="w-full bg-[#050508] border border-[#2962ff]/30 p-4 mb-6 space-y-4 shadow-[0_0_15px_rgba(41,98,255,0.1)]">
                <div className="space-y-2">
                  <span className="text-[#64748b] text-xs font-bold uppercase tracking-widest">
                    Slippage Tolerance
                  </span>
                  <div className="flex gap-2">
                    {['0.1', '0.5', '1.0'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSlippage(val)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold transition-colors ${
                          slippage === val
                            ? 'bg-[#2962ff] text-white'
                            : 'bg-black border border-white/10 text-[#94a3b8] hover:border-[#2962ff]/50'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                    <div className="flex items-center bg-black border border-white/10 px-2 flex-1 focus-within:border-[#2962ff] transition-colors">
                      <input
                        type="text"
                        className="bg-transparent text-[#00ff9d] text-xs font-mono w-full outline-none text-right placeholder:text-[#64748b]/50 border-none ring-0 focus:outline-none"
                        placeholder="Custom"
                        value={['0.1', '0.5', '1.0'].includes(slippage) ? '' : slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                      />
                      <span className="text-[#2962ff] text-xs font-bold ml-1">%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 flex justify-between items-center">
                  <span className="text-[#64748b] text-xs font-bold uppercase tracking-widest">
                    TX Deadline (Mins)
                  </span>
                  <input
                    type="number"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-black border border-white/10 px-3 py-1.5 text-[#00ff9d] text-xs font-mono w-20 outline-none focus:border-[#2962ff] transition-colors text-right border-none ring-0"
                  />
                </div>
              </div>
            )}

            {/* Mode Tabs */}
            <div className="w-full flex border border-white/10 p-1 bg-[#050508] mb-2">
              <button
                onClick={() => setActiveTab('STANDARD')}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'STANDARD'
                    ? 'bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]'
                    : 'text-[#64748b] hover:text-[#94a3b8] border border-transparent'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setActiveTab('CONCENTRATED')}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'CONCENTRATED'
                    ? 'bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/50'
                    : 'text-[#64748b] hover:text-[#94a3b8] border border-transparent'
                }`}
              >
                Concentrated
              </button>
            </div>

            {/* Render Active Tab Content */}
            {activeTab === 'STANDARD' ? (
              <StandardDepositView
                initialTokenA={initialTokenA}
                initialTokenB={initialTokenB}
                initialPoolTypeIndex={initialPoolTypeIndex}
              />
            ) : (
              <ConcentratedDepositView
                initialTokenA={initialTokenA}
                initialTokenB={initialTokenB}
              />
            )}
          </div>
        </FancyCard>
      </div>
    </div>
  );
};
