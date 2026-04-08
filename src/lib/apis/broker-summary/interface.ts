export interface BrokerSummaryParams {
  symbol: string
  from: string
  to: string
  transaction_type?: string
  market_board?: string
  investor_type?: string
  limit?: string
}

export interface BrokerData {
  netbsBrokerCode: string
  bval: string
  sval: string
  // Add other broker fields as needed
}

export interface BrokerSummaryData {
  brokersBuy: BrokerData[]
  brokersSell: BrokerData[]
  // Add other summary fields as needed
}

export interface BrokerSummaryResponse {
  message: string
  data: BrokerSummaryData
}

export interface BrokerBuy {
  id: number
  summaryId: number
  netbsBrokerCode: string
  netbsDate: string
  netbsStockCode: string
  type: string
  freq: number
  blot: string
  blotv: string
  bval: string
  bvalv: string
  netbsBuyAvgPrice: string
}

export interface BrokerSell {
  id: number
  summaryId: number
  netbsBrokerCode: string
  netbsDate: string
  netbsStockCode: string
  type: string
  freq: number
  slot: string
  slotv: string
  sval: string
  svalv: string
  netbsSellAvgPrice: string
}

export interface BrokerSummary {
  id: number
  symbol: string
  date: string
  brokersBuy: BrokerBuy[]
  brokersSell: BrokerSell[]
}

export interface BrokerBalanceData {
  date: string
  avgNetPrice: number
  netLot: number
  netVal: number
}

export interface BrokerBalanceResume {
  netLot: number
  netVal: number
  avgNetPrice: number
}

export interface BrokerSummaryListResponse {
  message: string
  data: BrokerSummary[]
}

export interface BrokerAccumulationChartData {
  date: string
  netALot: number
  netRLot: number
  netLLot: number;
  netPLot: number;
  netSMLot: number;
  netDMLot: number;
  netAVal: number;
  netRVal: number;
  netLVal: number;
  netPVal: number;
  netSMVal: number;
  netDMVal: number;
  avgNetAPrice: number;
  avgNetRPrice: number;
  avgNetLPrice: number;
  avgNetPPrice: number;
  avgNetSMPrice: number;
  avgNetDMPrice: number;
}

export interface BrokerAccumulationChartResume {
  netALot: number;
  netRLot: number;
  netLLot: number;
  netPLot: number;
  netSMLot: number;
  netDMLot: number;
  netAVal: number;
  netRVal: number;
  netLVal: number;
  netPVal: number;
  netSMVal: number;
  netDMVal: number;
  avgNetAPrice: number;
  avgNetRPrice: number;
  avgNetLPrice: number;
  avgNetPPrice: number;
  avgNetSMPrice: number;
  avgNetDMPrice: number;
}

export interface BrokerAccumulationChartResponse {
  message: string
  data: BrokerAccumulationChartData[]
  resume: BrokerAccumulationChartResume
}

export interface BrokerPositionChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  change_percentage?: number
  [key: string]: number | string | undefined // Dynamic keys for broker codes
}

export interface BrokerPositionChartResponse {
  message: string
  data: BrokerPositionChartData[]
  topAccumulators: string[]
  topDistributors: string[]
}

export interface BrokerPositionChartQuery {
  symbol: string
  from?: string
  to?: string
  top_n?: string
}

// --- Remora Interfaces ---

export interface RetailExhaustionData {
  date: string
  dailyNetLot: number
  cumulativeNetLot: number
  peakHolding: number
  exhaustionPct: number
  avgBuyPrice: number
  avgSellPrice: number
}

export interface RetailExhaustionResponse {
  message: string
  data: RetailExhaustionData[]
  summary: {
    currentHolding: number
    peakHolding: number
    exhaustionPct: number
    isExhausted: boolean
    broker: string
  }
}

export interface FloorPriceData {
  date: string
  smBuyLot: number
  smSellLot: number
  smNetLot: number
  cumulativeNetLot: number
  avgEntryPrice: number
}

export interface FloorPriceResponse {
  message: string
  data: FloorPriceData[]
  summary: {
    floorPrice: number
    latestPrice: number
    distanceFromFloor: number
    smNetLot: number
    isAboveFloor: boolean
  }
}

export interface TransactionPatternData {
  code: string
  category: string
  buyVal: number
  sellVal: number
  netVal: number
  netLot: number
  buyFreq: number
  sellFreq: number
  avgBuySize: number
  avgSellSize: number
  aggressiveness: number
  isSmart: boolean
  isRetail: boolean
}

export interface TransactionPatternResponse {
  message: string
  data: TransactionPatternData[]
  whales: TransactionPatternData[]
  totalBrokers: number
}

export interface CohesionData {
  date: string
  smNetVal: number
  retailNetVal: number
  totalNetVal: number
  smDirection: string
  retailDirection: string
  isAligned: boolean
  isContrarian: boolean
  smPctOfTotal: number
  retailPctOfTotal: number
}

export interface CohesionAnalysisResponse {
  message: string
  data: CohesionData[]
  summary: {
    cohesionScore: number
    totalDays: number
    alignedDays: number
    contrarianDays: number
    isImposterMove: boolean
    avgRetailPct: number
    avgSmPct: number
    interpretation: string
  }
}
