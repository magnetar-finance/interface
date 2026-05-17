export const CHAINS = {
  DUSK_TESTNET: 745,
  PHAROS_TESTNET: 688689,
  SEISMIC_TESTNET: 5124,
};

export const CHAINS_INFORMATION = {
  [CHAINS.DUSK_TESTNET]: {
    chainId: CHAINS.DUSK_TESTNET,
    rpcUrl: "https://rpc.testnet.evm.dusk.network",
    explorerUrl: "https://explorer.testnet.evm.dusk.network",
    img: "/assets/images/dusk.svg",
    name: "DuskEVM Testnet",
    symbol: "DUSK",
  },
  [CHAINS.PHAROS_TESTNET]: {
    chainId: CHAINS.PHAROS_TESTNET,
    rpcUrl: "https://atlantic.dplabs-internal.com",
    explorerUrl: "https://atlantic.pharosscan.xyz",
    img: "/assets/images/pharos.png",
    name: "Pharos Testnet",
    symbol: "PHRS",
  },
  [CHAINS.SEISMIC_TESTNET]: {
    chainId: CHAINS.SEISMIC_TESTNET,
    rpcUrl: "https://gcp-2.seismictest.net/rpc",
    explorerUrl: "https://seismic-testnet.socialscan.io",
    img: "/assets/images/seismic.png",
    name: "Seismic Testnet",
    symbol: "SEI",
  },
};

export const SCREEN_WIDTHS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
};

export const API_QUERY_SETTINGS = {
  default_pools_per_page: 10,
};
