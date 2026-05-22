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
      txCount
    }
  }
`);

export const QUERY_OVERALLDAY_DATA = graphql(`
  query OverallDayData($skip: Int = 0, $limit: Int = 1000, $dateMin: Int, $dateMax: Int) {
    overallDayDatas(skip: $skip, first: $limit, where: { date_gte: $dateMin, date_lte: $dateMax }) {
      id
      date
      volumeETH
      volumeUSD
      liquidityETH
      liquidityUSD
      txCount
      totalTradeVolumeETH
      totalTradeVolumeUSD
    }
  }
`);
