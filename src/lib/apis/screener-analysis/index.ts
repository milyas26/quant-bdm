import api from "@/lib/interceptor"
import type { GetScreenerAnalysisParams, ScreenerAnalysisResponse } from "./interface"

export const getScreenerAnalysis = async (
  params?: GetScreenerAnalysisParams
): Promise<ScreenerAnalysisResponse> => {
  const queryParams = new URLSearchParams()
  
  if (params?.symbol) queryParams.append("symbol", params.symbol)
  if (params?.signalType && params.signalType !== "ALL") queryParams.append("signalType", params.signalType)
  if (params?.signalValue) queryParams.append("signalValue", params.signalValue)
  if (params?.limit) queryParams.append("limit", params.limit.toString())
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy)

  const response = await api.get(`/screener-signals/performance-analysis/stored?${queryParams.toString()}`)
  return response.data
}