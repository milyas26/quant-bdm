import { create } from "zustand"
import { persist } from "zustand/middleware"
import { format, subDays } from "date-fns"

export interface BrokerAccumulationFilterState {
  brokerCodes: string[]
  preset: "3d" | "1w" | "2w" | "custom"
  from: string
  to: string

  // Pagination
  page: number
  limit: number

  // Screener filters
  minPrice: string
  maxPrice: string
  minScore: string
  maxScore: string
  signals: string[]
  bandarStatus: string[]
  momentum: string[]
  liquidity: string[]

  setBrokerCodes: (codes: string[]) => void
  setPreset: (preset: "3d" | "1w" | "2w" | "custom") => void
  setDateRange: (from: string, to: string) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setMinPrice: (v: string) => void
  setMaxPrice: (v: string) => void
  setMinScore: (v: string) => void
  setMaxScore: (v: string) => void
  setSignals: (v: string[]) => void
  setBandarStatus: (v: string[]) => void
  setMomentum: (v: string[]) => void
  setLiquidity: (v: string[]) => void
  reset: () => void
}

const today = () => format(new Date(), "yyyy-MM-dd")

const getPresetFrom = (preset: "3d" | "1w" | "2w" | "custom") => {
  const now = new Date()
  switch (preset) {
    case "3d": return format(subDays(now, 3), "yyyy-MM-dd")
    case "1w": return format(subDays(now, 7), "yyyy-MM-dd")
    case "2w": return format(subDays(now, 14), "yyyy-MM-dd")
    default: return format(subDays(now, 7), "yyyy-MM-dd")
  }
}

const DEFAULT_STATE = {
  brokerCodes: [] as string[],
  preset: "1w" as const,
  from: getPresetFrom("3d"),
  to: today(),
  page: 1,
  limit: 10,
  minPrice: "",
  maxPrice: "",
  minScore: "",
  maxScore: "",
  signals: [] as string[],
  bandarStatus: [] as string[],
  momentum: [] as string[],
  liquidity: [] as string[],
}

export const useBrokerAccumulationStore = create<BrokerAccumulationFilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setBrokerCodes: (brokerCodes) => set({ brokerCodes, page: 1 }),
      setPreset: (preset) => set({
        preset,
        from: getPresetFrom(preset),
        to: today(),
        page: 1,
      }),
      setDateRange: (from, to) => set({ from, to, preset: "custom", page: 1 }),
      setPage: (page) => set({ page }),
      setLimit: (limit) => set({ limit, page: 1 }),
      setMinPrice: (minPrice) => set({ minPrice }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setMinScore: (minScore) => set({ minScore }),
      setMaxScore: (maxScore) => set({ maxScore }),
      setSignals: (signals) => set({ signals }),
      setBandarStatus: (bandarStatus) => set({ bandarStatus }),
      setMomentum: (momentum) => set({ momentum }),
      setLiquidity: (liquidity) => set({ liquidity }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: "broker-accumulation-filter-store",
    },
  ),
)
