import api from "@/lib/interceptor"
import type { Watchlist, CreateWatchlistParams, WatchlistTickers } from "./interface"

export * from "./interface"

export const getWatchlists = async () => {
  const { data } = await api.get<Watchlist[]>("/watchlists")
  return data
}

export const createWatchlist = async (params: CreateWatchlistParams) => {
  const { data } = await api.post<Watchlist>("/watchlists", params)
  return data
}

export const deleteWatchlist = async (id: number) => {
  await api.delete(`/watchlists/${id}`)
}

export const addTickerToWatchlist = async (watchlistId: number, symbol: string) => {
  const { data } = await api.post<Watchlist>(`/watchlists/${watchlistId}/tickers`, { symbol })
  return data
}

export const getWatchlistTickers = async (watchlistId: number) => {
  const { data } = await api.get<WatchlistTickers>(`/watchlists/${watchlistId}/tickers`)
  return data
}

export const deleteTickerFromWatchlist = async (watchlistId: number, symbol: string) => {
  await api.delete(`/watchlists/${watchlistId}/tickers/${symbol}`)
}

export const getWatchlistIdsByTicker = async (symbol: string) => {
  const { data } = await api.get<number[]>(`/watchlists/by-ticker/${symbol}`)
  return data
}

export const reorderWatchlists = async (orderedIds: number[]) => {
  await api.patch("/watchlists/reorder", { orderedIds })
}
