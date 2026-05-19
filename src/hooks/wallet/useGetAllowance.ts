import abi from '@/abis/erc20.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION, ETHER } from '@/constants';
import { useState } from 'react';
import { Address, maxUint256, zeroAddress } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { useSetInterval } from '../app';

function useGetAllowance(
  token: Address = ETHER,
  spender: Address = zeroAddress,
  refetchInterval: number = DEFAULT_PROCESS_DURATION,
) {
  const [balance, setBalance] = useState<bigint>(BI_ZERO);
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient();

  useSetInterval(async () => {
    if (address === zeroAddress) {
      setBalance(BI_ZERO);
      return;
    }
    if (token === zeroAddress || token.toLowerCase() === ETHER.toLowerCase()) {
      setBalance(maxUint256);
      return;
    }

    if (!publicClient) return;
    try {
      const callResult = await publicClient.readContract({
        address: token,
        abi,
        functionName: 'allowance',
        args: [address, spender],
      });
      setBalance(callResult);
    } catch (error: unknown) {
      setBalance(BI_ZERO);
      console.error(error);
    }
  }, refetchInterval);

  return balance;
}

export default useGetAllowance;
