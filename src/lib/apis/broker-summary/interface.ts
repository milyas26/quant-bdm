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
