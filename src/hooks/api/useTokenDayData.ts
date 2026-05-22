import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_TOKEN_DAY_DATA } from '@/gql/queries/tokens';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function useTokenDayData(
  tokenId: string,
  skip: number = 0,
  limit: number = 1000,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__token__day__data', tokenId, chainId, skip, limit],
    queryFn: () => ql(uri, QUERY_TOKEN_DAY_DATA, { tokenId, skip, limit }),
    refetchInterval,
  });
  return {
    data: data?.data?.tokenDayDatas || [],
    isLoading,
    isError,
  };
}

export default useTokenDayData;
