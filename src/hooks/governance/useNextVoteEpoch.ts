import abi from '@/abis/voter.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION, VOTER } from '@/constants';
import { useMemo } from 'react';
import { useBlock, useChainId, useReadContract } from 'wagmi';

function useNextVoteEpoch(refetch_intervals = DEFAULT_PROCESS_DURATION) {
  const chainId = useChainId();
  const voter = useMemo(() => VOTER[chainId], [chainId]);
  const { data: currentBlock } = useBlock({
    query: { refetchInterval: refetch_intervals, enabled: !!voter },
  });
  const { data: epochVoteStart = BI_ZERO } = useReadContract({
    abi,
    address: voter,
    functionName: 'epochNext',
    args: [currentBlock?.timestamp || BI_ZERO],
  });
  return epochVoteStart;
}

export default useNextVoteEpoch;
