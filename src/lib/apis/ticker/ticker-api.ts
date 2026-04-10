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
  const { data } = await api.get<GetScreenerResponse>("/screener", {
    params,
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v))
        } else {
          searchParams.append(key, String(value))
        }
      })
      return searchParams.toString()
    },
  })
  return data
}

export const getScreenerDates = async (): Promise<string[]> => {
  const { data } = await api.get<{ dates: string[] }>("/screener/dates")
  return data.dates
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

export const refreshSingleTicker = async (symbol: string, from: string, to: string) => {
  const { data } = await api.post(`/refresh-ticker/${symbol}`, { from, to })
  return data
}

export const getHistoricalScreenerData = async (
  symbol: string,
  months: number = 3
) => {
  const limit = months * 22 // Approx trading days per month
  const { data } = await api.get(`/tickers/${symbol}/screener-history`, {
    params: { limit },
  })
  return data
}
