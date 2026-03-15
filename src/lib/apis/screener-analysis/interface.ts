export interface GetScreenerAnalysisParams {
  symbol?: string;
  signalType?: string;
  signalValue?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
}

export interface ScreenerAnalysisResponse {
  message: string;
  data: ScreenerAnalysisData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ScreenerAnalysisData {
  id: number;
  symbol: string;
  signalDate: string;
  signalPrice: string; // From Screener table join (but not available directly in response usually unless flattened)
  screener: {
    price: string;
    bandarStatus: string;
    isBreakout: boolean;
    isVolumeSpike: boolean;
    smartMoneyScore: string;
  };
  return1D: string | null;
  return3D: string | null;
  return5D: string | null;
  return10D: string | null;
  return20D: string | null;
  peakReturn: string | null;
  daysToPeak: number | null;
  createdAt: string;
  updatedAt: string;
}