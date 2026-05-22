import abi from '@/abis/router.abi';
import { BI_ZERO, V2_FACTORY, V2_ROUTERS } from '@/constants';
import { useMemo } from 'react';
import { Address, zeroAddress } from 'viem';
import { useChainId, useReadContract } from 'wagmi';

function useV2QuoteAddLiquidity(
  tokenA: Address,
  tokenB: Address,
  stable: boolean,
  amountADesired: bigint,
  amountBDesired: bigint,
) {
  const chainId = useChainId();
  const router = useMemo(() => V2_ROUTERS[chainId], [chainId]);
  const factory = useMemo(() => V2_FACTORY[chainId], [chainId]);
  const { data = [BI_ZERO, BI_ZERO, BI_ZERO], isLoading } = useReadContract({
    abi,
    address: router,
    functionName: 'quoteAddLiquidity',
    args: [tokenA, tokenB, stable, factory, amountADesired, amountBDesired],
    query: {
      enabled:
        !stable &&
        tokenA !== zeroAddress &&
        tokenB !== zeroAddress &&
        amountADesired > BI_ZERO &&
        amountBDesired > BI_ZERO,
    },
  });
  return { data, isLoading };
}

export default useV2QuoteAddLiquidity;
