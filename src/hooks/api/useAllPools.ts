import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_ALL_POOLS } from '@/gql/queries/pools';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useAllPools(
  skip: number = 0,
  limit: number = 1000,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__all__pools'],
    queryFn: () => ql(uri, QUERY_ALL_POOLS, { skip, limit }),
    refetchInterval,
  });
  return {
    data: data?.data?.pools || [],
    isLoading,
    isError,
  };
}

export default useAllPools;
