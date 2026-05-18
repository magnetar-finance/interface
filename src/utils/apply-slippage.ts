import { BASE_POINT } from '@/constants';

export function applySlippage(slippage: number, originalAmount: bigint | number): bigint {
  if (typeof originalAmount === 'number') originalAmount = BigInt(originalAmount);
  const slippageAsBP = BigInt(slippage * BASE_POINT);
  const BIT = (slippageAsBP * originalAmount) / BigInt(100 * BASE_POINT);
  return originalAmount - BIT;
}
