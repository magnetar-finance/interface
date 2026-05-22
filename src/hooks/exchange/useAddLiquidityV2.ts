import abi from '@/abis/router.abi';
import { BASE_POINT, ETHER, MIN_IN_SEC, V2_ROUTERS } from '@/constants';
import { applySlippage } from '@/utils';
import { deadlineAtom, slippageToleranceAtom } from '@/store';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
  zeroAddress,
} from 'viem';
import { useAtomicDate } from '../app';
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Composition } from '@/typings';

function composeBytes(
  token0: Address,
  token1: Address,
  stable: boolean,
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  to: Address,
  transactionDeadline: bigint,
) {
  const composition: Composition = {} as Composition;
  const isETH =
    token0.toLowerCase() === ETHER.toLowerCase() || token1.toLowerCase() === ETHER.toLowerCase();
  let bytes: `0x${string}` = '0x';

  if (isETH) {
    const token: Address = token0.toLowerCase() === ETHER.toLowerCase() ? token1 : token0;
    const amountTokenDesired: bigint =
      token0.toLowerCase() === ETHER.toLowerCase() ? amountBDesired : amountADesired;
    const value: bigint =
      token0.toLowerCase() === ETHER.toLowerCase() ? amountADesired : amountBDesired;
    const [amountTokenMin, amountETHMin]: [bigint, bigint] =
      token0.toLowerCase() === ETHER.toLowerCase()
        ? [amountBMin, amountAMin]
        : [amountAMin, amountBMin];
    bytes = encodeFunctionData({
      abi,
      functionName: 'addLiquidityETH',
      args: [
        token,
        stable,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to,
        transactionDeadline,
      ],
    });

    composition.value = value;
  } else
    bytes = encodeFunctionData({
      abi,
      functionName: 'addLiquidity',
      args: [
        token0,
        token1,
        stable,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        transactionDeadline,
      ],
    });

  composition.bytes = bytes;

  return composition;
}

function useAddLiquidityV2(
  token0: Address,
  token1: Address,
  stable: boolean,
  amountADesired: bigint,
  amountBDesired: bigint,
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
  const { address = zeroAddress } = useAccount();
  const routerAddress = useMemo(() => V2_ROUTERS[chainId], [chainId]);
  const composition = useMemo(
    () =>
      composeBytes(
        token0,
        token1,
        stable,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        address,
        txDeadlineParsed,
      ),
    [
      address,
      amountADesired,
      amountAMin,
      amountBDesired,
      amountBMin,
      stable,
      token0,
      token1,
      txDeadlineParsed,
    ],
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

export default useAddLiquidityV2;
