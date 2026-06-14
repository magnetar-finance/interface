import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_RENTALS } from '@/gql/queries/rentals';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useAllRentals(
  skip: number = 0,
  limit: number = 1000,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__all__rentals', skip, limit],
    queryFn: () => ql(uri, QUERY_RENTALS, { skip, limit }),
    refetchInterval,
  });
  return {
    data: data?.data?.rentals || [],
    isLoading,
    isError,
  };
}

export default useAllRentals;
