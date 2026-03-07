
export interface Ticker {
  symbol: string
  name: string | null
  isLiquid: boolean
  price: number
  isSuspend: boolean
  isUnusual: boolean
  isOnWatchlist: boolean
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

export interface GetTickersParams {
  page?: number
  limit?: number
  search?: string
  isLiquid?: boolean
  isSuspend?: boolean
  isUnusual?: boolean
  minPrice?: number
  maxPrice?: number
}