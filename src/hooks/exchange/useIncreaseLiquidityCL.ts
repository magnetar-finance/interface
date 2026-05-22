import abi from '@/abis/nfpm.abi';
import { BASE_POINT, MIN_IN_SEC, NFPM } from '@/constants';
import { deadlineAtom, slippageToleranceAtom } from '@/store';
import { Composition } from '@/typings';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import {
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from 'viem';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useAtomicDate } from '../app';
import { applySlippage } from '@/utils';

function composeBytes(
  tokenId: bigint,
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  deadline: bigint,
  etherValue?: '0' | '1',
) {
  const composition: Composition = {} as Composition;
  const increaseLiquidityParams = {
    tokenId,
    amount0Desired: amountADesired,
    amount1Desired: amountBDesired,
    amount0Min: amountAMin,
    amount1Min: amountBMin,
    deadline,
  };

  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'increaseLiquidity',
    args: [increaseLiquidityParams],
  });

  if (etherValue)
    if (etherValue === '0') composition.value = amountADesired;
    else composition.value = amountBDesired;

  return composition;
}

function useIncreaseLiquidityCL(
  tokenId: bigint,
  amountADesired: bigint,
  amountBDesired: bigint,
  etherValue?: '0' | '1',
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const now = useAtomicDate(15000);
  const [slippage] = useAtom(slippageToleranceAtom);
  const [transactionDeadline] = useAtom(deadlineAtom);
  const amountAMin = useMemo(
    () => applySlippage(slippage, amountADesired),
    [amountADesired, slippage],
  );
  const amountBMin = useMemo(
    () => applySlippage(slippage, amountBDesired),
    [amountBDesired, slippage],
  );
  const txDeadlineParsed = useMemo(() => {
    const time = Math.floor(now.getTime() / BASE_POINT);
    const txDeadlineInSecs = (transactionDeadline || 10) * MIN_IN_SEC;
    return BigInt(time + txDeadlineInSecs);
  }, [now, transactionDeadline]);

  // Chain parameters
  const chainId = useChainId();
  const routerAddress = useMemo(() => NFPM[chainId], [chainId]);
  const composition = useMemo(
    () =>
      composeBytes(
        tokenId,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        txDeadlineParsed,
        etherValue,
      ),
    [amountADesired, amountAMin, amountBDesired, amountBMin, etherValue, tokenId, txDeadlineParsed],
  );

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    () =>
      sendTransaction({
        to: routerAddress,
        data: composition.bytes,
        value: composition.value,
      }),
    [composition.bytes, composition.value, routerAddress, sendTransaction],
  );

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useIncreaseLiquidityCL;
