import { BI_ZERO, DEFAULT_PROCESS_DURATION, ETHER } from '@/constants';
import abi from '@/abis/erc20.abi';
import { useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { useSetInterval } from '../app';
import { useAccount, usePublicClient } from 'wagmi';

function useGetBalance(token: Address = ETHER, refetchInterval: number = DEFAULT_PROCESS_DURATION) {
  const [balance, setBalance] = useState<bigint>(BI_ZERO);
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient();

  useSetInterval(async () => {
    if (address === zeroAddress) {
      setBalance(BI_ZERO);
      return;
    }

    if (token === zeroAddress) {
      setBalance(BI_ZERO);
      return;
    }

    if (!publicClient) {
      setBalance(BI_ZERO);
      return;
    }
    try {
      if (token.toLowerCase() === ETHER.toLowerCase()) {
        const accountBalance = await publicClient.getBalance({ address });
        setBalance(accountBalance);
      } else {
        const callResult = await publicClient.readContract({
          address: token,
          abi,
          functionName: 'balanceOf',
          args: [address],
        });
        setBalance(callResult);
      }
    } catch (error: unknown) {
      setBalance(BI_ZERO);
      console.error(error);
    }
  }, refetchInterval);

  return balance;
}

export default useGetBalance;
