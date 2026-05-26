import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_POOL_HOUR_DATA } from '@/gql/queries/pools';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

function usePoolHourlyData(
  poolId: string,
  skip: number = 0,
  limit: number = 1000,
  hourlyMin: number,
  hourlyMax: number,
  refetchInterval: number | false = false,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__pool__hourly__data', poolId, chainId, skip, limit, hourlyMin, hourlyMax],
    queryFn: () =>
      ql(uri, QUERY_POOL_HOUR_DATA, {
        poolId,
        skip,
        limit,
        hourMin: hourlyMin,
        hourMax: hourlyMax,
      }),
    refetchInterval,
  });
  return {
    data: data?.data?.poolHourDatas || [],
    isLoading,
    isError,
  };
}

export default usePoolHourlyData;
