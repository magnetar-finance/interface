import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  baseAccount,
  geminiWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { type Chain } from "viem";

// Chains
const duskTestnet = {
  id: 745,
  name: "Dusk Testnet",
  nativeCurrency: { name: "Dusk", symbol: "DUSK", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.evm.dusk.network"] } },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://explorer.testnet.evm.dusk.network" },
  },
  testnet: true,
} as const satisfies Chain;

const pharosTestnet = {
  id: 688689,
  name: "Pharos Testnet",
  nativeCurrency: { name: "Pharos", symbol: "PHRS", decimals: 18 },
  rpcUrls: { default: { http: ["https://atlantic.dplabs-internal.com"] } },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://atlantic.pharosscan.xyz" },
  },
  testnet: true,
} as const satisfies Chain;

const seismicTestnet = {
  id: 5124,
  name: "Seismic Testnet",
  nativeCurrency: { name: "Seismic", symbol: "SEI", decimals: 18 },
  rpcUrls: { default: { http: ["https://gcp-2.seismictest.net/rpc"] } },
  blockExplorers: {
    default: { name: "Socialscan", url: "https://seismic-testnet.socialscan.io" },
  },
  testnet: true,
} as const satisfies Chain;

export function loadRainbowkitConfig(projectId: string) {
  return getDefaultConfig({
    appName: "Magnetar Finance - MegaDEX",
    projectId,
    chains: [duskTestnet, pharosTestnet, seismicTestnet],
    ssr: true,
    wallets: [
      {
        groupName: "Available Wallets",
        wallets: [
          rainbowWallet,
          trustWallet,
          metaMaskWallet,
          baseAccount,
          walletConnectWallet,
          geminiWallet,
          safeWallet,
          injectedWallet,
        ],
      },
    ],
  });
}
