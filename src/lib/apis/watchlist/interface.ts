
export interface ScreenerSnapshot {
  price: number
  change: number
  changePercentage: number
  volume: number
  isVolumeSpike: boolean
  netBrokerFlow: number
  bandarStatus: string
  momentum: string
  isBreakout: boolean
  date: string
  brokersBuy: { netbsBrokerCode: string }[]
  brokersSell: { netbsBrokerCode: string }[]
}

export interface WatchlistTicker {
  symbol: string
  logo: string | null
  name: string | null
  sector: string | null
  subSector: string | null
  screeners: ScreenerSnapshot[]
}

export interface Watchlist {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  order: number
  _count: { tickers: number }
}

export interface WatchlistTickers {
  id: number
  name: string
  tickers: WatchlistTicker[]
}

export interface CreateWatchlistParams {
  name: string
  tickers?: string[]
}