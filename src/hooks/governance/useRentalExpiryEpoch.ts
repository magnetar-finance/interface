import abi from '@/abis/ve-rental.abi';
import { BI_ZERO, DEFAULT_PROCESS_DURATION } from '@/constants';
import { Address, zeroAddress } from 'viem';
import { useReadContract } from 'wagmi';

function useRentalExpiryEpoch(rental: Address, refetch_intervals = DEFAULT_PROCESS_DURATION) {
  const { data: currentEpoch = BI_ZERO } = useReadContract({
    abi,
    address: rental,
    functionName: 'expiryEpoch',
    args: [],
    query: { refetchInterval: refetch_intervals, enabled: rental !== zeroAddress },
  });
  return currentEpoch;
}

export default useRentalExpiryEpoch;
