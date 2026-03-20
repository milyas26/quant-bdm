
export interface WatchlistTicker {
  symbol: string
  name: string | null
  sector: string | null
  subSector: string | null
}

export interface Watchlist {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  tickers: WatchlistTicker[]
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