import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { format } from "date-fns"
import { getScreenerAnalysis, generateScreenerAnalysis } from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { FilterMultiSelect } from "@/components/filter-multi-select"
import { Separator } from "@/components/ui/separator"

export default function ScreenerAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")

  const sortBy = searchParams.get("sortBy") || "signalDate"
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc" | undefined) || "desc"

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const debouncedSearch = useDebounce(searchTerm, 500)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Price inputs state
  const minPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice")!)
    : undefined
  const maxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!)
    : undefined

  const [minPriceInput, setMinPriceInput] = useState(
    searchParams.get("minPrice") || ""
  )
  const [maxPriceInput, setMaxPriceInput] = useState(
    searchParams.get("maxPrice") || ""
  )

  const signals = searchParams.getAll("signals")
  const bandarStatus = searchParams.getAll("bandarStatus")
  const momentum = searchParams.getAll("momentum")

  // Legacy signalType (keep it but hidden or merged?)
  // We'll prioritize the new filters.

  const [pageInput, setPageInput] = useState(page.toString())

  const updateParams = (
    updates: Record<string, string | number | string[] | undefined>
  ) => {
    const newParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        newParams.delete(key)
      } else if (Array.isArray(value)) {
        newParams.delete(key)
        value.forEach((v) => newParams.append(key, v))
      } else {
        newParams.set(key, String(value))
      }
    })

    setSearchParams(newParams)
  }

  useEffect(() => {
    setPageInput(page.toString())
  }, [page])

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateParams({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch])

  const handlePriceUpdate = () => {
    updateParams({
      minPrice: minPriceInput ? parseInt(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? parseInt(maxPriceInput) : undefined,
      page: 1,
    })
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "screenerAnalysis",
      page,
      limit,
      debouncedSearch,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      signals,
      bandarStatus,
      momentum,
    ],
    queryFn: () =>
      getScreenerAnalysis({
        page,
        limit,
        search: debouncedSearch,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        signals,
        bandarStatus,
        momentum,
      }),
  })

  const generateMutation = useMutation({
    mutationFn: () => generateScreenerAnalysis({ skipExisting: true }),
    onSuccess: (data: any) => {
      toast.success(`Generated analysis for ${data.data.length} signals`)
      queryClient.invalidateQueries({ queryKey: ["screenerAnalysis"] })
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate analysis: ${error.message}`)
    },
  })

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + "B"
    }
    if (Math.abs(num) >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M"
    }
    if (Math.abs(num) >= 1_000) {
      return (num / 1_000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const formatPercent = (val: any) => {
    if (val === null || val === undefined) return "-"
    const num = Number(val)
    if (isNaN(num)) return "-"
    return `${(num * 100).toFixed(2)}%`
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/20">
        <CardContent className="space-y-4">
          <div className="flex flex-col flex-wrap gap-2 md:flex-row md:items-end">
            <div className="w-full min-w-[200px] md:w-auto md:flex-1">
              <div className="relative">
                <Search className="absolute top-3 left-2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Search symbol..."
                  className="h-10 py-4 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="font-medium">Price</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <input
                className="w-16 bg-transparent outline-none placeholder:text-muted-foreground md:w-20"
                placeholder="Min"
                type="number"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={handlePriceUpdate}
                onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
              />
              <span className="mx-1 text-muted-foreground">-</span>
              <input
                className="w-16 bg-transparent text-right outline-none placeholder:text-muted-foreground md:w-20"
                placeholder="Max"
                type="number"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={handlePriceUpdate}
                onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
              />
            </div>

            <div className="w-full space-y-2 md:w-52">
              <FilterMultiSelect
                title="Signals"
                options={[
                  { label: "Breakout", value: "Breakout" },
                  { label: "Spike", value: "Spike" },
                ]}
                selected={signals}
                onChange={(val) => updateParams({ signals: val, page: 1 })}
              />
            </div>

            <div className="w-full space-y-2 md:w-52">
              <FilterMultiSelect
                title="Status"
                options={[
                  { label: "Accumulation", value: "Accumulation" },
                  { label: "Neutral", value: "Neutral" },
                  { label: "Distribution", value: "Distribution" },
                ]}
                selected={bandarStatus}
                onChange={(val) => updateParams({ bandarStatus: val, page: 1 })}
              />
            </div>

            <div className="w-full space-y-2 md:w-52">
              <FilterMultiSelect
                title="Momentum"
                options={[
                  { label: "Uptrend", value: "Uptrend" },
                  { label: "Sideways", value: "Sideways" },
                  { label: "Downtrend", value: "Downtrend" },
                ]}
                selected={momentum}
                onChange={(val) => updateParams({ momentum: val, page: 1 })}
              />
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="h-10 cursor-pointer"
              variant="default"
            >
              {generateMutation.isPending ? (
                "Generating..."
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate All
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            Loading analysis data...
          </div>
        ) : isError ? (
          <div className="flex h-24 items-center justify-center text-red-500">
            Error: {(error as Error).message}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            No analysis data found
          </div>
        ) : (
          data.data.map((row: any) => (
            <Card
              key={row.id}
              className="overflow-hidden p-2 transition-all hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-between gap-4 text-sm lg:flex-row">
                {/* 1. Ticker & Date */}
                <div className="flex w-full shrink-0 items-center gap-3 lg:w-[250px]">
                  {row.ticker?.logo ? (
                    <img
                      src={row.ticker.logo}
                      alt={row.symbol}
                      className="h-10 w-10 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {row.symbol.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">{row.symbol}</span>
                      {row.screener.isBreakout && (
                        <Badge
                          variant="outline"
                          className="h-4 border-orange-200 bg-orange-50 px-1 py-0 text-[10px] text-orange-600"
                        >
                          Breakout
                        </Badge>
                      )}
                    </div>
                    <span
                      className="max-w-[150px] truncate text-xs text-muted-foreground"
                      title={row.ticker?.name}
                    >
                      {row.ticker?.name || "-"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(row.signalDate), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                {/* 2. Price & Volume */}
                <div className="flex w-full shrink-0 flex-row justify-between gap-1 lg:w-[120px] lg:flex-col lg:justify-center">
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <span className="text-muted-foreground lg:hidden">
                      Price:
                    </span>
                    <div className="text-right">
                      <div className="font-medium">
                        {Number(row.screener.price).toLocaleString()}
                      </div>
                      <div
                        className={cn(
                          "text-[10px]",
                          Number(row.screener.changePercentage) > 0
                            ? "text-green-600"
                            : Number(row.screener.changePercentage) < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {Number(row.screener.changePercentage) > 0 ? "+" : ""}
                        {Number(row.screener.changePercentage).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <span className="text-muted-foreground lg:hidden">
                      Vol:
                    </span>
                    <div className="flex items-center justify-end gap-1 text-right">
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(Number(row.screener.volume))}
                      </span>
                      {row.screener.isVolumeSpike && (
                        <span
                          className="text-[10px] font-bold text-orange-600"
                          title="Volume Spike"
                        >
                          🔥
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                {/* 3. Broker & Acc/Dist */}
                <div className="flex w-full shrink-0 flex-row justify-between gap-1 lg:w-[140px] lg:flex-col lg:justify-center">
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <span className="text-muted-foreground lg:hidden">
                      Net:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        Number(row.screener.netBrokerFlow) > 0
                          ? "text-green-600"
                          : Number(row.screener.netBrokerFlow) < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {formatNumber(Number(row.screener.netBrokerFlow))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px] lg:justify-end">
                    <span className="text-muted-foreground lg:hidden">
                      A/D:
                    </span>
                    <div className="flex gap-1.5 text-right">
                      <span
                        title="1D"
                        className={cn(
                          Number(row.screener.accumulationDistribution1D) > 0
                            ? "text-green-600"
                            : Number(row.screener.accumulationDistribution1D) <
                                0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {Number(
                          row.screener.accumulationDistribution1D
                        ).toFixed(0)}
                        %
                      </span>
                      <span className="text-muted-foreground/30">/</span>
                      <span
                        title="1W"
                        className={cn(
                          Number(row.screener.accumulationDistribution1W) > 0
                            ? "text-green-600"
                            : Number(row.screener.accumulationDistribution1W) <
                                0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {Number(
                          row.screener.accumulationDistribution1W
                        ).toFixed(0)}
                        %
                      </span>
                      <span className="text-muted-foreground/30">/</span>
                      <span
                        title="1M"
                        className={cn(
                          Number(row.screener.accumulationDistribution1M) > 0
                            ? "text-green-600"
                            : Number(row.screener.accumulationDistribution1M) <
                                0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {Number(
                          row.screener.accumulationDistribution1M
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                {/* 4. Status/Score/Momentum */}
                <div className="flex w-full shrink-0 flex-row justify-between gap-1 lg:w-[140px] lg:flex-col lg:justify-center">
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto h-4 px-1 py-0 text-[10px] font-normal",
                        row.screener.bandarStatus === "Accumulation"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : row.screener.bandarStatus === "Distribution"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {row.screener.bandarStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px] lg:justify-end">
                    <span
                      className={cn(
                        "font-bold",
                        Number(row.screener.smartMoneyScore) >= 70
                          ? "text-green-600"
                          : Number(row.screener.smartMoneyScore) <= 30
                            ? "text-red-600"
                            : "text-yellow-600"
                      )}
                    >
                      Score: {row.screener.smartMoneyScore}
                    </span>
                    <span className="text-muted-foreground/30">|</span>
                    <span
                      className={cn(
                        "font-medium",
                        row.screener.momentum === "Uptrend"
                          ? "text-green-600"
                          : row.screener.momentum === "Downtrend"
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {row.screener.momentum}
                    </span>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                {/* 5. Returns */}
                <div className="flex w-full grow flex-col gap-1 lg:w-auto">
                  <div className="mb-0.5 flex justify-between gap-1 text-[10px] tracking-wider text-muted-foreground uppercase lg:justify-center">
                    <span>1D</span>
                    <span>3D</span>
                    <span>5D</span>
                    <span>10D</span>
                    <span>20D</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {["1D", "3D", "5D", "10D", "20D"].map((label) => {
                      const key = `return${label}` as keyof typeof row
                      const val = row[key]
                      return (
                        <div
                          key={label}
                          className={cn(
                            "rounded p-1 text-xs font-medium",
                            Number(val) > 0
                              ? "bg-green-50 text-green-700"
                              : Number(val) < 0
                                ? "bg-red-50 text-red-700"
                                : "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {val ? formatPercent(val).replace("%", "") : "-"}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                {/* 6. Peak Return */}
                <div className="flex w-full shrink-0 flex-row items-end justify-between gap-0 lg:w-[80px] lg:flex-col lg:justify-center">
                  <div className="text-[10px] text-muted-foreground lg:hidden">
                    Peak Return
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-sm font-bold",
                        Number(row.peakReturn) > 0
                          ? "text-green-600"
                          : Number(row.peakReturn) < 0
                            ? "text-red-600"
                            : ""
                      )}
                    >
                      {formatPercent(row.peakReturn)}
                    </div>
                    {row.daysToPeak && (
                      <div className="text-[10px] text-muted-foreground">
                        {row.daysToPeak} days
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data?.data.length || 0} of {data?.meta.total || 0} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateParams({ page: 1 })}
            disabled={page <= 1 || isLoading}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="mx-2 flex items-center gap-2">
            <span className="text-sm font-medium">Page</span>
            <Input
              className="h-8 w-16 px-1 text-center"
              value={pageInput}
              type="number"
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const p = parseInt(pageInput)
                if (!isNaN(p) && p > 0) updateParams({ page: p })
                else setPageInput(page.toString())
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = parseInt(pageInput)
                  if (!isNaN(p) && p > 0) updateParams({ page: p })
                }
              }}
            />
            <span className="text-sm font-medium">
              of {data?.meta.totalPages || 1}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={!data || page >= data.meta.totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateParams({ page: data?.meta.totalPages || 1 })}
            disabled={!data || page >= data.meta.totalPages || isLoading}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
