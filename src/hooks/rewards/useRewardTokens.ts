import { BI_ZERO, DEFAULT_PROCESS_DURATION } from '@/constants';
import { Address, zeroAddress } from 'viem';
import abi from '@/abis/reward.abi';
import { usePublicClient, useReadContract } from 'wagmi';
import { useSetInterval } from '../app';
import { useState } from 'react';

function useRewardTokens(
  votingReward: Address = zeroAddress,
  refetch_intervals: number = DEFAULT_PROCESS_DURATION,
) {
  const [rewardTokens, setRewardTokens] = useState<Address[]>([]);
  const publicClient = usePublicClient();
  const { data: rewardsListLength = BI_ZERO } = useReadContract({
    abi,
    address: votingReward,
    functionName: 'rewardsListLength',
    query: { enabled: votingReward !== zeroAddress && !!publicClient },
  });

  useSetInterval(async () => {
    if (votingReward === zeroAddress || rewardsListLength === BI_ZERO || !publicClient) return;
    const rewardTokensList: Promise<Address>[] = [];
    for (let i = BI_ZERO; i < rewardsListLength; i++) {
      const rewardToken = publicClient.readContract({
        abi,
        address: votingReward,
        functionName: 'rewards',
        args: [i],
      });
      rewardTokensList.push(rewardToken);
    }

    const resolvedRewardTokens = await Promise.all(rewardTokensList);
    setRewardTokens(resolvedRewardTokens.filter((token) => token !== zeroAddress));
  }, refetch_intervals);

  return rewardTokens;
}

export default useRewardTokens;
