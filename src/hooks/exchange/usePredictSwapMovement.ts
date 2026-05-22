import autoSwapAbi from '@/abis/auto-swap.abi';
import v2SwapAbi from '@/abis/v2-swap.abi';
import clSwapAbi from '@/abis/cl-swap.abi';
import {
  AUTO_SWAP_EXECUTORS,
  ETHER,
  RouterType,
  V2_SWAP_EXECUTORS,
  V3_SWAP_EXECUTORS,
  WETH,
} from '@/constants';
import { routerTypeAtom } from '@/store';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { Address, zeroAddress } from 'viem';
import { useChainId, useReadContract } from 'wagmi';

function usePredictSwapMovement(
  token0: Address,
  token1: Address,
  amountIn: bigint,
  enabled: boolean = true,
  refetchInterval: number | false = false,
) {
  const [routerType] = useAtom(routerTypeAtom);
  const chainId = useChainId();
  const t0 = useMemo(
    () => (token0.toLowerCase() === ETHER.toLowerCase() ? WETH[chainId] : token0),
    [chainId, token0],
  );
  const t1 = useMemo(
    () => (token1.toLowerCase() === ETHER.toLowerCase() ? WETH[chainId] : token1),
    [chainId, token1],
  );
  const routerAddress = useMemo(() => {
    let router = AUTO_SWAP_EXECUTORS[chainId];

    switch (routerType) {
      case RouterType.AUTO:
        router = AUTO_SWAP_EXECUTORS[chainId];
        break;
      case RouterType.V2:
        router = V2_SWAP_EXECUTORS[chainId];
        break;
      case RouterType.V3:
        router = V3_SWAP_EXECUTORS[chainId];
        break;
    }
    return router;
  }, [chainId, routerType]);

  const { data, isFetching } = useReadContract({
    abi:
      routerType === RouterType.AUTO
        ? autoSwapAbi
        : routerType === RouterType.V2
        ? v2SwapAbi
        : clSwapAbi,
    functionName: 'findBestRoute',
    args: [t0, t1, amountIn],
    address: routerAddress,
    query: {
      refetchInterval,
      enabled: token0 !== zeroAddress && token1 !== zeroAddress && enabled,
    },
  });

  return { data: data || [], isLoading: isFetching };
}

export default usePredictSwapMovement;
