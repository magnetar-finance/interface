"use client";

import { clientEnv } from "@/config/env/client";
import { loadRainbowkitConfig } from "@/config/rainbowkit.config";
import { GithubAssetsProvider } from "@/contexts/github-assets";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

// Polyfill for Node 22 global localStorage bug
if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  try {
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      },
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // Ignore proxy definition errors
  }
}

const wagmiConfig = loadRainbowkitConfig(clientEnv.NEXT_PUBLIC_WALLET_CONNECT_ID);

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <GithubAssetsProvider>{children}</GithubAssetsProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
