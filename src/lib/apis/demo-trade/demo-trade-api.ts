import api from "@/lib/interceptor"
import type { DemoTrade, SimulateTradePayload } from "./interface"

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

export const captureSnapshots = async (): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>("/demo-trades/snapshots")
  return data
}
