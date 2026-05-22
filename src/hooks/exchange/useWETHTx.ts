import {
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
  zeroAddress,
} from 'viem';
import abi from '@/abis/weth.abi';
import { WETH } from '@/constants';
import { Composition } from '@/typings';
import { useMemo, useCallback, useEffect } from 'react';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeDepositBytes(value: bigint) {
  const composition: Composition = {} as Composition;
  composition.value = value;
  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'deposit',
    args: [],
  });

  return composition;
}

function composeWithdrawalBytes(value: bigint) {
  const composition: Composition = {} as Composition;
  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'withdraw',
    args: [value],
  });

  return composition;
}

function useDeposit(
  amount: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const chainId = useChainId();
  const composition = useMemo(() => composeDepositBytes(amount), [amount]);
  const weth = useMemo(() => WETH[chainId], [chainId]);

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(() => {
    if (weth !== zeroAddress)
      sendTransaction({
        to: weth,
        data: composition.bytes,
        value: composition.value,
      });
  }, [composition.bytes, composition.value, sendTransaction, weth]);

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

function useWithdrawal(
  amount: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const chainId = useChainId();
  const composition = useMemo(() => composeWithdrawalBytes(amount), [amount]);
  const weth = useMemo(() => WETH[chainId], [chainId]);

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(() => {
    if (weth !== zeroAddress)
      sendTransaction({
        to: weth,
        data: composition.bytes,
        value: composition.value,
      });
  }, [composition.bytes, composition.value, sendTransaction, weth]);

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

function useWETHTx() {
  return { useDeposit, useWithdrawal };
}

export default useWETHTx;
