import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { AssetResponseType } from '@/config/github-assets.config';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { GetAccountInfoQuery } from '@/gql/codegen/graphql';

type LiquidityPosition = NonNullable<GetAccountInfoQuery['user']>['lpPositions'][number];

export interface IncreaseLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: LiquidityPosition | null;
  token0?: AssetResponseType[number];
  token1?: AssetResponseType[number];
}

export const IncreaseLiquidityModal: React.FC<IncreaseLiquidityModalProps> = ({
  open,
  onOpenChange,
  position,
  token0,
  token1,
}) => {
  const [amount0, setAmount0] = useState<string>('');
  const [amount1, setAmount1] = useState<string>('');

  const poolName = position?.pool?.name || 'Unknown Pool';

  const isInvalid = !amount0 && !amount1;

  // Clear state when modal closes
  useEffect(() => {
    if (!open) {
      setAmount0('');
      setAmount1('');
    }
  }, [open]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Increase Liquidity">
      <div className="flex flex-col p-5 gap-6">
        <div className="flex justify-between items-center w-full">
          <span className="text-[#94a3b8] font-semibold text-sm">Pool</span>
          <span className="text-white font-bold text-sm tracking-wide">{poolName}</span>
        </div>

        {/* Amount Input Section */}
        <div className="flex flex-col gap-4">
          <span className="text-[#94a3b8] text-sm font-semibold">Amounts</span>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-black border border-white/10 p-3 h-[60px]">
              <div className="flex items-center gap-2 max-w-[120px] w-[120px]">
                {token0?.logoURI ? (
                  <Image
                    src={token0.logoURI}
                    alt={token0?.symbol || 'Token 0'}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 bg-white/10"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-[10px] font-bold">T0</span>
                  </div>
                )}
                <span className="text-white font-bold text-sm">
                  {token0?.symbol || position?.pool?.token0?.symbol || 'Token 0'}
                </span>
              </div>
              <input
                type="number"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-white font-mono text-xl outline-none text-right flex-1 min-w-0"
              />
            </div>

            <div className="flex justify-between items-center bg-black border border-white/10 p-3 h-[60px]">
              <div className="flex items-center gap-2 max-w-[120px] w-[120px]">
                {token1?.logoURI ? (
                  <Image
                    src={token1.logoURI}
                    alt={token1?.symbol || 'Token 1'}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 bg-white/10"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 text-[10px] font-bold">T1</span>
                  </div>
                )}
                <span className="text-white font-bold text-sm">
                  {token1?.symbol || position?.pool?.token1?.symbol || 'Token 1'}
                </span>
              </div>
              <input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-white font-mono text-xl outline-none text-right flex-1 min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <PrimaryButton
          disabled={isInvalid}
          className="w-full py-4 uppercase tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            onOpenChange(false);
            setAmount0('');
            setAmount1('');
          }}
        >
          {!amount0 && !amount1 ? 'Enter Amounts' : 'Increase Liquidity'}
        </PrimaryButton>
      </div>
    </Modal>
  );
};
