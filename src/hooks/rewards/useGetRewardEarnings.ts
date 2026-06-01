import abi from '@/abis/reward.abi';
import { BI_ZERO } from '@/constants';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';

function useGetRewardEarnings(reward: Address, token: Address, tokenId: bigint) {
  const { data = BI_ZERO } = useReadContract({
    abi,
    address: reward,
    functionName: 'earned',
    args: [token, tokenId],
  });
  return data;
}

export default useGetRewardEarnings;
