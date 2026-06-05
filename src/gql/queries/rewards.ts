import { graphql } from '../codegen';

export const QUERY_NOTIFY_REWARDS_BY_VOTING_REWARDS = graphql(`
  query NotifyRewardsByVR($skip: Int = 0, $limit: Int = 1000, $rewardIds: [ID!]) {
    notifyRewards(skip: $skip, first: $limit, where: { votingRewards_: { id_in: $rewardIds } }) {
      id
      votingRewards {
        id
        votingRewardsType
        gauge {
          depositPool {
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
          }
        }
      }
      token {
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
  }
`);
