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

const rainbowkitConfig = getDefaultConfig({
  appName: "Magnetar Finance - MegaDEX",
  projectId: "152620a47ef5579fde16db96cbb1a308",
  chains: [duskTestnet, pharosTestnet],
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

export default rainbowkitConfig;
