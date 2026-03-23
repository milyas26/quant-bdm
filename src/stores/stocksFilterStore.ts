import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface StocksFilterState {
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
  date: string | null
  accDistOperator: "gt" | "lt"
  accDist1D: string
  accDist1W: string
  accDist1M: string
  minScore: string
  maxScore: string
  netBrokerFlowOperator: "gt" | "lt"
  netBrokerFlowValue: string
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
  setDate: (date: string | null) => void
  setAccDistOperator: (op: "gt" | "lt") => void
  setAccDist1D: (v: string) => void
  setAccDist1W: (v: string) => void
  setAccDist1M: (v: string) => void
  setMinScore: (v: string) => void
  setMaxScore: (v: string) => void
  setNetBrokerFlowOperator: (op: "gt" | "lt") => void
  setNetBrokerFlowValue: (v: string) => void
  setLiquidity: (liquidity: string[]) => void
  reset: () => void
}

const DEFAULT_STATE = {
  page: 1,
  limit: 10,
  search: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "smartMoneyScore",
  sortOrder: "desc" as const,
  signals: [],
  bandarStatus: ["Accumulation"],
  momentum: ["Uptrend", "Sideways", "Downtrend"],
  date: null,
  accDistOperator: "gt" as const,
  accDist1D: "",
  accDist1W: "",
  accDist1M: "",
  minScore: "",
  maxScore: "",
  netBrokerFlowOperator: "gt" as const,
  netBrokerFlowValue: "",
  liquidity: [],
}

export const useStocksFilterStore = create<StocksFilterState>()(
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
      setDate: (date) => set({ date, page: 1 }),
      setAccDistOperator: (accDistOperator) => set({ accDistOperator, page: 1 }),
      setAccDist1D: (accDist1D) => set({ accDist1D, page: 1 }),
      setAccDist1W: (accDist1W) => set({ accDist1W, page: 1 }),
      setAccDist1M: (accDist1M) => set({ accDist1M, page: 1 }),
      setMinScore: (minScore) => set({ minScore, page: 1 }),
      setMaxScore: (maxScore) => set({ maxScore, page: 1 }),
      setNetBrokerFlowOperator: (netBrokerFlowOperator) => set({ netBrokerFlowOperator, page: 1 }),
      setNetBrokerFlowValue: (netBrokerFlowValue) => set({ netBrokerFlowValue, page: 1 }),
      setLiquidity: (liquidity) => set({ liquidity, page: 1 }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: "stocks-filter-store",
    }
  )
)
