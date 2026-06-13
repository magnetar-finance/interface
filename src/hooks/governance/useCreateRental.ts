import abi from '@/abis/ve-rental-marketplace.abi';
import { VE_RENTAL_MARKETPLACE } from '@/constants';
import { Composition } from '@/typings';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from 'viem';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(
  tokenId: bigint,
  paymentToken: Address,
  price: bigint,
  duration: bigint,
  rewardsCommission: bigint,
) {
  const composition: Composition = {} as Composition;

  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'createRental',
    args: [tokenId, paymentToken, price, duration, rewardsCommission],
  });

  return composition;
}

function useCreateRental(
  tokenId: bigint,
  paymentToken: Address,
  price: bigint,
  duration: bigint,
  rewardsCommission: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  // Chain parameters
  const chainId = useChainId();
  const escrow = useMemo(() => VE_RENTAL_MARKETPLACE[chainId], [chainId]);
  const composition = useMemo(
    () => composeBytes(tokenId, paymentToken, price, duration, rewardsCommission),
    [tokenId, paymentToken, price, duration, rewardsCommission],
  );

  console.log(
    tokenId.toString(),
    paymentToken,
    price.toString(),
    duration.toString(),
    rewardsCommission.toString(),
  );

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    () =>
      sendTransaction({
        to: escrow,
        data: composition.bytes,
        value: composition.value,
      }),
    [composition.bytes, composition.value, escrow, sendTransaction],
  );

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useCreateRental;
