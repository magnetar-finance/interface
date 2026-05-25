import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_ALL_TOKENS } from '@/gql/queries/tokens';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useAllTokens(
  skip: number = 0,
  limit: number = 1000,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__all__tokens', skip, limit],
    queryFn: () => ql(uri, QUERY_ALL_TOKENS, { skip, limit }),
    refetchInterval,
  });
  return {
    data: data?.data?.tokens || [],
    isLoading,
    isError,
  };
}

export default useAllTokens;
