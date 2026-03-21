
export interface BrokerEntry {
  code: string
  value: number
}

export interface Ticker {
  symbol: string
  name: string | null
  logo: string | null
  sector: string | null
  subSector: string | null
  price: number
  change: number
  changePercentage: number
  volume: number
  isVolumeSpike: boolean
  netBrokerFlow: number
  bandarStatus: string
  smartMoneyScore: number
  liquidityScore: string
  momentum: string
  isBreakout: boolean
  isOnWatchlist: boolean
  accumulationDistribution: {
    d1: number
    w1: number
    m1: number
  }
  topBuyers: BrokerEntry[]
  topSellers: BrokerEntry[]
}

export interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetTickersResponse {
  data: Ticker[]
  meta: Meta
}

export interface ScreenerTicker extends Ticker {
  screenerId: number
  date: string
}

export interface GetScreenerResponse {
  data: ScreenerTicker[]
  meta: Meta
}

export interface GetTickersParams {
  page?: number
  limit?: number
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  signals?: string[]
  bandarStatus?: string[]
  momentum?: string[]
  date?: string
  accDistOperator?: "gt" | "lt"
  accDist1D?: number
  accDist1W?: number
  accDist1M?: number
  minScore?: number
  maxScore?: number
  netBrokerFlowOperator?: "gt" | "lt"
  netBrokerFlowValue?: number
}
