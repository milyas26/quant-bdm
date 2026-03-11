import api from "@/lib/interceptor"
import type { 
  FetchHistoricalDataParams, 
  HistoricalDataResponse,
  GetHistoricalDataParams,
  HistoricalData
} from "./interface"

export const fetchAndSaveHistoricalData = async (params: FetchHistoricalDataParams) => {
  const { symbol, ...queryParams } = params
  const { data } = await api.get<HistoricalDataResponse>(`/fetch-historical-data/${symbol}`, {
    params: queryParams,
  })
  return data
}

export const getHistoricalData = async (params: GetHistoricalDataParams) => {
  const { symbol, ...queryParams } = params
  const { data } = await api.get<HistoricalData[]>(`/historical-data/${symbol}`, {
    params: queryParams,
  })
  return data
}
