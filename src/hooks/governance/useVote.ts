import abi from '@/abis/voter.abi';
import { VOTER } from '@/constants';
import { Composition } from '@/typings';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from 'viem';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(tokenId: bigint, pools: Address[], weights: bigint[]) {
  const composition: Composition = {} as Composition;
  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'vote',
    args: [tokenId, pools, weights],
  });

  return composition;
}

function useVote(
  tokenId: bigint,
  pools: Address[],
  weights: bigint[],
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const chainId = useChainId();
  const voter = useMemo(() => VOTER[chainId], [chainId]);
  const composition = useMemo(
    () => composeBytes(tokenId, pools, weights),
    [pools, tokenId, weights],
  );

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    () =>
      sendTransaction({
        to: voter,
        data: composition.bytes,
        value: composition.value,
      }),
    [composition.bytes, composition.value, sendTransaction, voter],
  );

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useVote;
