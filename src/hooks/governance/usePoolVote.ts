import abi from '@/abis/voter.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION, VOTER } from '@/constants';
import { useMemo, useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient, useReadContract } from 'wagmi';
import { useSetInterval } from '../app';

function usePoolVote(tokenId: bigint, refetch_intervals = DEFAULT_PROCESS_DURATION) {
  const chainId = useChainId();
  const [votedPools, setVotedPools] = useState<Address[]>([]);
  const publicClient = usePublicClient();
  const voter = useMemo(() => VOTER[chainId], [chainId]);

  const { data: maxVotingNum = BI_ZERO } = useReadContract({
    abi,
    address: voter,
    functionName: 'maxVotingNum',
    args: [],
  });

  useSetInterval(async () => {
    if (!voter || tokenId === BI_ZERO || !publicClient) return;
    const votedPoolsList: Promise<Address>[] = [];
    for (let i = BI_ZERO; i < maxVotingNum; i++) {
      const votedPool = publicClient.readContract({
        abi,
        address: voter,
        functionName: 'poolVote',
        args: [tokenId, i],
      });
      votedPoolsList.push(votedPool);
    }

    const resolvedVotedPools = await Promise.all(votedPoolsList);
    setVotedPools(resolvedVotedPools.filter((pool) => pool !== zeroAddress));
  }, refetch_intervals);

  return votedPools;
}

export default usePoolVote;
