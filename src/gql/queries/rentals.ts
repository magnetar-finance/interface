import { graphql } from '../codegen';

export const QUERY_RENTALS = graphql(`
  query Rentals($skip: Int = 0, $limit: Int = 1000) {
    rentals(skip: $skip, first: $limit) {
      id
      address
      escrow
      price
      runsUntil
      reaped
      seller {
        id
        address
      }
      buyer {
        id
        address
      }
      paymentToken {
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
      status
      lock {
        id
        position
        lockId
        lockType
        permanent
        unlockTime
        totalVoteWeightGiven
        votes(first: 1000) {
          id
          weight
          pool {
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
              feeVotingReward
              bribeVotingReward
            }
          }
        }
      }
    }
  }
`);
