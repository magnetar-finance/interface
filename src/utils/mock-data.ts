import { type LiquidityPosition, type Pool, type User, type Token, PoolType } from './http-api';
import type { TimeSeriesDataPoint } from '@/ui/charts/TimeSeriesChart';
import type { Timeframe } from '@/ui/charts/TimeSeriesChart';

// Mock Tokens
const mockTokenUSDC: Token = {
  id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48-1',
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  tradeVolume: 1250000.5,
  tradeVolumeUSD: 1250000.5,
  txCount: 45000,
  totalLiquidity: 5000000,
  totalLiquidityETH: 2500,
  totalLiquidityUSD: 5000000,
  derivedETH: 0.0005,
  derivedUSD: 1.0,
  basePools: [],
  quotePools: [],
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockTokenWETH: Token = {
  id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2-1',
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  symbol: 'WETH',
  name: 'Wrapped Ether',
  decimals: 18,
  tradeVolume: 850.75,
  tradeVolumeUSD: 1700000,
  txCount: 32000,
  totalLiquidity: 3500,
  totalLiquidityETH: 3500,
  totalLiquidityUSD: 7000000,
  derivedETH: 1,
  derivedUSD: 2000,
  basePools: [],
  quotePools: [],
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockTokenMAG: Token = {
  id: '0x1234567890abcdef1234567890abcdef12345678-1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  symbol: 'MAG',
  name: 'Magnetar',
  decimals: 18,
  tradeVolume: 125000,
  tradeVolumeUSD: 250000,
  txCount: 8500,
  totalLiquidity: 500000,
  totalLiquidityETH: 250,
  totalLiquidityUSD: 500000,
  derivedETH: 0.0005,
  derivedUSD: 1.0,
  basePools: [],
  quotePools: [],
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-06-01T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockTokenDAI: Token = {
  id: '0x6b175474e89094c44da98b954eedeac495271d0f-1',
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  symbol: 'DAI',
  name: 'Dai Stablecoin',
  decimals: 18,
  tradeVolume: 980000,
  tradeVolumeUSD: 980000,
  txCount: 38000,
  totalLiquidity: 4000000,
  totalLiquidityETH: 2000,
  totalLiquidityUSD: 4000000,
  derivedETH: 0.0005,
  derivedUSD: 1.0,
  basePools: [],
  quotePools: [],
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockTokenUSDT: Token = {
  id: '0xdac17f958d2ee523a2206206994597c13d831ec7-1',
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  tradeVolume: 1500000,
  tradeVolumeUSD: 1500000,
  txCount: 52000,
  totalLiquidity: 6000000,
  totalLiquidityETH: 3000,
  totalLiquidityUSD: 6000000,
  derivedETH: 0.0005,
  derivedUSD: 1.0,
  basePools: [],
  quotePools: [],
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

// Mock Pools
const mockPoolUSDCWETH: Pool = {
  id: '0xpool1234567890abcdef-1',
  address: '0xpool1234567890abcdef',
  name: 'USDC/WETH',
  token0: mockTokenUSDC,
  token1: mockTokenWETH,
  reserve0: 2500000,
  reserve1: 1250,
  totalSupply: 1767766.95,
  reserveETH: 2500,
  reserveUSD: 5000000,
  token0Price: 0.0005,
  token1Price: 2000,
  volumeToken0: 10000000,
  volumeToken1: 5000,
  volumeUSD: 10000000,
  volumeETH: 5000,
  txCount: 25000,
  createdAtTimestamp: 1673784000,
  createdAtBlockNumber: 16500000,
  poolHourData: [],
  mints: [],
  burns: [],
  swaps: [],
  poolType: PoolType.VOLATILE,
  gaugeFeesUSD: 50000,
  totalVotes: 1000000,
  totalFeesUSD: 100000,
  totalBribesUSD: 25000,
  totalFees0: 50000,
  totalFees1: 25,
  gaugeFees0CurrentEpoch: 5000,
  gaugeFees1CurrentEpoch: 2.5,
  totalEmissions: 10000,
  totalEmissionsUSD: 10000,
  tickSpacing: 60,
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockPoolMAGUSDC: Pool = {
  id: '0xpool9876543210fedcba-1',
  address: '0xpool9876543210fedcba',
  name: 'MAG/USDC',
  token0: mockTokenMAG,
  token1: mockTokenUSDC,
  reserve0: 500000,
  reserve1: 500000,
  totalSupply: 500000,
  reserveETH: 250,
  reserveUSD: 1000000,
  token0Price: 1.0,
  token1Price: 1.0,
  volumeToken0: 2500000,
  volumeToken1: 2500000,
  volumeUSD: 2500000,
  volumeETH: 1250,
  txCount: 12000,
  createdAtTimestamp: 1685620800,
  createdAtBlockNumber: 17500000,
  poolHourData: [],
  mints: [],
  burns: [],
  swaps: [],
  poolType: PoolType.STABLE,
  gaugeFeesUSD: 15000,
  totalVotes: 500000,
  totalFeesUSD: 30000,
  totalBribesUSD: 8000,
  totalFees0: 15000,
  totalFees1: 15000,
  gaugeFees0CurrentEpoch: 1500,
  gaugeFees1CurrentEpoch: 1500,
  totalEmissions: 5000,
  totalEmissionsUSD: 5000,
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-06-01T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockPoolDAIUSDT: Pool = {
  id: '0xpoolaaaaaaaaaaaaaaaa-1',
  address: '0xpoolaaaaaaaaaaaaaaaa',
  name: 'DAI/USDT',
  token0: mockTokenDAI,
  token1: mockTokenUSDT,
  reserve0: 3000000,
  reserve1: 3000000,
  totalSupply: 3000000,
  reserveETH: 3000,
  reserveUSD: 6000000,
  token0Price: 1.0,
  token1Price: 1.0,
  volumeToken0: 5000000,
  volumeToken1: 5000000,
  volumeUSD: 5000000,
  volumeETH: 2500,
  txCount: 18000,
  createdAtTimestamp: 1675180800,
  createdAtBlockNumber: 16700000,
  poolHourData: [],
  mints: [],
  burns: [],
  swaps: [],
  poolType: PoolType.STABLE,
  gaugeFeesUSD: 20000,
  totalVotes: 750000,
  totalFeesUSD: 40000,
  totalBribesUSD: 10000,
  totalFees0: 20000,
  totalFees1: 20000,
  gaugeFees0CurrentEpoch: 2000,
  gaugeFees1CurrentEpoch: 2000,
  totalEmissions: 7500,
  totalEmissionsUSD: 7500,
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-02-01T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockPoolWETHDAI: Pool = {
  id: '0xpoolbbbbbbbbbbbbbbbb-1',
  address: '0xpoolbbbbbbbbbbbbbbbb',
  name: 'WETH/DAI',
  token0: mockTokenWETH,
  token1: mockTokenDAI,
  reserve0: 2000,
  reserve1: 4000000,
  totalSupply: 2828427.12,
  reserveETH: 4000,
  reserveUSD: 8000000,
  token0Price: 2000,
  token1Price: 0.0005,
  volumeToken0: 8000,
  volumeToken1: 16000000,
  volumeUSD: 16000000,
  volumeETH: 8000,
  txCount: 28000,
  createdAtTimestamp: 1677600000,
  createdAtBlockNumber: 16900000,
  poolHourData: [],
  mints: [],
  burns: [],
  swaps: [],
  poolType: PoolType.VOLATILE,
  gaugeFeesUSD: 80000,
  totalVotes: 1200000,
  totalFeesUSD: 160000,
  totalBribesUSD: 40000,
  totalFees0: 40,
  totalFees1: 80000,
  gaugeFees0CurrentEpoch: 4,
  gaugeFees1CurrentEpoch: 8000,
  totalEmissions: 12000,
  totalEmissionsUSD: 12000,
  tickSpacing: 60,
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-03-01T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

const mockPoolMAGWETH: Pool = {
  id: '0xpoolcccccccccccccccc-1',
  address: '0xpoolcccccccccccccccc',
  name: 'MAG/WETH',
  token0: mockTokenMAG,
  token1: mockTokenWETH,
  reserve0: 100000,
  reserve1: 50,
  totalSupply: 2236.07,
  reserveETH: 100,
  reserveUSD: 200000,
  token0Price: 0.0005,
  token1Price: 2000,
  volumeToken0: 500000,
  volumeToken1: 250,
  volumeUSD: 500000,
  volumeETH: 250,
  txCount: 5000,
  createdAtTimestamp: 1688140800,
  createdAtBlockNumber: 17800000,
  poolHourData: [],
  mints: [],
  burns: [],
  swaps: [],
  poolType: PoolType.VOLATILE,
  gaugeFeesUSD: 5000,
  totalVotes: 300000,
  totalFeesUSD: 10000,
  totalBribesUSD: 2500,
  totalFees0: 2500,
  totalFees1: 1.25,
  gaugeFees0CurrentEpoch: 250,
  gaugeFees1CurrentEpoch: 0.125,
  totalEmissions: 3000,
  totalEmissionsUSD: 3000,
  tickSpacing: 60,
  chainId: 1,
  version: 1,
  createdAt: new Date('2023-07-01T10:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

// Single User
export const mockUser: User = {
  id: '0xuser1234567890abcdef1234567890abcdef123456',
  address: '0xuser1234567890abcdef1234567890abcdef123456',
  gaugePositions: [],
  lpPositions: [], // Will be populated below
  lockPositions: [],
  version: 1,
  createdAt: new Date('2023-01-20T08:00:00Z'),
  updatedAt: new Date('2024-02-20T14:30:00Z'),
};

// Multiple LP Positions for the same user
export const mockUserLPPositions: LiquidityPosition[] = [
  // Position 1: USDC/WETH - Largest position
  {
    id: '0xpool1234567890abcdef-0xuser1234567890abcdef1234567890abcdef123456-1',
    pool: mockPoolUSDCWETH,
    account: mockUser,
    position: 75000.5,
    creationBlock: 16520000,
    creationTransaction: '0xtx1111111111111111111111111111111111111111111111111111111111111111',
    clPositionTokenId: 10001,
    chainId: 1,
    version: 1,
    createdAt: new Date('2023-01-25T09:30:00Z'),
    updatedAt: new Date('2024-02-20T14:30:00Z'),
  },

  // Position 2: MAG/USDC - Medium position
  {
    id: '0xpool9876543210fedcba-0xuser1234567890abcdef1234567890abcdef123456-1',
    pool: mockPoolMAGUSDC,
    account: mockUser,
    position: 35000.25,
    creationBlock: 17550000,
    creationTransaction: '0xtx2222222222222222222222222222222222222222222222222222222222222222',
    clPositionTokenId: 10002,
    chainId: 1,
    version: 1,
    createdAt: new Date('2023-06-10T14:15:00Z'),
    updatedAt: new Date('2024-02-18T11:20:00Z'),
  },

  // Position 3: DAI/USDT - Small position
  {
    id: '0xpoolaaaaaaaaaaaaaaaa-0xuser1234567890abcdef1234567890abcdef123456-1',
    pool: mockPoolDAIUSDT,
    account: mockUser,
    position: 15000.0,
    creationBlock: 16750000,
    creationTransaction: '0xtx3333333333333333333333333333333333333333333333333333333333333333',
    clPositionTokenId: 10003,
    chainId: 1,
    version: 1,
    createdAt: new Date('2023-02-15T10:00:00Z'),
    updatedAt: new Date('2024-02-10T08:45:00Z'),
  },

  // Position 4: WETH/DAI - Recent position
  {
    id: '0xpoolbbbbbbbbbbbbbbbb-0xuser1234567890abcdef1234567890abcdef123456-1',
    pool: mockPoolWETHDAI,
    account: mockUser,
    position: 50000.75,
    creationBlock: 18200000,
    creationTransaction: '0xtx4444444444444444444444444444444444444444444444444444444444444444',
    clPositionTokenId: 10004,
    chainId: 1,
    version: 1,
    createdAt: new Date('2024-01-05T16:30:00Z'),
    updatedAt: new Date('2024-02-20T14:30:00Z'),
  },

  // Position 5: MAG/WETH - Small recent position
  {
    id: '0xpoolcccccccccccccccc-0xuser1234567890abcdef1234567890abcdef123456-1',
    pool: mockPoolMAGWETH,
    account: mockUser,
    position: 8500.0,
    creationBlock: 18350000,
    creationTransaction: '0xtx5555555555555555555555555555555555555555555555555555555555555555',
    clPositionTokenId: 10005,
    chainId: 1,
    version: 1,
    createdAt: new Date('2024-02-01T11:00:00Z'),
    updatedAt: new Date('2024-02-01T11:00:00Z'),
  },
];

// Update the user object with the LP positions
mockUser.lpPositions = mockUserLPPositions;

// Summary helper
export function getmockUserLPPositionsSummary() {
  const totalPositionValue = mockUserLPPositions.reduce((sum, pos) => sum + pos.position, 0);
  const poolCount = mockUserLPPositions.length;
  const oldestPosition = mockUserLPPositions.reduce((oldest, pos) =>
    pos.createdAt < oldest.createdAt ? pos : oldest,
  );
  const newestPosition = mockUserLPPositions.reduce((newest, pos) =>
    pos.createdAt > newest.createdAt ? pos : newest,
  );

  return {
    userAddress: mockUser.address,
    totalPositions: poolCount,
    totalLiquidityValue: totalPositionValue,
    pools: mockUserLPPositions.map((pos) => ({
      name: pos.pool.name,
      type: pos.pool.poolType,
      liquidityAmount: pos.position,
    })),
    oldestPosition: {
      pool: oldestPosition.pool.name,
      date: oldestPosition.createdAt,
    },
    newestPosition: {
      pool: newestPosition.pool.name,
      date: newestPosition.createdAt,
    },
  };
}

// ─── Analytics Mock Data ─────────────────────────────────────────────────────

/** Generate a smooth time-series with slight random walk */
function generateSeries(days: number, seed: number, volatility = 0.04): TimeSeriesDataPoint[] {
  const now = new Date();
  const points: TimeSeriesDataPoint[] = [];
  let value = seed;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    value = Math.max(seed * 0.5, value * (1 + (Math.random() - 0.48) * volatility));
    points.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
    });
  }
  return points;
}

/** Protocol TVL over time */
export const MOCK_TVL_SERIES: Record<Timeframe, TimeSeriesDataPoint[]> = {
  '1D': generateSeries(24, 28_000_000, 0.01).map((p, i) => ({
    ...p,
    date: `${i}:00`,
  })),
  '7D': generateSeries(7, 26_000_000, 0.04),
  '30D': generateSeries(30, 22_000_000, 0.05),
};

/** Protocol trading volume over time */
export const MOCK_VOLUME_SERIES: Record<Timeframe, TimeSeriesDataPoint[]> = {
  '1D': generateSeries(24, 1_200_000, 0.08).map((p, i) => ({
    ...p,
    date: `${i}:00`,
  })),
  '7D': generateSeries(7, 900_000, 0.1),
  '30D': generateSeries(30, 750_000, 0.12),
};

/** Mock top tokens for analytics */
export const MOCK_TOP_TOKENS: (Token & {
  priceUSD: number;
  priceChange24h: number;
  volume24h: number;
})[] = [
  { ...mockTokenWETH, priceUSD: 2413.5, priceChange24h: 2.3, volume24h: 4_200_000 },
  { ...mockTokenUSDC, priceUSD: 1.0, priceChange24h: 0.01, volume24h: 3_800_000 },
  { ...mockTokenUSDT, priceUSD: 1.0, priceChange24h: -0.02, volume24h: 3_100_000 },
  { ...mockTokenDAI, priceUSD: 1.0, priceChange24h: 0.0, volume24h: 1_900_000 },
  { ...mockTokenMAG, priceUSD: 0.82, priceChange24h: -4.1, volume24h: 540_000 },
];

/** Mock top pools for analytics */
export const MOCK_TOP_POOLS: Pool[] = [
  mockPoolWETHDAI,
  mockPoolUSDCWETH,
  mockPoolDAIUSDT,
  mockPoolMAGUSDC,
  mockPoolMAGWETH,
];

export type TxType = 'Swap' | 'Add' | 'Remove';

export interface MockTransaction {
  id: string;
  type: TxType;
  pair: string;
  amountUSD: number;
  account: string;
  timeAgo: string;
  poolId: string;
}

/** Static mock recent transactions */
export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'tx01',
    type: 'Swap',
    pair: 'WETH → DAI',
    amountUSD: 8_412,
    account: '0xaBcD...1234',
    timeAgo: '12s ago',
    poolId: mockPoolWETHDAI.id,
  },
  {
    id: 'tx02',
    type: 'Add',
    pair: 'USDC/WETH',
    amountUSD: 25_000,
    account: '0x1234...5678',
    timeAgo: '45s ago',
    poolId: mockPoolUSDCWETH.id,
  },
  {
    id: 'tx03',
    type: 'Swap',
    pair: 'USDC → WETH',
    amountUSD: 1_200,
    account: '0xDeAd...bEeF',
    timeAgo: '1m ago',
    poolId: mockPoolUSDCWETH.id,
  },
  {
    id: 'tx04',
    type: 'Remove',
    pair: 'DAI/USDT',
    amountUSD: 6_700,
    account: '0xF00D...cAfE',
    timeAgo: '2m ago',
    poolId: mockPoolDAIUSDT.id,
  },
  {
    id: 'tx05',
    type: 'Swap',
    pair: 'MAG → USDC',
    amountUSD: 530,
    account: '0xBabe...0001',
    timeAgo: '3m ago',
    poolId: mockPoolMAGUSDC.id,
  },
  {
    id: 'tx06',
    type: 'Add',
    pair: 'MAG/WETH',
    amountUSD: 4_100,
    account: '0x9999...aaaa',
    timeAgo: '5m ago',
    poolId: mockPoolMAGWETH.id,
  },
  {
    id: 'tx07',
    type: 'Swap',
    pair: 'DAI → USDT',
    amountUSD: 3_280,
    account: '0xCCCC...1111',
    timeAgo: '7m ago',
    poolId: mockPoolDAIUSDT.id,
  },
  {
    id: 'tx08',
    type: 'Swap',
    pair: 'WETH → USDC',
    amountUSD: 11_050,
    account: '0x4444...7777',
    timeAgo: '9m ago',
    poolId: mockPoolUSDCWETH.id,
  },
  {
    id: 'tx09',
    type: 'Remove',
    pair: 'USDC/WETH',
    amountUSD: 18_900,
    account: '0xAAAA...BBBB',
    timeAgo: '11m ago',
    poolId: mockPoolUSDCWETH.id,
  },
  {
    id: 'tx10',
    type: 'Add',
    pair: 'DAI/USDT',
    amountUSD: 9_000,
    account: '0x1111...2222',
    timeAgo: '15m ago',
    poolId: mockPoolDAIUSDT.id,
  },
  {
    id: 'tx11',
    type: 'Swap',
    pair: 'USDC → MAG',
    amountUSD: 750,
    account: '0x8888...3333',
    timeAgo: '18m ago',
    poolId: mockPoolMAGUSDC.id,
  },
  {
    id: 'tx12',
    type: 'Swap',
    pair: 'WETH → MAG',
    amountUSD: 2_200,
    account: '0x5555...6666',
    timeAgo: '22m ago',
    poolId: mockPoolMAGWETH.id,
  },
  {
    id: 'tx13',
    type: 'Add',
    pair: 'WETH/DAI',
    amountUSD: 40_000,
    account: '0x7777...8888',
    timeAgo: '28m ago',
    poolId: mockPoolWETHDAI.id,
  },
  {
    id: 'tx14',
    type: 'Remove',
    pair: 'MAG/USDC',
    amountUSD: 3_100,
    account: '0x0000...DEAD',
    timeAgo: '35m ago',
    poolId: mockPoolMAGUSDC.id,
  },
  {
    id: 'tx15',
    type: 'Swap',
    pair: 'DAI → WETH',
    amountUSD: 5_600,
    account: '0xBEEF...CAFE',
    timeAgo: '41m ago',
    poolId: mockPoolWETHDAI.id,
  },
];

/** Per-pool time-series for pool analytics page */
export const MOCK_POOL_TVL: Record<string, Record<Timeframe, TimeSeriesDataPoint[]>> = {
  [mockPoolWETHDAI.id]: {
    '1D': generateSeries(24, 8_000_000, 0.01).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 7_500_000, 0.04),
    '30D': generateSeries(30, 6_000_000, 0.06),
  },
  [mockPoolUSDCWETH.id]: {
    '1D': generateSeries(24, 5_000_000, 0.01).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 4_800_000, 0.04),
    '30D': generateSeries(30, 4_000_000, 0.06),
  },
};

export const MOCK_POOL_VOLUME: Record<string, Record<Timeframe, TimeSeriesDataPoint[]>> = {
  [mockPoolWETHDAI.id]: {
    '1D': generateSeries(24, 600_000, 0.12).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 500_000, 0.14),
    '30D': generateSeries(30, 400_000, 0.16),
  },
  [mockPoolUSDCWETH.id]: {
    '1D': generateSeries(24, 400_000, 0.1).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 350_000, 0.12),
    '30D': generateSeries(30, 280_000, 0.14),
  },
};

/** Per-token price + volume time-series */
export const MOCK_TOKEN_PRICE: Record<string, Record<Timeframe, TimeSeriesDataPoint[]>> = {
  [mockTokenWETH.id]: {
    '1D': generateSeries(24, 2413, 0.005).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 2300, 0.03),
    '30D': generateSeries(30, 2100, 0.05),
  },
  [mockTokenMAG.id]: {
    '1D': generateSeries(24, 0.82, 0.01).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 0.85, 0.05),
    '30D': generateSeries(30, 0.75, 0.08),
  },
};

export const MOCK_TOKEN_VOLUME: Record<string, Record<Timeframe, TimeSeriesDataPoint[]>> = {
  [mockTokenWETH.id]: {
    '1D': generateSeries(24, 420_000, 0.15).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 350_000, 0.18),
    '30D': generateSeries(30, 280_000, 0.2),
  },
  [mockTokenMAG.id]: {
    '1D': generateSeries(24, 54_000, 0.2).map((p, i) => ({ ...p, date: `${i}:00` })),
    '7D': generateSeries(7, 48_000, 0.22),
    '30D': generateSeries(30, 40_000, 0.25),
  },
};
