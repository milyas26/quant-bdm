
export interface Ticker {
  symbol: string
  name: string | null
  price: number
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
  minPrice?: number
  maxPrice?: number
}