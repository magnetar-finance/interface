import { Fetcher } from "@/utils/http-api";
import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useChainId, useConnection } from "wagmi";

const baseFetcher = new Fetcher();

export function useStatistics(refetchInterval: number | false = 60000) {
  const chainId = useChainId();
  const { data, isLoading, error } = useQuery({
    queryKey: [`${chainId}-statistics`, chainId],
    queryFn: () => baseFetcher.getStats(chainId),
    refetchInterval,
  });
  return { statistics: data, isLoading, error };
}

export function useAccountPositions(
  page: number = 1,
  limit: number = 20,
  refetchInterval: number | false = 60000,
) {
  const chainId = useChainId();
  const { address = zeroAddress } = useConnection();
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${chainId}-positions`, address, page, limit],
    queryFn: () => baseFetcher.getPositions(address, page, limit, chainId),
    refetchInterval,
  });
  return { positions: data, isLoading, error };
}

export function useAccountPositionStats(refetchInterval: number | false = 60000) {
  const chainId = useChainId();
  const { address = zeroAddress } = useConnection();
  const { data, isLoading, error } = useQuery({
    queryKey: [`${chainId}-position-stats`, address],
    queryFn: () => baseFetcher.getPositionStats(address, chainId),
    refetchInterval,
  });
  return { positionStats: data, isLoading, error };
}
