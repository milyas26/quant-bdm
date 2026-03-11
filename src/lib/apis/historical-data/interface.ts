export interface FetchHistoricalDataParams {
  symbol: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  page?: number;
}

export interface HistoricalDataResponse {
  message: string;
  data: {
    result: any[];
    paginate: {
      next_page: string | null;
    };
  };
}

export interface GetHistoricalDataParams {
  symbol: string;
  start_date?: string;
  end_date?: string;
}

export interface HistoricalData {
  id: number;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  change_percentage: number;
  volume: number;
  value: number;
  frequency: number;
  foreign_buy: number;
  foreign_sell: number;
  net_foreign: number;
  average: number;
  created_at: string;
  updated_at: string;
}
