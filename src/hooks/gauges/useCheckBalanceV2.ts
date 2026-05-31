import abi from '@/abis/gauge.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION } from '@/constants';
import { Address, zeroAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

function useCheckBalanceV2(gauge: Address, refetchInterval: number = DEFAULT_PROCESS_DURATION) {
  const { address = zeroAddress } = useAccount();
  const { data = BI_ZERO } = useReadContract({
    abi,
    address: gauge,
    functionName: 'balanceOf',
    args: [address],
    query: { refetchInterval, enabled: gauge !== zeroAddress },
  });
  return data;
}

export default useCheckBalanceV2;
