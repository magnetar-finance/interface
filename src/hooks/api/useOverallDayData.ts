import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_OVERALLDAY_DATA } from '@/gql/queries/statistics';
import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

const NOW = Math.floor(Date.now() / 1000);
const TWENTY_FOUR_HOURS_AGO = NOW - 86400;

function useOverallDayData(
  skip: number = 0,
  limit: number = 1000,
  refetchInterval: number | false = false,
  dateMin: number = TWENTY_FOUR_HOURS_AGO,
  dateMax: number = NOW,
) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__overall__day__data', dateMin, dateMax, skip, limit],
    queryFn: () => ql(uri, QUERY_OVERALLDAY_DATA, { skip, limit, dateMin, dateMax }),
    refetchInterval,
  });
  return {
    data: data?.data?.overallDayDatas || [],
    isLoading,
    isError,
  };
}

export default useOverallDayData;
