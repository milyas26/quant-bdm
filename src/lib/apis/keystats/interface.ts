export interface RefreshKeystatsResponse {
  message: string
}

export interface RefreshKeystatsError {
  error: string
  message: string
}

export interface StockKeystatsResponse {
  symbol: string
  keystats: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
