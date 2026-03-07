import api from "@/lib/interceptor"
import type { BrokerSummary3MonthsResponse, BrokerSummaryParams, BrokerSummaryResponse } from "./interface"

export * from "./interface"

export const getBrokerSummary = async (params: BrokerSummaryParams) => {
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

export const getBrokerSummary3Months = async (
  symbol: string,
  dateFrom: string,
  dateTo: string
) => {
  const { data } = await api.get<BrokerSummary3MonthsResponse>(
    "/broker-summary",
    {
      params: {
        symbol,
        from: dateFrom,
        to: dateTo,
      },
    }
  )
  return data
}
