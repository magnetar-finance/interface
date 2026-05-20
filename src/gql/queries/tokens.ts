import { graphql } from '../codegen';

export const QUERY_TOKEN_DAY_DATA = graphql(`
  query TokenDayData($skip: Int = 0, $limit: Int = 1000, $tokenId: String!) {
    tokenDayDatas(skip: $skip, first: $limit, where: { token_contains_nocase: $tokenId }) {
      id
      dailyVolumeETH
      dailyVolumeUSD
      dailyVolumeToken
      priceUSD
      priceETH
      date
    }
  }
`);

export const QUERY_TOKEN_INFO = graphql(`
  query TokenInfo($id: ID!) {
    token(id: $id) {
      id
      decimals
      derivedETH
      derivedUSD
      name
      symbol
      totalLiquidity
      totalLiquidityUSD
      totalLiquidityETH
      tradeVolume
      tradeVolumeUSD
    }
  }
`);
