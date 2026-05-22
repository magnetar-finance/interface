import abi from '@/abis/nfpm.abi';
import { BASE_POINT, ETHER, MIN_IN_SEC, NFPM, WETH } from '@/constants';
import { deadlineAtom } from '@/store';
import { Composition } from '@/typings';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
  zeroAddress,
} from 'viem';
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useAtomicDate } from '../app';

function useComposeBytes(
  token0: Address,
  token1: Address,
  tickSpacing: number,
  tickLower: number,
  tickUpper: number,
  amountADesired: bigint,
  amountBDesired: bigint,
  to: Address,
  transactionDeadline: bigint,
  sqrtPriceX96: bigint,
) {
  const chainId = useChainId();
  const isETH = useMemo(
    () =>
      token0.toLowerCase() === ETHER.toLowerCase() || token1.toLowerCase() === ETHER.toLowerCase(),
    [token0, token1],
  );
  const weth = useMemo(() => WETH[chainId], [chainId]);
  const params = useMemo(() => {
    const mintParams = {
      token0,
      token1,
      tickSpacing,
      tickLower,
      tickUpper,
      amount0Desired: amountADesired,
      amount1Desired: amountBDesired,
      amount0Min: BigInt(0),
      amount1Min: BigInt(0),
      recipient: to,
      deadline: transactionDeadline,
      sqrtPriceX96,
    };

    if (isETH) {
      if (token0.toLowerCase() === ETHER.toLowerCase()) mintParams.token0 = weth;
      else mintParams.token1 = weth;
    }

    return mintParams;
  }, [
    amountADesired,
    amountBDesired,
    isETH,
    sqrtPriceX96,
    tickLower,
    tickSpacing,
    tickUpper,
    to,
    token0,
    token1,
    transactionDeadline,
    weth,
  ]);

  return useMemo(() => {
    const composition: Composition = {} as Composition;
    if (isETH) {
      if (token0.toLowerCase() === ETHER.toLowerCase()) composition.value = amountADesired;
      else composition.value = amountBDesired;
    }

    composition.bytes = encodeFunctionData({
      abi,
      functionName: 'mint',
      args: [params],
    });

    return composition;
  }, [amountADesired, amountBDesired, isETH, params, token0]);
}

function useAddLiquidityCL(
  token0: Address,
  token1: Address,
  tickSpacing: number,
  tickLower: number,
  tickUpper: number,
  amountADesired: bigint,
  amountBDesired: bigint,
  sqrtPriceX96: bigint,
  onSuccess?: (hash: `0x${string}`) => void,
  onError?: (error: SendTransactionErrorType | WaitForTransactionReceiptErrorType) => void,
) {
  const now = useAtomicDate(15000);
  const [transactionDeadline] = useAtom(deadlineAtom);
  const txDeadlineParsed = useMemo(() => {
    const time = Math.floor(now.getTime() / BASE_POINT);
    const txDeadlineInSecs = (transactionDeadline || 10) * MIN_IN_SEC;
    return BigInt(time + txDeadlineInSecs);
  }, [now, transactionDeadline]);

  // Chain parameters
  const chainId = useChainId();
  const { address = zeroAddress } = useAccount();
  const routerAddress = useMemo(() => NFPM[chainId], [chainId]);
  const composition = useComposeBytes(
    token0,
    token1,
    tickSpacing,
    tickLower,
    tickUpper,
    amountADesired,
    amountBDesired,
    address,
    txDeadlineParsed,
    sqrtPriceX96,
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

export default useAddLiquidityCL;
