import api from "@/lib/interceptor"
import type { RefreshProfilesResponse, ListProfilesResponse } from "./interface"

export const refreshAllProfiles = async () => {
  const { data } = await api.post<RefreshProfilesResponse>(
    "/refresh-stock-profiles",
  )
  return data
}

export const listStockProfiles = async () => {
  const { data } = await api.get<ListProfilesResponse>("/stock-profiles")
  return data
}

export const getStockProfile = async (symbol: string) => {
  const { data } = await api.get(`/stock-profiles/${symbol}`)
  return data
}
