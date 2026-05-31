import abi from '@/abis/ve.abi';
import { VE } from '@/constants';
import { Composition } from '@/typings';
import { useCallback, useEffect, useMemo } from 'react';
import {
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from 'viem';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(tokenId: bigint, lockDuration: bigint) {
  const composition: Composition = {} as Composition;

  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'increaseUnlockTime',
    args: [tokenId, lockDuration],
  });

  return composition;
}

function useIncreaseLockTime(
  tokenId: bigint,
  lockDuration: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  // Chain parameters
  const chainId = useChainId();
  const escrow = useMemo(() => VE[chainId], [chainId]);
  const composition = useMemo(() => composeBytes(tokenId, lockDuration), [tokenId, lockDuration]);

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

export default useIncreaseLockTime;
