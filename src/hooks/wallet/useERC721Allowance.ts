import abi from '@/abis/erc721.abi';
import { DEFAULT_PROCESS_DURATION } from '@/constants';
import { Address, zeroAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

function useERC721Allowance(
  token: Address = zeroAddress,
  spender: Address = zeroAddress,
  refetchInterval: number = DEFAULT_PROCESS_DURATION,
) {
  const { address = zeroAddress } = useAccount();
  const { data = false } = useReadContract({
    abi,
    address: token,
    functionName: 'isApprovedForAll',
    args: [address, spender],
    query: { refetchInterval },
  });
  return data;
}

export default useERC721Allowance;
