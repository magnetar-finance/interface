import abi from '@/abis/ve.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION, VE } from '@/constants';
import { useMemo } from 'react';
import { useChainId, useReadContract } from 'wagmi';

function useGetLockVP(tokenId: bigint, refetchInterval: number = DEFAULT_PROCESS_DURATION) {
  const chainId = useChainId();
  const ve = useMemo(() => VE[chainId], [chainId]);
  const { data = BI_ZERO } = useReadContract({
    abi,
    address: ve,
    functionName: 'balanceOfNFT',
    args: [tokenId],
    query: { refetchInterval, enabled: tokenId !== BI_ZERO },
  });
  return data;
}

export default useGetLockVP;
