
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
    d3: number
    d6: number
  }
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
}
