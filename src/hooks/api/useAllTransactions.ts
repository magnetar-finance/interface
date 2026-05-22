import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_ALL_TRANSACTIONS } from '@/gql/queries/transactions';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useAllTransactions(
  skip: number = 0,
  limit: number = 1000,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__all__transactions'],
    queryFn: () => ql(uri, QUERY_ALL_TRANSACTIONS, { skip, limit }),
    refetchInterval,
  });
  return {
    data: data?.data?.transactions || [],
    isLoading,
    isError,
  };
}

export default useAllTransactions;
