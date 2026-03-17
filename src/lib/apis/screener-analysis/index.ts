import api from "@/lib/interceptor"
import type { GetScreenerAnalysisParams, ScreenerAnalysisResponse } from "./interface"

export const getScreenerAnalysis = async (
  params?: GetScreenerAnalysisParams
): Promise<ScreenerAnalysisResponse> => {
  const queryParams = new URLSearchParams()
  
  if (params?.symbol) queryParams.append("symbol", params.symbol)
  if (params?.search) queryParams.append("search", params.search)
  if (params?.signalType && params.signalType !== "ALL") queryParams.append("signalType", params.signalType)
  if (params?.signalValue) queryParams.append("signalValue", params.signalValue)
  if (params?.limit) queryParams.append("limit", params.limit.toString())
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)
  if (params?.minPrice) queryParams.append("minPrice", params.minPrice.toString())
  if (params?.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString())
  if (params?.signals) params.signals.forEach(s => queryParams.append("signals", s))
  if (params?.bandarStatus) params.bandarStatus.forEach(s => queryParams.append("bandarStatus", s))
  if (params?.momentum) params.momentum.forEach(s => queryParams.append("momentum", s))

  const response = await api.get(`/screener-signals/performance-analysis/stored?${queryParams.toString()}`)
  return response.data
}

export const generateScreenerAnalysis = async (
  params?: { symbol?: string; startDate?: string; endDate?: string; skipExisting?: boolean }
) => {
  const queryParams = new URLSearchParams()

  if (params?.symbol) queryParams.append("symbol", params.symbol)
  if (params?.startDate) queryParams.append("startDate", params.startDate)
  if (params?.endDate) queryParams.append("endDate", params.endDate)
  if (params?.skipExisting) queryParams.append("skipExisting", "true")

  const response = await api.get(`/screener-signals/performance-analysis?${queryParams.toString()}`)
  return response.data
}

export const exportScreenerAnalysis = async (
  params?: Omit<GetScreenerAnalysisParams, "page" | "limit">
) => {
  const queryParams = new URLSearchParams()
  
  if (params?.symbol) queryParams.append("symbol", params.symbol)
  if (params?.search) queryParams.append("search", params.search)
  if (params?.signalType && params.signalType !== "ALL") queryParams.append("signalType", params.signalType)
  if (params?.signalValue) queryParams.append("signalValue", params.signalValue)
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)
  if (params?.minPrice) queryParams.append("minPrice", params.minPrice.toString())
  if (params?.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString())
  if (params?.signals) params.signals.forEach(s => queryParams.append("signals", s))
  if (params?.bandarStatus) params.bandarStatus.forEach(s => queryParams.append("bandarStatus", s))
  if (params?.momentum) params.momentum.forEach(s => queryParams.append("momentum", s))

  const response = await api.get(`/screener-signals/performance-analysis/export?${queryParams.toString()}`, {
    responseType: "blob",
  })
  return response.data
}