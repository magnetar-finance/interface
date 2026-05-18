'use client';

import { PrimaryButton, WalletConnectButton } from '@/components/Button';
import { SwitchGroup } from '@/components/SwitchGroup';
import { AssetResponseType } from '@/config/github-assets.config';
import { TokenSelectModal } from '@/ui/modals/TokenSelectModal';
import { PlusIcon } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { TokenInputRow } from './components/TokenInputRow';

export const StandardDepositView: React.FC<{
  initialTokenA: AssetResponseType[number] | null;
  initialTokenB: AssetResponseType[number] | null;
  initialPoolTypeIndex: number;
}> = ({ initialTokenA, initialTokenB, initialPoolTypeIndex }) => {
  const { isConnected } = useAccount();

  const [tokenA, setTokenA] = useState<AssetResponseType[number] | null>(initialTokenA);
  const [tokenB, setTokenB] = useState<AssetResponseType[number] | null>(initialTokenB);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  // Standard Pools only support Stable (0) or Volatile (1).
  // If concentrated was passed, default to volatile.
  const [activePoolTypeIndex, setActivePoolTypeIndex] = useState(
    initialPoolTypeIndex === 0 ? 0 : 1,
  );

  const [modalType, setModalType] = useState<'A' | 'B' | null>(null);

  const handleTokenSelect = useCallback(
    (token: AssetResponseType[number]) => {
      if (modalType === 'A') {
        if (tokenB?.address === token.address) setTokenB(tokenA);
        setTokenA(token);
      } else {
        if (tokenA?.address === token.address) setTokenA(tokenB);
        setTokenB(token);
      }
    },
    [modalType, tokenA, tokenB],
  );

  const isSupplyDisabled = useMemo(() => {
    if (!tokenA || !tokenB) return true;
    if (!amountA && !amountB) return true;
    if (parseFloat(amountA || '0') <= 0 && parseFloat(amountB || '0') <= 0) return true;
    return false;
  }, [tokenA, tokenB, amountA, amountB]);

  const buttonText = useMemo(() => {
    if (!tokenA || !tokenB) return 'Select tokens';
    if (!amountA && !amountB) return 'Enter an amount';
    return 'Supply Standard Liquidity';
  }, [tokenA, tokenB, amountA, amountB]);

  return (
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Type Selector */}
      <div className="w-full relative z-10">
        <SwitchGroup
          switchLabels={['Stable', 'Volatile']}
          activeSwitchIndex={activePoolTypeIndex}
          onSwitchClicked={setActivePoolTypeIndex}
          fullWidth
        />
      </div>

      <div className="w-full flex flex-col relative gap-1">
        {/* First Token */}
        <TokenInputRow
          label="Token A"
          token={tokenA}
          amount={amountA}
          onAmountChange={setAmountA}
          onSelectClick={() => setModalType('A')}
          usdValue={amountA ? `≈ $${(parseFloat(amountA) * 1.5).toFixed(2)}` : '$0.00'}
        />

        {/* Plus Divider */}
        <div className="w-full flex justify-center -my-3 z-10">
          <div className="bg-[#050508] border border-[#2962ff]/30 p-1">
            <div className="bg-black border border-[#2962ff]/50 p-1 flex justify-center items-center text-[#2962ff]">
              <PlusIcon size={16} />
            </div>
          </div>
        </div>

        {/* Second Token */}
        <TokenInputRow
          label="Token B"
          token={tokenB}
          amount={amountB}
          onAmountChange={setAmountB}
          onSelectClick={() => setModalType('B')}
          usdValue={amountB ? `≈ $${(parseFloat(amountB) * 1.5).toFixed(2)}` : '$0.00'}
        />
      </div>

      {/* Action Button */}
      <div className="w-full">
        {isConnected ? (
          <PrimaryButton
            disabled={isSupplyDisabled && isConnected}
            className="w-full py-4 text-base tracking-widest font-bold"
          >
            {buttonText}
          </PrimaryButton>
        ) : (
          <WalletConnectButton className="w-full py-4 tracking-widest font-bold" />
        )}
      </div>

      {/* Select Token Modal */}
      <TokenSelectModal
        open={modalType !== null}
        onOpenChange={(v) => !v && setModalType(null)}
        selectedToken={null}
        disabledToken={modalType === 'A' ? tokenB : tokenA}
        onTokenSelect={handleTokenSelect}
      />
    </div>
  );
};
