import api from "@/lib/interceptor"
import type { DemoTrade, SimulateTradePayload, PortfolioSummary, PortfolioSnapshot } from "./interface"

export const simulateBuy = async (payload: SimulateTradePayload): Promise<DemoTrade> => {
  const { data } = await api.post<DemoTrade>("/demo-trades/simulate", payload)
  return data
}

export const getActiveTrades = async (): Promise<DemoTrade[]> => {
  const { data } = await api.get<DemoTrade[]>("/demo-trades/active")
  return data
}

export const getTradeHistory = async (): Promise<DemoTrade[]> => {
  const { data } = await api.get<DemoTrade[]>("/demo-trades/history")
  return data
}

export const closeTrade = async (id: number): Promise<DemoTrade> => {
  const { data } = await api.post<DemoTrade>(`/demo-trades/${id}/close`)
  return data
}

export const closeTradeBySymbol = async (
  symbol: string
): Promise<{ symbol: string; closedCount: number }> => {
  const { data } = await api.post<{
    symbol: string
    closedCount: number
  }>(`/demo-trades/close-by-symbol/${symbol}`)
  return data
}

export const captureSnapshots = async (): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>("/demo-trades/snapshots")
  return data
}

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const { data } = await api.get<PortfolioSummary>("/demo-trades/summary")
  return data
}

export const getBalanceHistory = async (): Promise<PortfolioSnapshot[]> => {
  const { data } = await api.get<PortfolioSnapshot[]>(
    "/demo-trades/balance-history"
  )
  return data
}
