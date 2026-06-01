import abi from '@/abis/nfpm.abi';
import { DEFAULT_PROCESS_DURATION, NFPM } from '@/constants';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useChainId, useReadContract } from 'wagmi';

function useGetCLPositionOwner(
  tokenId: bigint,
  refetchInterval: number = DEFAULT_PROCESS_DURATION,
) {
  const chainId = useChainId();
  const nfpm = useMemo(() => NFPM[chainId], [chainId]);
  const { data = zeroAddress } = useReadContract({
    abi,
    address: nfpm,
    functionName: 'ownerOf',
    args: [tokenId],
    query: { refetchInterval },
  });
  return data;
}

export default useGetCLPositionOwner;
