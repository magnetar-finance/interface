import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_TOKEN_INFO } from '@/gql/queries/tokens';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useTokenInfo(id: string, refetchInterval: number | false = false) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__token__info', id, chainId],
    queryFn: () => ql(uri, QUERY_TOKEN_INFO, { id }),
    refetchInterval,
  });

  return {
    data: data?.data?.token,
    isLoading,
    isError,
  };
}

export default useTokenInfo;
