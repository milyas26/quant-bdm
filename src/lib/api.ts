import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

export interface Ticker {
  symbol: string;
  name: string | null;
  isLiquid: boolean;
  price: number;
  isSuspend: boolean;
  isUnusual: boolean;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTickersResponse {
  data: Ticker[];
  meta: Meta;
}

export interface GetTickersParams {
  page?: number;
  limit?: number;
  search?: string;
  isLiquid?: boolean;
  isSuspend?: boolean;
  isUnusual?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const getTickers = async (params: GetTickersParams) => {
  const { data } = await api.get<GetTickersResponse>("/tickers", { params });
  return data;
};

export const deleteTicker = async (symbol: string) => {
  await api.delete(`/tickers/${symbol}`);
};
