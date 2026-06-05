import { cookieStorage, createStorage } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseAccount,
  geminiWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { arcTestnet } from 'viem/chains';
import { defineChain } from 'viem';

const litVMTestnet = defineChain({
  id: 4441,
  name: 'Liteforge Testnet',
  testnet: true,
  rpcUrls: {
    default: {
      http: ['https://liteforge.rpc.caldera.xyz/http'],
      webSocket: ['wss://liteforge.rpc.caldera.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Liteforge Testnet',
      url: 'https://liteforge.explorer.caldera.xyz',
    },
  },
  nativeCurrency: {
    symbol: 'zkLTC',
    name: 'Liteforge Testnet',
    decimals: 18,
  },
});

export function loadRainbowkitConfig(projectId: string) {
  return getDefaultConfig({
    appName: 'Magnetar Finance - MegaDEX',
    projectId,
    chains: [litVMTestnet, arcTestnet],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    wallets: [
      {
        groupName: 'Available Wallets',
        wallets: [
          ...(typeof window !== 'undefined'
            ? [
                rainbowWallet,
                trustWallet,
                metaMaskWallet,
                baseAccount,
                walletConnectWallet,
                geminiWallet,
                safeWallet,
              ]
            : []),
          injectedWallet,
        ],
      },
    ],
  });
}
