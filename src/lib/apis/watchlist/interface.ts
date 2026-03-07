
export interface Watchlist {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  tickers: {
    symbol: string
    price: number
    name: string | null
    isLiquid: boolean
    isSuspend: boolean
    isUnusual: boolean
  }[]
}

export interface CreateWatchlistParams {
  name: string
  tickers?: string[]
}