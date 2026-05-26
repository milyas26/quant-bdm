import api from "@/lib/interceptor"
import type {
  BrokerBalanceData,
  BrokerBalanceResume,
  BrokerSummaryListResponse,
  BrokerSummaryParams,
  BrokerSummaryResponse,
  BrokerAccumulationChartResponse,
  BrokerPositionChartResponse,
  RetailExhaustionResponse,
  FloorPriceResponse,
  TransactionPatternResponse,
  CohesionAnalysisResponse,
} from "./interface"

export * from "./interface"

export const getBrokerPositionChart = async (
  symbol: string,
  from?: string,
  to?: string,
  topN?: number
) => {
  try {
    const { data } = await api.get<BrokerPositionChartResponse>("/broker-position-chart", {
      params: {
        symbol,
        from,
        to,
        top_n: topN
      },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const getBrokerAccumulationChart = async (
  symbol: string,
  period: "1 month" | "3 month" | "6 month"
) => {
  try {
    const { data } = await api.get<BrokerAccumulationChartResponse>("/broker-accumulation-chart", {
      params: {
        symbol,
        period,
      },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const fetchAndSaveBrokerSummary = async (
  params: BrokerSummaryParams
) => {
  const { data } = await api.get<BrokerSummaryResponse>(
    "/fetch-broker-summary",
    {
      params: {
        symbol: params.symbol,
        from: params.from,
        to: params.to,
        transaction_type: params.transaction_type || "TRANSACTION_TYPE_GROSS",
        market_board: params.market_board || "MARKET_BOARD_REGULER",
        investor_type: params.investor_type || "INVESTOR_TYPE_ALL",
        limit: params.limit || "25",
      },
    }
  )
  return data
}

export const getBrokerSummaryByDateRange = async (
  symbol: string,
  dateFrom: string,
  dateTo: string,
  transactionType: "Net" | "Gross" = "Net"
) => {
  try {
    const { data } = await api.get<BrokerSummaryListResponse>(
      "/broker-summary",
      {
        params: {
          symbol,
          from: dateFrom,
          to: dateTo,
          transaction_type:
            transactionType === "Net"
              ? "TRANSACTION_TYPE_NET"
              : "TRANSACTION_TYPE_GROSS",
        },
      }
    )
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const getBrokerBalance = async (
  symbol: string,
  brokerCode: string,
  dateFrom: string,
  dateTo: string
) => {
  try {
    const { data } = await api.get<{
      data: BrokerBalanceData[]
      resume: BrokerBalanceResume
    }>("/broker-balance", {
      params: {
        symbol,
        broker_code: brokerCode,
        date_from: dateFrom,
        date_to: dateTo,
      },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const fetchAllBrokerSummary = async () => {
  const { data } = await api.get<{
    message: string
    processed: number
    details: any[]
  }>("/fetch-all-broker-summary")
  return data
}

// --- Remora API Functions ---

export const getRetailExhaustion = async (
  symbol: string,
  period: string = "3 month"
) => {
  try {
    const { data } = await api.get<RetailExhaustionResponse>("/retail-exhaustion", {
      params: { symbol, period },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const getFloorPrice = async (
  symbol: string,
  period: string = "3 month"
) => {
  try {
    const { data } = await api.get<FloorPriceResponse>("/floor-price", {
      params: { symbol, period },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const getTransactionPattern = async (
  symbol: string,
  from?: string,
  to?: string
) => {
  try {
    const { data } = await api.get<TransactionPatternResponse>("/transaction-pattern", {
      params: { symbol, from, to },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export const getCohesionAnalysis = async (
  symbol: string,
  period: string = "1 month"
) => {
  try {
    const { data } = await api.get<CohesionAnalysisResponse>("/cohesion-analysis", {
      params: { symbol, period },
    })
    return data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to fetch data")
    }
    throw error
  }
}

export interface BrokerAccumulationSearchResult {
  symbol: string
  totalNetVal: number
  totalNetLot: number
  name: string | null
  logo: string | null
  sector: string | null
  subSector: string | null
  screener: {
    price: number
    change: number
    changePercentage: number
    volume: number
    value: number
    isVolumeSpike: boolean
    netBrokerFlow: number
    bandarStatus: string
    smartMoneyScore: number
    momentum: string
    isBreakout: boolean
    liquidityScore: string
    pvaTrend: string | null
  } | null
  brokers: Array<{
    brokerCode: string
    netVal: number
    netLot: number
    freq: number
    daysActive: number
  }>
}

export interface BrokerAccumulationSearchResponse {
  data: BrokerAccumulationSearchResult[]
  meta: {
    brokers: string[]
    from: string
    to: string
    watchlistIds: number[]
    totalStocks: number
  }
}

export const searchBrokerAccumulation = async (
  brokers: string[],
  from?: string,
  to?: string,
  symbol?: string,
  cutoffDate?: string,
  watchlistIds?: number[],
) => {
  const params: Record<string, string | undefined> = { from, to }
  if (brokers.length > 0) {
    params.brokers = brokers.join(",")
  }
  if (symbol) {
    params.symbol = symbol
  }
  if (cutoffDate) {
    params.cutoffDate = cutoffDate
  }
  if (watchlistIds && watchlistIds.length > 0) {
    params.watchlistIds = watchlistIds.join(",")
  }
  const { data } = await api.get<BrokerAccumulationSearchResponse>("/broker-accumulation-search", {
    params,
  })
  return data
}
