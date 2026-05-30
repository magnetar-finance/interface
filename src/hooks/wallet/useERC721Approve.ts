import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
  zeroAddress,
} from 'viem';
import abi from '@/abis/erc721.abi';
import { ETHER } from '@/constants';
import { Composition } from '@/typings';
import { useMemo, useCallback, useEffect } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(spender: Address) {
  const composition: Composition = {} as Composition;
  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'setApprovalForAll',
    args: [spender, true],
  });

  return composition;
}

function useERC721Approve(
  token: Address,
  spender: Address,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const composition = useMemo(() => composeBytes(spender), [spender]);

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(() => {
    if (token !== zeroAddress && token.toLowerCase() !== ETHER.toLowerCase())
      sendTransaction({
        to: token,
        data: composition.bytes,
        value: composition.value,
      });
  }, [composition.bytes, composition.value, sendTransaction, token]);

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useERC721Approve;
