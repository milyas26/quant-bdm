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
  reset: () => void
}

const DEFAULT_STATE = {
  page: 1,
  limit: 15,
  search: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "smartMoneyScore",
  sortOrder: "desc" as const,
  signals: [],
  bandarStatus: ["Accumulation"],
  momentum: ["Uptrend", "Sideways", "Downtrend"],
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
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: "stocks-filter-store",
    }
  )
)
