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
import { useAtom } from 'jotai';
import { deadlineAtom, slippageToleranceAtom } from '@/store';

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
  const [slippage, setSlippage] = useAtom(slippageToleranceAtom);
  const [deadline, setDeadline] = useAtom(deadlineAtom);

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
          className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent group"
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
              <h2 className="text-xl font-bold tracking-tight text-foreground">Add liquidity</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-muted hover:text-accent transition-colors p-2"
              >
                <SettingsIcon size={20} />
              </button>
            </div>

            {/* Settings Panel (Inline) */}
            {showSettings && (
              <div className="mb-6 flex w-full flex-col gap-4 rounded-2xl border border-white/[0.06] bg-background/50 p-4 backdrop-blur-md">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted text-xs font-semibold">Slippage Tolerance</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['0.1', '0.25', '0.5', '1.0'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSlippage(parseFloat(val))}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 font-sans ${
                          slippage === parseFloat(val) &&
                          !['0.1', '0.25', '0.5', '1.0'].includes(slippage.toString()) === false
                            ? 'bg-accent text-accent-ink'
                            : 'bg-white/5 text-muted hover:bg-white/10 hover:text-foreground border border-transparent'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                    <div
                      className={`flex items-center border px-2 py-1 gap-1 flex-1 min-w-20 rounded-lg ${
                        !['0.1', '0.25', '0.5', '1.0'].includes(slippage.toString())
                          ? 'border-accent'
                          : 'border-white/10'
                      }`}
                    >
                      <input
                        type="number"
                        min="0.01"
                        max="50"
                        step="0.1"
                        className="bg-transparent text-foreground text-xs w-full outline-none placeholder:text-muted"
                        placeholder="Custom"
                        value={
                          ['0.1', '0.25', '0.5', '1.0'].includes(slippage.toString())
                            ? ''
                            : slippage
                        }
                        onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-muted text-xs">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-xs font-semibold">TX Deadline (Mins)</span>
                    <input
                      type="number"
                      value={deadline}
                      onChange={(e) => setDeadline(parseInt(e.target.value) || 0)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-foreground text-xs font-mono w-20 outline-none focus:border-accent transition-colors text-right"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode Tabs */}
            <div className="mb-2 flex w-full rounded-2xl border border-white/[0.06] bg-background/50 p-1">
              <button
                onClick={() => setActiveTab('STANDARD')}
                className={`flex-1 py-2 text-sm font-bold tracking-wide transition-all duration-200 rounded-lg ${
                  activeTab === 'STANDARD'
                    ? 'bg-accent text-accent-ink'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setActiveTab('CONCENTRATED')}
                className={`flex-1 py-2 text-sm font-bold tracking-wide transition-all duration-200 rounded-lg ${
                  activeTab === 'CONCENTRATED'
                    ? 'bg-accent text-accent-ink'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
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
