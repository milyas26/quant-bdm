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
