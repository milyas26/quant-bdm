import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ScreenerAnalysisFilterState {
  page: number
  limit: number
  search: string
  minPrice: string
  maxPrice: string
  sortBy: string
  sortOrder: "asc" | "desc"
  signals: string[]
  bandarStatus: string[]
  momentum: string[]
  minScore: string
  maxScore: string
  accDist1D: string
  accDist1W: string
  accDist1M: string
  accDistOperator: "gt" | "lt"
  peakReturn: string
  peakReturnOperator: "gt" | "lt"
  useCutoff: boolean
  liquidity: string[]

  // Actions
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setMinPrice: (minPrice: string) => void
  setMaxPrice: (maxPrice: string) => void
  setSortBy: (sortBy: string) => void
  setSortOrder: (sortOrder: "asc" | "desc") => void
  setSignals: (signals: string[]) => void
  setBandarStatus: (bandarStatus: string[]) => void
  setMomentum: (momentum: string[]) => void
  setSort: (sortBy: string, sortOrder: "asc" | "desc") => void
  setMinScore: (minScore: string) => void
  setMaxScore: (maxScore: string) => void
  setAccDist1D: (accDist1D: string) => void
  setAccDist1W: (accDist1W: string) => void
  setAccDist1M: (accDist1M: string) => void
  setAccDistOperator: (operator: "gt" | "lt") => void
  setPeakReturn: (peakReturn: string) => void
  setPeakReturnOperator: (operator: "gt" | "lt") => void
  setUseCutoff: (useCutoff: boolean) => void
  setLiquidity: (liquidity: string[]) => void
  reset: () => void
}

const DEFAULT_STATE = {
  page: 1,
  limit: 10,
  search: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "signalDate",
  sortOrder: "desc" as const,
  signals: [],
  bandarStatus: [],
  momentum: [],
  minScore: "",
  maxScore: "",
  accDist1D: "",
  accDist1W: "",
  accDist1M: "",
  accDistOperator: "gt" as const,
  peakReturn: "",
  peakReturnOperator: "gt" as const,
  useCutoff: false,
  liquidity: [],
}

export const useScreenerAnalysisFilterStore =
  create<ScreenerAnalysisFilterState>()(
    persist(
      (set) => ({
        ...DEFAULT_STATE,

        setPage: (page) => set({ page }),
        setLimit: (limit) => set({ limit }),
        setSearch: (search) => set({ search, page: 1 }),
        setMinPrice: (minPrice) => set({ minPrice }),
        setMaxPrice: (maxPrice) => set({ maxPrice }),
        setSortBy: (sortBy) => set({ sortBy }),
        setSortOrder: (sortOrder) => set({ sortOrder }),
        setSignals: (signals) => set({ signals, page: 1 }),
        setBandarStatus: (bandarStatus) => set({ bandarStatus, page: 1 }),
        setMomentum: (momentum) => set({ momentum, page: 1 }),
        setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
        setMinScore: (minScore) => set({ minScore, page: 1 }),
        setMaxScore: (maxScore) => set({ maxScore, page: 1 }),
        setAccDist1D: (accDist1D) => set({ accDist1D, page: 1 }),
        setAccDist1W: (accDist1W) => set({ accDist1W, page: 1 }),
        setAccDist1M: (accDist1M) => set({ accDist1M, page: 1 }),
        setAccDistOperator: (accDistOperator) =>
          set({ accDistOperator, page: 1 }),
        setPeakReturn: (peakReturn) => set({ peakReturn, page: 1 }),
        setPeakReturnOperator: (peakReturnOperator) =>
          set({ peakReturnOperator, page: 1 }),
        setUseCutoff: (useCutoff) => set({ useCutoff, page: 1 }),
        setLiquidity: (liquidity) => set({ liquidity, page: 1 }),
        reset: () => set({ ...DEFAULT_STATE }),
      }),
      {
        name: "screener-analysis-filter-store",
      }
    )
  )
