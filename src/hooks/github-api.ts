import { getAssetsFromRepo } from "@/utils/github-api";
import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";

export function useAssetsFromGithub(refetchInterval: number | false = 60000) {
  const chainId = useChainId();
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${chainId}-assets`],
    queryFn: () => getAssetsFromRepo(chainId),
    refetchInterval,
  });
  return { githubAssets: data, isLoading, error };
}
