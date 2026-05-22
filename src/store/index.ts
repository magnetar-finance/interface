import { RouterType } from '@/constants';
import { createStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Transactions
export const slippageToleranceAtom = atomWithStorage<number>('slippageTolerance', 0.1);
export const routerTypeAtom = atomWithStorage<(typeof RouterType)[keyof typeof RouterType]>(
  'routerType',
  RouterType.AUTO,
);
export const deadlineAtom = atomWithStorage<number | undefined>('transactionDeadlineInMinutes', 10);

// Export store
export const store = createStore();
