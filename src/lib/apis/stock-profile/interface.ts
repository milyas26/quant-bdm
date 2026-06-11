export interface RefreshProfilesResponse {
  message: string
}

export interface RefreshProfilesError {
  error: string
  message: string
}

export interface StockProfileItem {
  symbol: string
  hasProfile: boolean
  updatedAt: string | null
}

export interface ListProfilesResponse {
  data: StockProfileItem[]
}
