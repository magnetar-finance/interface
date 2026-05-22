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

export function loadRainbowkitConfig(projectId: string) {
  return getDefaultConfig({
    appName: 'Magnetar Finance - MegaDEX',
    projectId,
    chains: [arcTestnet],
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
