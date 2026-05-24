import { CHAIN_GQL_URI } from '@/constants';
import ql from '@/gql/ql';
import { QUERY_ACCOUNT_INFO } from '@/gql/queries/account';
import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';

function useAccountInfo(refetchInterval: number | false = false) {
  const chainId = useChainId();
  const uri = CHAIN_GQL_URI[chainId];
  const { address: id = zeroAddress } = useAccount();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['__gql__account__info', id, chainId],
    queryFn: () => ql(uri, QUERY_ACCOUNT_INFO, { id: id.toLowerCase() }),
    refetchInterval,
  });

  return {
    data: data?.data?.user,
    isLoading,
    isError,
  };
}

export default useAccountInfo;
