"use server";

import { getEnv } from "@/config/env.config";
import axios, { AxiosInstance } from "axios";

export interface APIResponse<T> {
  status: number;
  data: T;
}

// Enums
export enum PoolType {
  STABLE = "STABLE",
  VOLATILE = "VOLATILE",
  CONCENTRATED = "CONCENTRATED",
}

export enum LockType {
  MANAGED = "MANAGED",
  NORMAL = "NORMAL",
}

// Base Interfaces
export interface Burn {
  id: string;
  transaction: Transaction;
  timestamp: number;
  pool: Pool;
  liquidity: number;
  sender?: string;
  amount0?: number;
  amount1?: number;
  to?: string;
  logIndex?: number;
  amountUSD?: number;
  needsComplete: boolean;
  feeTo?: string;
  feeLiquidity?: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gauge {
  id: string;
  address: string;
  depositPool: Pool;
  rewardToken: Token;
  totalSupply: number;
  feeVotingReward: string;
  bribeVotingReward: string;
  rewardRate: number;
  fees0: number;
  fees1: number;
  isAlive: boolean;
  emission: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GaugePosition {
  id: string;
  gauge: Gauge;
  amountDeposited: number;
  account: User;
  creationTransaction: string;
  creationBlock: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndexerEventStatus {
  id: string;
  lastBlockNumber: number;
  eventName: string;
  chainId: number;
  contractAddress: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LockPosition {
  id: string;
  position: number;
  owner: User;
  creationBlock: number;
  creationTransaction: string;
  lockId: number;
  lockType: LockType;
  permanent: boolean;
  lockRewardManager?: string;
  freeRewardManager?: string;
  unlockTime: number;
  totalVoteWeightGiven: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiquidityPosition {
  id: string;
  pool: Pool;
  account?: User;
  position: number;
  creationBlock: number;
  creationTransaction: string;
  clPositionTokenId?: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mint {
  id: string;
  transaction: Transaction;
  timestamp: number;
  pool: Pool;
  to: string;
  liquidity: number;
  sender?: string;
  amount0?: number;
  amount1?: number;
  logIndex?: number;
  amountUSD?: number;
  feeTo?: string;
  feeLiquidity?: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OverallDayData {
  id: string;
  date: number;
  volumeETH: number;
  volumeUSD: number;
  liquidityETH: number;
  liquidityUSD: number;
  txCount: number;
  feesUSD: number;
  totalTradeVolumeETH: number;
  chainId: number;
  totalTradeVolumeUSD: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pool {
  id: string;
  address: string;
  name: string;
  token0: Token;
  token1: Token;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  reserveETH: number;
  reserveUSD: number;
  token0Price: number;
  token1Price: number;
  volumeToken0: number;
  volumeToken1: number;
  volumeUSD: number;
  volumeETH: number;
  txCount: number;
  createdAtTimestamp: number;
  createdAtBlockNumber: number;
  poolHourData: PoolHourData[];
  mints: Mint[];
  burns: Burn[];
  swaps: Swap[];
  poolType: PoolType;
  gaugeFeesUSD: number;
  totalVotes: number;
  totalFeesUSD: number;
  totalBribesUSD: number;
  totalFees0: number;
  totalFees1: number;
  gaugeFees0CurrentEpoch: number;
  gaugeFees1CurrentEpoch: number;
  totalEmissions: number;
  totalEmissionsUSD: number;
  gauge?: Gauge;
  tickSpacing?: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolDayData {
  id: string;
  date: number;
  pool: Pool;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  reserveUSD: number;
  reserveETH: number;
  dailyVolumeToken0: number;
  dailyVolumeToken1: number;
  dailyVolumeUSD: number;
  dailyVolumeETH: number;
  dailyTxns: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolHourData {
  id: string;
  hourStartUnix: number;
  pool: Pool;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  reserveUSD: number;
  reserveETH: number;
  hourlyVolumeToken0: number;
  hourlyVolumeToken1: number;
  hourlyVolumeUSD: number;
  hourlyVolumeETH: number;
  hourlyTxns: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Swap {
  id: string;
  transaction: Transaction;
  timestamp: number;
  pool: Pool;
  sender: string;
  from: string;
  amount0In: number;
  amount1In: number;
  amount0Out: number;
  amount1Out: number;
  to: string;
  logIndex?: number;
  amountUSD: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  tradeVolume: number;
  tradeVolumeUSD: number;
  txCount: number;
  totalLiquidity: number;
  totalLiquidityETH: number;
  totalLiquidityUSD: number;
  derivedETH: number;
  derivedUSD: number;
  basePools: Pool[];
  quotePools: Pool[];
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenDayData {
  id: string;
  date: number;
  token: Token;
  dailyVolumeToken: number;
  dailyVolumeETH: number;
  dailyVolumeUSD: number;
  dailyTxns: number;
  totalLiquidityToken: number;
  totalLiquidityETH: number;
  totalLiquidityUSD: number;
  priceUSD: number;
  priceETH: number;
}

export interface Transaction {
  id: string;
  hash: string;
  block: number;
  timestamp: number;
  mints: Mint[];
  burns: Burn[];
  swaps: Swap[];
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  address: string;
  gaugePositions: GaugePosition[];
  lpPositions: LiquidityPosition[];
  lockPositions: LockPosition[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Statistics {
  id: string;
  txCount: number;
  totalPairsCreated: number;
  totalVolumeLockedUSD: number;
  totalVolumeLockedETH: number;
  totalFeesUSD: number;
  totalBribesUSD: number;
  totalTradeVolumeUSD: number;
  totalTradeVolumeETH: number;
  chainId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Fetcher {
  private httpInstance: AxiosInstance;

  constructor() {
    const env = getEnv();
    this.httpInstance = axios.create({
      baseURL: env.API_URI,
    });
  }

  async getStats(chainId?: number) {
    try {
      const response = await this.httpInstance.get<APIResponse<Statistics>>("/analytics", {
        params: { chainId },
      });
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getPositions(account: string, page: number = 1, limit: number = 20, chainId?: number) {
    try {
      const response = await this.httpInstance.get<APIResponse<LiquidityPosition[]>>(
        `/positions/${account}`,
        {
          params: { page, limit, chainId },
        },
      );
      return response.data.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
