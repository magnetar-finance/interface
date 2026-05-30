import abi from '@/abis/nfpm.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION, NFPM } from '@/constants';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useChainId, useReadContract } from 'wagmi';

function useGetCLPosition(tokenId: bigint, refetchInterval: number = DEFAULT_PROCESS_DURATION) {
  const chainId = useChainId();
  const nfpm = useMemo(() => NFPM[chainId], [chainId]);
  const {
    data = [
      BI_ZERO,
      zeroAddress,
      zeroAddress,
      zeroAddress,
      0,
      0,
      0,
      BI_ZERO,
      BI_ZERO,
      BI_ZERO,
      BI_ZERO,
      BI_ZERO,
    ],
  } = useReadContract({
    abi,
    address: nfpm,
    functionName: 'positions',
    args: [tokenId],
    query: { refetchInterval },
  });
  return data[7];
}

export default useGetCLPosition;
