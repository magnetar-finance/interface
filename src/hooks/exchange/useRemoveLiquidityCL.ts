import abi from '@/abis/nfpm.abi';
import { BASE_POINT, BI_ZERO, MIN_IN_SEC, NFPM } from '@/constants';
import { deadlineAtom, slippageToleranceAtom } from '@/store';
import { Composition } from '@/typings';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  maxUint128,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
  zeroAddress,
} from 'viem';
import { useAtomicDate } from '../app';
import { applySlippage } from '@/utils';
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

function composeBytes(
  tokenId: bigint,
  liquidity: bigint,
  amount0Min: bigint,
  amount1Min: bigint,
  to: Address,
  transactionDeadline: bigint,
) {
  const composition: Composition = {} as Composition;

  const decreaseLPBytes = encodeFunctionData({
    abi,
    functionName: 'decreaseLiquidity',
    args: [{ tokenId, liquidity, amount0Min, amount1Min, deadline: transactionDeadline }],
  });

  const collectBytes = encodeFunctionData({
    abi,
    functionName: 'collect',
    args: [{ tokenId, recipient: to, amount0Max: maxUint128, amount1Max: maxUint128 }],
  });

  composition.bytes = encodeFunctionData({
    abi,
    functionName: 'multicall',
    args: [[decreaseLPBytes, collectBytes]],
  });

  return composition;
}

function useRemoveLiquidityCL(
  tokenId: bigint,
  liquidity: bigint,
  amountAReturned: bigint = BI_ZERO,
  amountBReturned: bigint = BI_ZERO,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const now = useAtomicDate(15000);
  const [slippage] = useAtom(slippageToleranceAtom);
  const [transactionDeadline] = useAtom(deadlineAtom);
  const amountAMin = useMemo(
    () => applySlippage(slippage, amountAReturned),
    [amountAReturned, slippage],
  );
  const amountBMin = useMemo(
    () => applySlippage(slippage, amountBReturned),
    [amountBReturned, slippage],
  );
  const txDeadlineParsed = useMemo(() => {
    const time = Math.floor(now.getTime() / BASE_POINT);
    const txDeadlineInSecs = (transactionDeadline || 10) * MIN_IN_SEC;
    return BigInt(time + txDeadlineInSecs);
  }, [now, transactionDeadline]);

  // Chain parameters
  const chainId = useChainId();
  const { address = zeroAddress } = useAccount();
  const nfpm = useMemo(() => NFPM[chainId], [chainId]);
  const composition = useMemo(
    () => composeBytes(tokenId, liquidity, amountAMin, amountBMin, address, txDeadlineParsed),
    [address, amountAMin, amountBMin, liquidity, tokenId, txDeadlineParsed],
  );

  const { sendTransaction, data: hash, error: sendError, reset, isPending } = useSendTransaction();
  const { error: waitError, isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const execute = useCallback(
    () =>
      sendTransaction({
        to: nfpm,
        data: composition.bytes,
        value: composition.value,
      }),
    [composition.bytes, composition.value, nfpm, sendTransaction],
  );

  useEffect(() => {
    if (isSuccess && hash && onSuccess) onSuccess(hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((sendError || waitError) && onError) onError((sendError ?? waitError) as any);
  }, [hash, isSuccess, onError, onSuccess, sendError, waitError]);

  return { execute, reset, isLoading: isLoading || isPending };
}

export default useRemoveLiquidityCL;
