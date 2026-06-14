import abi from '@/abis/ve-rental.abi';
import { Composition } from '@/typings';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes() {
  const composition: Composition = {} as Composition;

  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'reap',
    args: [],
  });

  return composition;
}

function useReapRental(
  rental: Address,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const composition = useMemo(() => composeBytes(), []);

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    () =>
      sendTransaction({
        to: rental,
        data: composition.bytes,
        value: composition.value,
      }),
    [composition.bytes, composition.value, rental, sendTransaction],
  );

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useReapRental;
