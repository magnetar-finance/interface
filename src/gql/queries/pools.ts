import { graphql } from '../codegen';

export const QUERY_SINGLE_POOL = graphql(`
  query SinglePool($id: ID!) {
    pool(id: $id) {
      id
      name
      poolType
      reserve0
      reserve1
      reserveETH
      reserveUSD
      tickSpacing
      token0Price
      token1Price
      totalBribesUSD
      totalEmissions
      totalEmissionsUSD
      totalFees0
      totalFees1
      totalFeesUSD
      totalSupply
      totalVotes
      txCount
      volumeETH
      volumeToken0
      volumeToken1
      volumeUSD
      address
      gaugeFeesUSD
      gaugeFees1CurrentEpoch
      gaugeFees0CurrentEpoch
      token1 {
        address
        derivedETH
        derivedUSD
        id
        name
        symbol
        decimals
      }
      token0 {
        address
        derivedETH
        derivedUSD
        id
        name
        symbol
        decimals
      }
      gauge {
        rewardRate
        id
        address
        fees0
        fees1
        isAlive
      }
    }
  }
`);

export const QUERY_ALL_POOLS = graphql(`
  query AllPools($skip: Int = 0, $limit: Int = 2000) {
    pools(skip: $skip, first: $limit) {
      id
      name
      poolType
      reserve0
      reserve1
      reserveETH
      reserveUSD
      tickSpacing
      token0Price
      token1Price
      totalBribesUSD
      totalEmissions
      totalEmissionsUSD
      totalFees0
      totalFees1
      totalFeesUSD
      totalSupply
      totalVotes
      txCount
      volumeETH
      volumeToken0
      volumeToken1
      volumeUSD
      address
      gaugeFeesUSD
      gaugeFees1CurrentEpoch
      gaugeFees0CurrentEpoch
      token1 {
        address
        derivedETH
        derivedUSD
        id
        name
        symbol
        decimals
      }
      token0 {
        address
        derivedETH
        derivedUSD
        id
        name
        symbol
        decimals
      }
      gauge {
        rewardRate
        id
        address
        fees0
        fees1
        isAlive
      }
    }
  }
`);

export const QUERY_POOL_DAY_DATA = graphql(`
  query PoolDayData(
    $skip: Int = 0
    $limit: Int = 1000
    $poolId: String!
    $dateMin: Int
    $dateMax: Int
  ) {
    poolDayDatas(
      skip: $skip
      first: $limit
      where: { pool: $poolId, date_gte: $dateMin, date_lte: $dateMax }
    ) {
      id
      reserve0
      reserve1
      reserveETH
      reserveUSD
      dailyVolumeUSD
      dailyVolumeETH
      dailyVolumeToken0
      dailyVolumeToken1
      date
    }
  }
`);

export const QUERY_POOL_HOUR_DATA = graphql(`
  query PoolHourData(
    $skip: Int = 0
    $limit: Int = 1000
    $poolId: String!
    $hourMin: Int
    $hourMax: Int
  ) {
    poolHourDatas(
      skip: $skip
      first: $limit
      where: { pool: $poolId, hourStartUnix_gte: $hourMin, hourStartUnix_lte: $hourMax }
    ) {
      id
      hourStartUnix
      reserve0
      reserve1
      reserveUSD
      reserveETH
      hourlyVolumeUSD
      hourlyVolumeETH
      hourlyVolumeToken0
      hourlyVolumeToken1
    }
  }
`);
