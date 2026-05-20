import { Address, zeroAddress } from 'viem';
import useCLPool from './useCLPool';
import { BI_ZERO, REFETCH_INTERVALS } from '@/constants';
import abi from '@/abis/cl-pool.abi';
import { useReadContract } from 'wagmi';

function useCLPoolSlot(token0: Address, token1: Address, tickSpacing: number) {
  const pool = useCLPool(token0, token1, tickSpacing, REFETCH_INTERVALS);
  const { data = [BI_ZERO, 0, 0, 0, 0, false] } = useReadContract({
    abi,
    address: pool,
    functionName: 'slot0',
    query: { enabled: pool !== zeroAddress },
  });

  return data;
}

export default useCLPoolSlot;
