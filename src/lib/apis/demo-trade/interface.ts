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
  notes: string | null
  ticker: {
    symbol: string
    name: string | null
    logo: string | null
    sector: string | null
  }
  brokersBuy: { netbsBrokerCode: string }[]
  brokersSell: { netbsBrokerCode: string }[]
  tradeIds: number[]
  positionCount: number
}

export interface SimulateTradePayload {
  screenerId: number
  quantity?: number
  screenerDate?: string
  notes?: string
}

export interface PortfolioSummary {
  initialCapital: number
  totalAllocated: number
  totalUnrealizedPnL: number
  totalRealizedPnL: number
  availableBalance: number
  totalEquity: number
  totalReturn: number
}

export interface PortfolioSnapshot {
  id: number
  equity: number
  availableBalance: number
  allocatedBalance: number
  realizedPnL: number
  unrealizedPnL: number
  createdAt: string
}
