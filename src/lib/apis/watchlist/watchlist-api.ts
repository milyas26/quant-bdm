import api from "@/lib/interceptor"
import type { Watchlist } from "./interface"

export * from "./interface"

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
