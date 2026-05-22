import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_SINGLE_POOL } from '@/gql/queries/pools';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useSinglePool(id: string, refetchInterval: number | false = false) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__single__pool', id, chainId],
    queryFn: () => ql(uri, QUERY_SINGLE_POOL, { id }),
    refetchInterval,
  });

  return {
    data: data?.data?.pool,
    isLoading,
    isError,
  };
}

export default useSinglePool;
