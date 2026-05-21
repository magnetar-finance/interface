import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
  zeroAddress,
} from 'viem';
import abi from '@/abis/auto-swap.abi';
import { AUTO_SWAP_EXECUTORS, BASE_POINT, ETHER, MIN_IN_SEC } from '@/constants';
import { Composition } from '@/typings';
import { applySlippage } from '@/utils';
import { slippageToleranceAtom, deadlineAtom } from '@/store';
import { useAtom } from 'jotai';
import { useMemo, useCallback, useEffect } from 'react';
import { useChainId, useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useAtomicDate } from '../app';

function composeBytes(
  token0: Address,
  token1: Address,
  to: Address,
  amountIn: bigint,
  amountOut: bigint,
  swapType: 0 | 1,
  deadline: bigint,
) {
  const composition: Composition = {} as Composition;
  const isETH = token0.toLowerCase() === ETHER.toLowerCase();

  if (isETH) composition.value = amountIn;
  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'execute',
    args: [token0, token1, to, amountIn, amountOut, swapType, deadline],
  });

  return composition;
}

function useAutoSwap(
  token0: Address,
  token1: Address,
  amountIn: bigint,
  amountOut: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const now = useAtomicDate(15000);
  const [slippage] = useAtom(slippageToleranceAtom);
  const [transactionDeadline] = useAtom(deadlineAtom);
  const amountOutMin = useMemo(() => applySlippage(slippage, amountOut), [amountOut, slippage]);
  const txDeadlineParsed = useMemo(() => {
    const time = Math.floor(now.getTime() / BASE_POINT);
    const txDeadlineInSecs = (transactionDeadline || 10) * MIN_IN_SEC;
    return BigInt(time + txDeadlineInSecs);
  }, [now, transactionDeadline]);

  // Chain parameters
  const chainId = useChainId();
  const { address = zeroAddress } = useAccount();
  const routerAddress = useMemo(() => AUTO_SWAP_EXECUTORS[chainId], [chainId]);
  const composition = useMemo(
    () =>
      composeBytes(
        token0,
        token1,
        address,
        amountIn,
        amountOutMin,
        amountOutMin === BigInt(0) ? 0 : 1,
        txDeadlineParsed,
      ),
    [address, amountIn, amountOutMin, token0, token1, txDeadlineParsed],
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

export default useAutoSwap;
