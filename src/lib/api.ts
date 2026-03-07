import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:8000",
})

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

export const getTickers = async (params: GetTickersParams) => {
  const { data } = await api.get<GetTickersResponse>("/tickers", { params })
  return data
}

export const deleteTicker = async (symbol: string) => {
  await api.delete(`/tickers/${symbol}`)
}

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

export const getWatchlists = async () => {
  const { data } = await api.get<Watchlist[]>("/watchlists")
  return data
}

export const toggleTickerInWatchlist = async (symbol: string) => {
  const { data } = await api.post<{ isOnWatchlist: boolean; message: string }>(
    "/watchlists/toggle",
    { symbol }
  )
  return data
}

export interface BrokerSummaryParams {
  symbol: string
  from: string
  to: string
  transaction_type?: string
  market_board?: string
  investor_type?: string
  limit?: string
}

export interface BrokerData {
  netbsBrokerCode: string
  bval: string
  sval: string
  // Add other broker fields as needed
}

export interface BrokerSummaryData {
  brokersBuy: BrokerData[]
  brokersSell: BrokerData[]
  // Add other summary fields as needed
}

export interface BrokerSummaryResponse {
  message: string
  data: BrokerSummaryData
}

export const getBrokerSummary = async (params: BrokerSummaryParams) => {
  const { data } = await api.get<BrokerSummaryResponse>(
    "/fetch-broker-summary",
    {
      params: {
        symbol: params.symbol,
        from: params.from,
        to: params.to,
        transaction_type: params.transaction_type || "TRANSACTION_TYPE_GROSS",
        market_board: params.market_board || "MARKET_BOARD_REGULER",
        investor_type: params.investor_type || "INVESTOR_TYPE_ALL",
        limit: params.limit || "25",
      },
    }
  )
  return data
}
