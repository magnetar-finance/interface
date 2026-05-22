'use client';

import { AssetResponseType } from '@/config/github-assets.config';
import { useAssetsFromGithub } from '@/hooks/github-api';
import { getDictionaryFromArray } from '@/utils/objects';
import React, { createContext, useContext, useMemo } from 'react';

interface GithubAssetsContextType {
  isLoading: boolean;
  assets: AssetResponseType;
  assetsDictionary: {
    [key: string | number]: AssetResponseType[number];
  };
}

const GithubAssetsContext = createContext<GithubAssetsContextType>({} as GithubAssetsContextType);

export const GithubAssetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { githubAssets: assets, isLoading } = useAssetsFromGithub(60000);
  const assetsDictionary = useMemo(() => getDictionaryFromArray(assets, 'address'), [assets]);
  return (
    <GithubAssetsContext.Provider value={{ isLoading, assets, assetsDictionary }}>
      {children}
    </GithubAssetsContext.Provider>
  );
};

export function useGHAssetsContext() {
  return useContext(GithubAssetsContext);
}
