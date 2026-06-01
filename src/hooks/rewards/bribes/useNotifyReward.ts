import abi from '@/abis/bribe-voting-reward';
import { Composition } from '@/typings';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(token: Address, amount: bigint) {
  const composition: Composition = {} as Composition;

  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'notifyRewardAmount',
    args: [token, amount],
  });

  return composition;
}

function useNotifyRewardAmount(
  bribe: Address,
  token: Address,
  amount: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const composition = useMemo(() => composeBytes(token, amount), [token, amount]);

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    () =>
      sendTransaction({
        to: bribe,
        data: composition.bytes,
        value: composition.value,
      }),
    [bribe, composition.bytes, composition.value, sendTransaction],
  );

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useNotifyRewardAmount;
