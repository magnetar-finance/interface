import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_NOTIFY_REWARDS_BY_VOTING_REWARDS } from '@/gql/queries/rewards';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useVRNotifyRewards(
  skip: number = 0,
  limit: number = 1000,
  rewardIDs: string[] = [],
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__all__vr__notify__rewards', skip, limit, rewardIDs],
    queryFn: () =>
      ql(uri, QUERY_NOTIFY_REWARDS_BY_VOTING_REWARDS, { skip, limit, rewardIds: rewardIDs }),
    refetchInterval,
  });
  return {
    data: data?.data?.notifyRewards || [],
    isLoading,
    isError,
  };
}

export default useVRNotifyRewards;
