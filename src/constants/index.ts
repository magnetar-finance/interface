import { clientEnv, validateClientEnv } from '@/config/env/client';

export const DEFAULT_PROCESS_DURATION = 5000;
export const BASE_POINT = 1000;
export const LARGE_BASE_POINT = 10000;
export const MIN_IN_SEC = 3600;
export const REFETCH_INTERVALS = 10000;
export const V3_SQRT_PRICE_BASIS = Math.pow(2, 96);
export const V3_TICK_BASIS = 1.0001;
export const BI_ZERO = BigInt(0);

export const CHAINS = {
  ARC_TESTNET: 5042002,
  LITVM_TESTNET: 4441,
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
  [CHAINS.LITVM_TESTNET]: {
    chainId: CHAINS.LITVM_TESTNET,
    rpcUrl: 'https://liteforge.rpc.caldera.xyz/http',
    explorerUrl: 'https://liteforge.explorer.caldera.xyz',
    img: '/assets/images/litvm_network.png',
    name: 'Liteforge Testnet',
    symbol: 'zkLTC',
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
  [CHAINS.LITVM_TESTNET]:
    'https://api.goldsky.com/api/public/project_clws3jv71bgap01u93r59ccbm/subgraphs/magnetar-liteforge/1.0.1/gn',
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
  [CHAINS.LITVM_TESTNET]: '0x7961c29F9007ADbE089c1C4163a77e453A960583',
};
export const NFPM: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x8948f9d59203F9dCF4de4B2baa10887993274C3C',
  [CHAINS.LITVM_TESTNET]: '0x842CDC95B8BC3A19a8fFc91f200e51c8aF6faFC6',
};
export const AUTO_SWAP_EXECUTORS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x3562cceE39adc7465f1bAed088043C5C5B41e4e6',
  [CHAINS.LITVM_TESTNET]: '0xD3F9Ba8b83D5a71bb75a9955A1494d5B1D4E76da',
};
export const V2_SWAP_EXECUTORS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xEeeC1d828520fC26541624c4e2E34376220CB93a',
  [CHAINS.LITVM_TESTNET]: '0xb33B33B1c457a4E26e3Bb2391cE07a73B73b0d22',
};
export const V3_SWAP_EXECUTORS: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x2D67FC1622099Ed068a2049c83773D9016c4aaEf',
  [CHAINS.LITVM_TESTNET]: '0x4dCE4c7902fed6f3874901348595505B32752e05',
};
export const WETH: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x911b4000D3422F482F4062a913885f7b035382Df',
  [CHAINS.LITVM_TESTNET]: '0xeb29947d9c1cd59af2b413b47505bf89a47be0d4',
};
export const V2_FACTORY: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xE41d241720FEE7cD6BDfA9aB3204d23687703CD5',
  [CHAINS.LITVM_TESTNET]: '0xE41d241720FEE7cD6BDfA9aB3204d23687703CD5',
};
export const V3_FACTORY: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xf6a6a429a0b9676293Df0E3616A6a33cA673b5C3',
  [CHAINS.LITVM_TESTNET]: '0xC05b371680057B55e23C27d23453592cdf972Ec1',
};
export const VE: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xF1B1c2f4E8FcD4aFCA0E608B1c7dB8b4e700154F',
  [CHAINS.LITVM_TESTNET]: '0xF1B1c2f4E8FcD4aFCA0E608B1c7dB8b4e700154F',
};
export const VOTER: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x2914f5e8A40047C7421aaDad35CDB06870ecA0c5',
  [CHAINS.LITVM_TESTNET]: '0x2914f5e8A40047C7421aaDad35CDB06870ecA0c5',
};
export const ORACLE: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0xF6a7F229447FB986195c4dC8305553C8A8518d06',
  [CHAINS.LITVM_TESTNET]: '0x46e65AfC0BBF7cc037D82AC2eA9aaf560dD962Cc',
};
export const MGN: { [key: number]: `0x${string}` } = {
  [CHAINS.ARC_TESTNET]: '0x64FAF984Bf60dE19e24238521814cA98574E3b00',
  [CHAINS.LITVM_TESTNET]: '0x64FAF984Bf60dE19e24238521814cA98574E3b00',
};
