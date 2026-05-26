import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_POOL_DAY_DATA } from '@/gql/queries/pools';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function usePoolDayData(
  poolId: string,
  skip: number = 0,
  limit: number = 1000,
  dateMin: number,
  dateMax: number,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__pool__day__data', poolId, chainId, skip, limit, dateMin, dateMax],
    queryFn: () =>
      ql(uri, QUERY_POOL_DAY_DATA, {
        poolId,
        skip,
        limit,
        dateMin,
        dateMax,
      }),
    refetchInterval,
  });
  return {
    data: data?.data?.poolDayDatas || [],
    isLoading,
    isError,
  };
}

export default usePoolDayData;
