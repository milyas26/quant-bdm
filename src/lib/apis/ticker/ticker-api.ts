import api from "@/lib/interceptor"
import type {
  GetTickersParams,
  GetTickersResponse,
  GetScreenerResponse,
} from "./interface"

export * from "./interface"

export const getTickers = async (params: GetTickersParams) => {
  const { data } = await api.get<GetTickersResponse>("/tickers", { params })
  return data
}

export const getScreener = async (params: GetTickersParams) => {
  const { data } = await api.get<GetScreenerResponse>("/screener", { params })
  return data
}

export const deleteTicker = async (symbol: string) => {
  await api.delete(`/tickers/${symbol}`)
}

export const fetchAndSaveTickerInfo = async (symbol: string) => {
  const { data } = await api.get(`/fetch-ticker/${symbol}`)
  return data
}

export const fetchAllTickerInfo = async () => {
  const { data } = await api.get(`/fetch-all-ticker`)
  return data
}

export const getTickerDetail = async (symbol: string) => {
  const { data } = await api.get(`/tickers/${symbol}`)
  return data
}

export const addTicker = async (symbol: string) => {
  try {
    const { data } = await api.post("/add-ticker", { symbol })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to add ticker")
    }
    throw error
  }
}

export const refreshAllTickers = async () => {
  const { data } = await api.post("/refresh-tickers")
  return data
}
