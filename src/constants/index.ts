import { clientEnv, validateClientEnv } from '@/config/env/client';

export const DEFAULT_PROCESS_DURATION = 5000;
export const BASE_POINT = 1000;
export const LARGE_BASE_POINT = 10000;
export const MIN_IN_SEC = 3600;
export const REFETCH_INTERVALS = 10000;
export const V3_SQRT_PRICE_BASIS = BigInt(Math.pow(2, 96));
export const V3_TICK_BASIS = 1.0001;
export const BI_ZERO = BigInt(0);

export const CHAINS = {
  ARC_TESTNET: 5042002,
};
export const CHAINS_INFORMATION = {
  [CHAINS.ARC_TESTNET]: {
    chainId: CHAINS.ARC_TESTNET,
    rpcUrl: 'https://rpc.drpc.testnet.arc.network',
    explorerUrl: 'https://testnet.arcscan.app',
    img: '/assets/images/arc_network.svg',
    name: 'Arc Testnet',
    symbol: 'ARC',
  },
};
export const SCREEN_WIDTHS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
};
export const OP_SETTINGS = {
  default_gql_items_limit: 1000,
  default_refetch_interval: 30000, // 30 seconds
  default_tick_interval: 10000, // 10 seconds
};
export const API_QUERY_SETTINGS = {
  default_pools_per_page: 10,
};
export const CHAIN_GQL_URI = {
  [CHAINS.ARC_TESTNET]:
    validateClientEnv().data?.NEXT_PUBLIC_GQL_URI || clientEnv.NEXT_PUBLIC_GQL_URI, // Arc network GQL is the same as the default GQL URI, but this allows for chain-specific overrides in the future if needed
};
export const RouterType = {
  AUTO: 'auto',
  V2: 'v2',
  V3: 'v3',
} as const;

// Chain parameters
export const ETHER = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const V2_ROUTERS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x7961c29F9007ADbE089c1C4163a77e453A960583',
};
export const NFPM: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x24e95fe9fF4D4F988911cfd9A5D9443b3E640C22',
};
export const AUTO_SWAP_EXECUTORS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x3562cceE39adc7465f1bAed088043C5C5B41e4e6',
};
export const V2_SWAP_EXECUTORS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xEeeC1d828520fC26541624c4e2E34376220CB93a',
};
export const V3_SWAP_EXECUTORS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x2D67FC1622099Ed068a2049c83773D9016c4aaEf',
};
export const WETH: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x911b4000D3422F482F4062a913885f7b035382Df',
};
export const V2_FACTORY: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xE41d241720FEE7cD6BDfA9aB3204d23687703CD5',
};
export const ORACLE: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xF6a7F229447FB986195c4dC8305553C8A8518d06',
};
