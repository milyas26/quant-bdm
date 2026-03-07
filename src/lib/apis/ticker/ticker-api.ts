import api from "@/lib/interceptor"
import type { GetTickersParams, GetTickersResponse } from "./interface"

export * from "./interface"

export const getTickers = async (params: GetTickersParams) => {
  const { data } = await api.get<GetTickersResponse>("/tickers", { params })
  return data
}

export const deleteTicker = async (symbol: string) => {
  await api.delete(`/tickers/${symbol}`)
}
