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
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(from: Address, to: Address, tokenId: bigint) {
  const composition: Composition = {} as Composition;
  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'transferFrom',
    args: [from, to, tokenId],
  });

  return composition;
}

function useERC721Transfer(
  token: Address,
  to: Address,
  tokenId: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const { address = zeroAddress } = useAccount();
  const composition = useMemo(() => composeBytes(address, to, tokenId), [address, to, tokenId]);

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

export default useERC721Transfer;
