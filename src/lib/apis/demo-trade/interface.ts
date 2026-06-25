export interface DemoTrade {
  id: number
  symbol: string
  screenerId: number | null
  screenerDate: string | null
  entryPrice: number
  currentPrice: number
  exitPrice: number | null
  quantity: number
  entryTime: string
  exitTime: string | null
  status: "OPEN" | "CLOSED"
  pnl: number
  pnlPercent: number
  signalScore: number | null
  runnerScore: number | null
  isBreakout: boolean | null
  isVolumeSpike: boolean | null
  bandarStatus: string | null
  ticker: {
    symbol: string
    name: string | null
    logo: string | null
    sector: string | null
  }
  brokersBuy: { netbsBrokerCode: string }[]
  brokersSell: { netbsBrokerCode: string }[]
}

export interface SimulateTradePayload {
  screenerId: number
  quantity?: number
  screenerDate?: string
}
