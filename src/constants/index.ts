export const CHAINS = {
  DUSK_TESTNET: 745,
  PHAROS_TESTNET: 688689,
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
};
