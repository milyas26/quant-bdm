import api from "@/lib/interceptor"
import type { RefreshKeystatsResponse } from "./interface"

export const refreshAllKeystats = async () => {
  const { data } = await api.post<RefreshKeystatsResponse>(
    "/refresh-stock-keystats",
  )
  return data
}

export const getStockKeystats = async (symbol: string) => {
  const { data } = await api.get(`/stock-keystats/${symbol}`)
  return data
}
