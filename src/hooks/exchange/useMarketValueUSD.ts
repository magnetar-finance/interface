import { BI_ZERO, ETHER, ORACLE, WETH } from '@/constants';
import { useMemo } from 'react';
import { Address, zeroAddress } from 'viem';
import { useChainId, useReadContract } from 'wagmi';
import abi from '@/abis/oracle.abi';

function useMarketValueUSD(
  token: Address = ETHER,
  value: bigint,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const oracle = useMemo(() => ORACLE[chainId], [chainId]);
  const tokenIn = useMemo(
    () => (token.toLowerCase() === ETHER.toLowerCase() ? WETH[chainId] : token),
    [chainId, token],
  );
  const { data = [BI_ZERO, BI_ZERO] } = useReadContract({
    abi,
    functionName: 'getAverageValueInUSD',
    args: [tokenIn, value],
    address: oracle,
    query: { refetchInterval, enabled: token !== zeroAddress && value > BI_ZERO },
  });
  return data;
}

export default useMarketValueUSD;
