'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { DropdownMenu } from 'radix-ui';
import { FancyCard } from '@/components/Card';
import { PrimaryButton } from '@/components/Button';
import { TokenSelectModal } from '@/ui/modals/TokenSelectModal';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { BI_ZERO, CHAINS_INFORMATION, OP_SETTINGS, REFETCH_INTERVALS } from '@/constants';
import useAllPools from '@/hooks/api/useAllPools';
import { AssetResponseType } from '@/config/github-assets.config';
import { ChevronDownIcon } from 'lucide-react';
import { PoolType } from '@/gql/codegen/graphql';
import useGetAllowance from '@/hooks/wallet/useGetAllowance';
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem';
import useApproveSpend from '@/hooks/wallet/useApproveSpend';
import useNotifyRewardAmount from '@/hooks/rewards/bribes/useNotifyReward';
import { useChainId } from 'wagmi';
import useGetBalance from '@/hooks/wallet/useGetBalance';
import { Spinner } from '@/components/Spinner';
import { TransactionSuccessModal } from '@/ui/modals/TransactionSuccessModal';
import { TransactionErrorModal } from '@/ui/modals/TransactionErrorModal';
import { formatNumber } from '@/utils';

// Helper component for Pool Badge
const PoolBadge: React.FC<{ type: PoolType; className?: string }> = ({ type, className = '' }) => {
  const color =
    type === 'STABLE'
      ? 'bg-[#00ff9d]/10 text-[#00ff9d]'
      : type === 'VOLATILE'
      ? 'bg-[#ffaf52]/10 text-[#ffaf52]'
      : 'bg-[#2962ff]/10 text-[#2962ff]';
  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap ${color} ${className}`}
    >
      {type.toLowerCase()}
    </span>
  );
};

export const MainView: React.FC = () => {
  const { assetsDictionary } = useGHAssetsContext();
  const { data: pools, isLoading: poolsLoading } = useAllPools(
    0,
    OP_SETTINGS.default_gql_items_limit,
    OP_SETTINGS.default_refetch_interval,
  );
  const viablePools = useMemo(
    () => pools.filter((pool) => pool.gauge !== null && typeof pool.gauge !== 'undefined'),
    [pools],
  );

  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<AssetResponseType[number] | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Derived selections
  const selectedPool = useMemo(
    () => viablePools.find((p) => p.id === selectedPoolId),
    [viablePools, selectedPoolId],
  );

  const token0Info = selectedPool
    ? assetsDictionary[(selectedPool.token0.address as string).toLowerCase()]
    : null;
  const token1Info = selectedPool
    ? assetsDictionary[(selectedPool.token1.address as string).toLowerCase()]
    : null;

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const amountBI = useMemo(
    () => parseUnits(amount || '0', selectedToken?.decimals || 18),
    [amount, selectedToken?.decimals],
  );
  const balance = useGetBalance(selectedToken?.address || zeroAddress, REFETCH_INTERVALS);

  const chainId = useChainId();

  // Check bribe allowance
  const bribeAllowance = useGetAllowance(
    selectedToken?.address,
    selectedPool?.gauge?.bribeVotingReward as Address,
  );
  const bribeApproval = useApproveSpend(
    selectedToken?.address || zeroAddress,
    (selectedPool?.gauge?.bribeVotingReward as Address) || zeroAddress,
    amountBI,
  );

  const incentivize = useNotifyRewardAmount(
    (selectedPool?.gauge?.bribeVotingReward as Address) || zeroAddress,
    selectedToken?.address || zeroAddress,
    amountBI,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  const initiateTransaction = useCallback(() => {
    if (bribeAllowance < amountBI) {
      bribeApproval.reset();
      return bribeApproval.execute();
    }

    return incentivize.execute();
  }, [amountBI, bribeAllowance, bribeApproval, incentivize]);

  const buttonText = useMemo(() => {
    if (!amount || amountBI === BI_ZERO) return 'Enter a valid amount';
    if (amountBI > balance) return 'Insufficient balance';
    if (bribeAllowance < amountBI) return `Approve to spend ${selectedToken?.symbol}`;
    return 'Incentivize';
  }, [amount, amountBI, balance, bribeAllowance, selectedToken?.symbol]);

  // Simple validation for form state
  const isValid = selectedPool && selectedToken && parseFloat(amount) > 0 && amountBI <= balance;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <FancyCard>
        <div className="flex flex-col gap-6 w-full">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h3 className="text-white font-bold font-mono text-sm uppercase tracking-widest">
              Add Incentive
            </h3>
            <p className="text-[#64748b] font-mono text-xs leading-relaxed">
              Incentivize a gauge pool by adding tokens. This attracts veMGN voters to direct more
              MAG emissions toward your pool.
            </p>
          </div>

          {/* Form Content */}
          <div className="flex flex-col gap-5">
            {/* Pool Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                Target Pool
              </label>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    disabled={poolsLoading}
                    className="flex justify-between items-center w-full px-4 py-3 bg-black border border-white/10 hover:border-[#2962ff]/50 transition-colors cursor-pointer outline-none font-mono text-xs"
                  >
                    {!selectedPool ? (
                      <span className="text-[#94a3b8]">
                        {poolsLoading ? 'Loading pools...' : 'Select a pool...'}
                      </span>
                    ) : (
                      <div className="flex flex-row items-center gap-2.5">
                        <div className="-space-x-2 flex">
                          {token0Info ? (
                            <Image
                              src={token0Info.logoURI}
                              alt="T0"
                              width={16}
                              height={16}
                              className="w-4 h-4 rounded-full bg-white"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-white/20" />
                          )}
                          {token1Info ? (
                            <Image
                              src={token1Info.logoURI}
                              alt="T1"
                              width={16}
                              height={16}
                              className="w-4 h-4 rounded-full bg-white"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-white/20" />
                          )}
                        </div>
                        <span className="text-white font-bold">{selectedPool.name}</span>
                        <PoolBadge type={selectedPool.poolType} />
                      </div>
                    )}
                    <ChevronDownIcon size={14} className="text-[#64748b]" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    sideOffset={4}
                    className="w-(--radix-popper-anchor-width) max-h-64 overflow-y-auto bg-black border border-[#2962ff]/30 py-1 shadow-xl z-50 font-mono text-xs"
                  >
                    {viablePools.map((pool) => {
                      const t0 = assetsDictionary[(pool.token0.address as string).toLowerCase()];
                      const t1 = assetsDictionary[(pool.token1.address as string).toLowerCase()];
                      return (
                        <DropdownMenu.Item
                          key={pool.id}
                          className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer outline-none hover:bg-white/5 data-highlighted:bg-white/5 transition-colors"
                          onClick={() => setSelectedPoolId(pool.id)}
                        >
                          <div className="-space-x-2 flex">
                            {t0 ? (
                              <Image
                                src={t0.logoURI}
                                alt="T0"
                                width={16}
                                height={16}
                                className="w-4 h-4 rounded-full bg-white"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-white/20" />
                            )}
                            {t1 ? (
                              <Image
                                src={t1.logoURI}
                                alt="T1"
                                width={16}
                                height={16}
                                className="w-4 h-4 rounded-full bg-white"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-white/20" />
                            )}
                          </div>
                          <span className="font-bold text-white uppercase">{pool.name}</span>
                          <PoolBadge type={pool.poolType} className="ml-auto" />
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            {/* Token & Amount */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
                  Incentive Amount
                </label>
                {/* Balance mocked for now, would use GetBalance on selectedToken */}
                <span className="text-[#64748b] font-mono text-[10px]">
                  Balance:{' '}
                  <span className="text-white">
                    {formatNumber(formatUnits(balance, selectedToken?.decimals || 18))}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 bg-black border border-white/10 p-2 focus-within:border-[#2962ff] focus-within:shadow-[0_0_15px_rgba(41,98,255,0.2)] transition-all duration-300 h-14">
                <button
                  onClick={() => setIsTokenModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors rounded-sm"
                >
                  {selectedToken ? (
                    <>
                      {selectedToken.logoURI ? (
                        <Image
                          src={selectedToken.logoURI}
                          alt={selectedToken.symbol}
                          width={20}
                          height={20}
                          className="rounded-full w-5 h-5 bg-white/10"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-[8px] font-bold">Tk</span>
                        </div>
                      )}
                      <span className="text-white font-bold font-mono text-sm">
                        {selectedToken.symbol}
                      </span>
                    </>
                  ) : (
                    <span className="text-white font-bold font-mono text-sm">Select Token</span>
                  )}
                  <ChevronDownIcon size={14} className="text-[#94a3b8]" />
                </button>
                <div className="w-px h-6 bg-white/10" />
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent px-3 flex-1 min-w-0 outline-none text-white font-mono text-lg text-right"
                />
              </div>

              {/* Quick percentages */}
              <div className="flex gap-1.5 mt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() =>
                      setAmount(
                        String(
                          (pct * parseFloat(formatUnits(balance, selectedToken?.decimals || 18))) /
                            100,
                        ),
                      )
                    }
                    className="flex-1 py-1 border border-white/10 text-[#94a3b8] hover:text-[#2962ff] hover:border-[#2962ff]/50 transition-colors font-mono text-[10px]"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <PrimaryButton
              className="w-full mt-2 py-3.5 gap-2 uppercase tracking-widest font-mono text-xs disabled:opacity-40"
              disabled={!isValid}
              onClick={initiateTransaction}
            >
              {buttonText}{' '}
              {(incentivize.isLoading || bribeApproval.isLoading) && (
                <Spinner size="sm" className="ml-2" />
              )}
            </PrimaryButton>
          </div>
        </div>
      </FancyCard>

      <TokenSelectModal
        open={isTokenModalOpen}
        onOpenChange={setIsTokenModalOpen}
        selectedToken={selectedToken}
        onTokenSelect={(token) => {
          setSelectedToken(token);
          // Auto clear amount context if token changes
          setAmount('');
        }}
      />

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          incentivize.reset();
          bribeApproval.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Successfully transfered lock!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          incentivize.reset();
          bribeApproval.reset();
        }}
        message={'An error occurred while transfering lock. Please try again.'}
        title="Transaction Failed"
      />
    </div>
  );
};
