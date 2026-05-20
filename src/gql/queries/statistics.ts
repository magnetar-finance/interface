import { graphql } from '../codegen';

export const QUERY_STATS = graphql(`
  query Statistics {
    statistics(id: "1") {
      totalPairsCreated
      totalBribesUSD
      totalFeesUSD
      totalVolumeLockedUSD
      totalVolumeLockedETH
      totalTradeVolumeUSD
      totalTradeVolumeETH
    }
  }
`);
