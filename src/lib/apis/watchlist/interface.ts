
export interface Watchlist {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  tickers: {
    symbol: string
    name: string | null
  }[]
}

export interface CreateWatchlistParams {
  name: string
  tickers?: string[]
}