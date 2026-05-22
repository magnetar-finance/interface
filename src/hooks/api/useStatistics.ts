import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_STATS } from '@/gql/queries/statistics';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useStatistics(refetchInterval: number | false = false) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__statistics'],
    queryFn: () => ql(uri, QUERY_STATS),
    refetchInterval,
  });
  return {
    data: data?.data?.statistics,
    isLoading,
    isError,
  };
}

export default useStatistics;
