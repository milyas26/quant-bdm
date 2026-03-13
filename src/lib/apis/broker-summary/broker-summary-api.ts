import api from "@/lib/interceptor"
import type {
  BrokerBalanceData,
  BrokerBalanceResume,
  BrokerSummaryListResponse,
  BrokerSummaryParams,
  BrokerSummaryResponse,
  BrokerAccumulationChartResponse,
  BrokerPositionChartResponse,
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
