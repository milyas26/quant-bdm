import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import {
  getScreenerAnalysis,
  generateScreenerAnalysis,
  exportScreenerAnalysis,
  getWatchlists,
} from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce"
import { useScreenerAnalysisFilterStore } from "@/stores/screenerAnalysisFilterStore"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge, ScoreBadge } from "@/components/indicators"
import { cn, getBrokerCodeClass } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Search,
  Download,
  X,
  SlidersHorizontal,
  Activity,
  BarChart2,
  Shuffle,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterMultiSelect } from "@/components/filter-multi-select"
import { MultiSelect } from "@/components/multi-select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ScreenerAnalysis() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const {
    page,
    limit,
    search,
    watchlistId,
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
    sortBy,
    sortOrder,
    signals,
    bandarStatus,
    momentum,
    minScore: minScoreStr,
    maxScore: maxScoreStr,
    accDist1D,
    accDist1W,
    accDist1M,
    accDistOperator,
    peakReturn: peakReturnStr,
    peakReturnOperator,
    setPage,
    setLimit,
    setSearch,
    setWatchlistId,
    setMinPrice,
    setMaxPrice,
    setSignals,
    setBandarStatus,
    setMomentum,
    setMinScore,
    setMaxScore,
    setAccDist1D,
    setAccDist1W,
    setAccDist1M,
    setAccDistOperator,
    setPeakReturn,
    setPeakReturnOperator,
    useCutoff,
    setUseCutoff,
    liquidity,
    setLiquidity,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    reset,
  } = useScreenerAnalysisFilterStore()

  // Local input states (controlled)
  const [searchTerm, setSearchTerm] = useState(search)
  const [minPriceInput, setMinPriceInput] = useState(minPriceStr)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceStr)
  const [minScoreInput, setMinScoreInput] = useState(minScoreStr)
  const [maxScoreInput, setMaxScoreInput] = useState(maxScoreStr)
  const [pageInput, setPageInput] = useState(page.toString())
  const [showFilters, setShowFilters] = useState(false)

  const dateRange: DateRange | undefined =
    startDate || endDate
      ? {
          from: startDate ? new Date(startDate) : undefined,
          to: endDate ? new Date(endDate) : undefined,
        }
      : undefined

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setStartDate(range?.from ? range.from.toISOString().split("T")[0] : "")
    setEndDate(range?.to ? range.to.toISOString().split("T")[0] : "")
  }

  const debouncedSearch = useDebounce(searchTerm, 500)

  const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined
  const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined
  const minScore = minScoreStr ? parseInt(minScoreStr) : undefined
  const maxScore = maxScoreStr ? parseInt(maxScoreStr) : undefined

  useEffect(() => {
    setPageInput(page.toString())
  }, [page])

  // Sync debounced search to store
  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch)
    }
  }, [debouncedSearch])

  const handlePriceUpdate = () => {
    setMinPrice(minPriceInput)
    setMaxPrice(maxPriceInput)
    setPage(1)
  }

  const handleScoreUpdate = () => {
    setMinScore(minScoreInput)
    setMaxScore(maxScoreInput)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setMinPriceInput("")
    setMaxPriceInput("")
    setMinScoreInput("")
    setMaxScoreInput("")
    reset()
  }

  const handleApplyPerfectSetup = (withBreakout = false) => {
    reset()
    setSearchTerm("")
    setMinPriceInput("")
    setMaxPriceInput("")
    setMinScoreInput("70")
    setMaxScoreInput("")
    setMinScore("70")
    setAccDist1D("-1")
    setAccDist1W("-1")
    setAccDist1M("-1")
    setBandarStatus(["Accumulation"])
    setWatchlistId(watchlistId)
    if (withBreakout) {
      setSignals(["Breakout"])
    }
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "screenerAnalysis",
      page,
      limit,
      debouncedSearch,
      watchlistId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      signals,
      bandarStatus,
      momentum,
      minScore,
      maxScore,
      accDist1D,
      accDist1W,
      accDist1M,
      accDistOperator,
      peakReturnStr,
      peakReturnOperator,
      useCutoff,
      liquidity,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getScreenerAnalysis({
        page,
        limit,
        search: debouncedSearch,
        watchlistId: watchlistId ?? undefined,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        signals,
        bandarStatus,
        momentum,
        minScore,
        maxScore,
        accDist1D: accDist1D ? parseInt(accDist1D) : undefined,
        accDist1W: accDist1W ? parseInt(accDist1W) : undefined,
        accDist1M: accDist1M ? parseInt(accDist1M) : undefined,
        accDistOperator: accDistOperator as "gt" | "lt",
        peakReturn: peakReturnStr ? parseFloat(peakReturnStr) / 100 : undefined,
        peakReturnOperator: peakReturnOperator as "gt" | "lt",
        useCutoff,
        liquidity,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  })

  const { data: watchlists } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
    staleTime: 10 * 60 * 1000,
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

  const exportMutation = useMutation({
    mutationFn: async () => {
      const blob = await exportScreenerAnalysis({
        search: debouncedSearch,
        watchlistId: watchlistId ?? undefined,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        signals,
        bandarStatus,
        momentum,
        minScore,
        maxScore,
        accDist1D: accDist1D ? parseInt(accDist1D) : undefined,
        accDist1W: accDist1W ? parseInt(accDist1W) : undefined,
        accDist1M: accDist1M ? parseInt(accDist1M) : undefined,
        accDistOperator: accDistOperator as "gt" | "lt",
        peakReturn: peakReturnStr ? parseFloat(peakReturnStr) / 100 : undefined,
        peakReturnOperator: peakReturnOperator as "gt" | "lt",
        useCutoff,
        liquidity,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `screener-analysis-export-${new Date().toISOString().split("T")[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()

      return blob
    },
    onSuccess: () => {
      toast.success("Export downloaded successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to export: ${error.message}`)
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
    <div className="space-y-3">
      <Card className="mb-2 border-muted bg-card/20 py-0">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            {/* Top Bar: Search, Presets, Filter Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-50 flex-1">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Search symbol..."
                  className="h-9 bg-background/50 py-2 pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-w-xs min-w-48 flex-1">
                <MultiSelect
                  options={(watchlists ?? []).map((w) => ({
                    value: String(w.id),
                    label: w.name,
                    description: `${w._count.tickers} saham`,
                  }))}
                  selected={watchlistId != null ? [String(watchlistId)] : []}
                  onChange={(ids) => {
                    const last = ids[ids.length - 1]
                    setWatchlistId(last ? parseInt(last, 10) : null)
                  }}
                  placeholder="Pilih watchlist..."
                  searchPlaceholder="Cari watchlist..."
                />
              </div>

              <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 cursor-pointer font-mono text-[12px] font-medium"
                  onClick={() => handleApplyPerfectSetup(false)}
                >
                  Perfect Setup
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 cursor-pointer font-mono text-[12px] font-medium whitespace-nowrap"
                  onClick={() => handleApplyPerfectSetup(true)}
                >
                  + Breakout
                </Button>
                <Separator orientation="vertical" className="mx-1 h-5" />
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9"
                >
                  <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                  Filters
                </Button>

                <div className="ml-1 flex items-center gap-1.5">
                  <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    size="sm"
                    className="h-9 shrink-0 cursor-pointer"
                    variant="default"
                  >
                    {generateMutation.isPending ? (
                      "Generating..."
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3.5 w-3.5" /> Generate
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                    size="sm"
                    className="h-9 shrink-0 cursor-pointer"
                    variant="outline"
                    title="Export CSV"
                  >
                    {exportMutation.isPending ? (
                      "..."
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable Advanced Filters */}
            {showFilters && (
              <div className="grid animate-in grid-cols-1 gap-3 border-t pt-3 duration-200 fade-in slide-in-from-top-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Price & Score
                  </span>
                  <div className="flex h-9 items-center rounded-sm border bg-background px-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">
                      Price
                    </span>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <input
                      className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50"
                      placeholder="Min"
                      type="number"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      onBlur={handlePriceUpdate}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handlePriceUpdate()
                      }
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/50"
                      placeholder="Max"
                      type="number"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      onBlur={handlePriceUpdate}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handlePriceUpdate()
                      }
                    />
                  </div>
                  <div className="flex h-9 items-center rounded-sm border bg-background px-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">
                      Score
                    </span>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <input
                      className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50"
                      placeholder="Min"
                      type="number"
                      min="0"
                      max="100"
                      value={minScoreInput}
                      onChange={(e) => setMinScoreInput(e.target.value)}
                      onBlur={handleScoreUpdate}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleScoreUpdate()
                      }
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/50"
                      placeholder="Max"
                      type="number"
                      min="0"
                      max="100"
                      value={maxScoreInput}
                      onChange={(e) => setMaxScoreInput(e.target.value)}
                      onBlur={handleScoreUpdate}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleScoreUpdate()
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Signals & Status
                  </span>
                  <FilterMultiSelect
                    title="Signals"
                    options={[
                      { label: "Breakout", value: "Breakout" },
                      { label: "Spike", value: "Spike" },
                    ]}
                    selected={signals}
                    onChange={(val) => setSignals(val)}
                  />
                  <FilterMultiSelect
                    title="Status"
                    options={[
                      { label: "Accumulation", value: "Accumulation" },
                      { label: "Neutral", value: "Neutral" },
                      { label: "Distribution", value: "Distribution" },
                    ]}
                    selected={bandarStatus}
                    onChange={(val) => setBandarStatus(val)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Momentum & Liquidity
                  </span>
                  <FilterMultiSelect
                    title="Momentum"
                    options={[
                      { label: "Uptrend", value: "Uptrend" },
                      { label: "Sideways", value: "Sideways" },
                      { label: "Downtrend", value: "Downtrend" },
                    ]}
                    selected={momentum}
                    onChange={(val) => setMomentum(val)}
                  />
                  <FilterMultiSelect
                    title="Liquidity"
                    options={[
                      { label: "High", value: "High" },
                      { label: "Medium", value: "Medium" },
                      { label: "Low", value: "Low" },
                    ]}
                    selected={liquidity}
                    onChange={(val) => setLiquidity(val)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Returns & Cutoff
                  </span>

                  <div className="flex h-9 items-center gap-1 rounded-sm border bg-background px-2.5 text-xs">
                    <Select
                      value={accDistOperator}
                      onValueChange={(val) =>
                        setAccDistOperator(val as "gt" | "lt")
                      }
                    >
                      <SelectTrigger className="h-auto w-11 border-none px-1 py-0 text-[11px] focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Separator orientation="vertical" className="mx-1 h-3" />
                    <span className="text-[10px] text-muted-foreground">
                      A/D:
                    </span>
                    <input
                      className="w-12 bg-transparent text-center outline-none"
                      placeholder="1D"
                      type="number"
                      value={accDist1D}
                      onChange={(e) => setAccDist1D(e.target.value)}
                    />
                    <input
                      className="w-12 bg-transparent text-center outline-none"
                      placeholder="1W"
                      type="number"
                      value={accDist1W}
                      onChange={(e) => setAccDist1W(e.target.value)}
                    />
                    <input
                      className="w-12 bg-transparent text-center outline-none"
                      placeholder="1M"
                      type="number"
                      value={accDist1M}
                      onChange={(e) => setAccDist1M(e.target.value)}
                    />
                  </div>

                  <div className="flex h-9 items-center gap-1 rounded-sm border bg-background px-2.5 text-xs">
                    <Select
                      value={peakReturnOperator}
                      onValueChange={(val) =>
                        setPeakReturnOperator(val as "gt" | "lt")
                      }
                    >
                      <SelectTrigger className="h-auto w-11 border-none px-1 py-0 text-[11px] focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Separator orientation="vertical" className="mx-1 h-3" />
                    <span className="text-[10px] text-muted-foreground">
                      Peak:
                    </span>
                    <div className="flex flex-1 items-center gap-1">
                      <input
                        className="w-full bg-transparent text-right outline-none"
                        placeholder="Value"
                        type="number"
                        value={peakReturnStr}
                        onChange={(e) => setPeakReturn(e.target.value)}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="cutoff-toggle"
                        checked={useCutoff}
                        onCheckedChange={(val) => setUseCutoff(val)}
                      />
                      <Label
                        htmlFor="cutoff-toggle"
                        className="cursor-pointer text-xs font-medium"
                      >
                        Cutoff 20D
                      </Label>
                    </div>

                    <Button
                      onClick={handleResetFilters}
                      size="sm"
                      variant="ghost"
                      className="h-8 shrink-0 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Date Range
                  </span>
                  <DatePickerWithRange
                    date={dateRange}
                    setDate={handleDateRangeChange}
                    className="w-full"
                  />
                  <div className="flex gap-1">
                    {[
                      {
                        label: "1W",
                        fn: () => {
                          const to = new Date()
                          const from = new Date()
                          from.setDate(to.getDate() - 7)
                          handleDateRangeChange({ from, to })
                        },
                      },
                      {
                        label: "2W",
                        fn: () => {
                          const to = new Date()
                          const from = new Date()
                          from.setDate(to.getDate() - 14)
                          handleDateRangeChange({ from, to })
                        },
                      },
                      {
                        label: "1M",
                        fn: () => {
                          const to = new Date()
                          const from = new Date()
                          from.setMonth(to.getMonth() - 1)
                          handleDateRangeChange({ from, to })
                        },
                      },
                      {
                        label: "All",
                        fn: () => handleDateRangeChange(undefined),
                      },
                    ].map(({ label, fn }) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        className="h-7 flex-1 px-1 text-[11px]"
                        onClick={fn}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Vol / Val</TableHead>
            <TableHead>Broker Net</TableHead>
            <TableHead>Acc/Dist (%)</TableHead>
            <TableHead>Bandar Status</TableHead>
            <TableHead>Insight</TableHead>
            <TableHead>Remora</TableHead>
            <TableHead>Top Brokers</TableHead>
            <TableHead className="text-center">Returns (%)</TableHead>
            <TableHead className="text-right">Peak Return</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={12} className="h-24 text-center">
                Loading analysis data...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={12}
                className="text-negative h-24 text-center"
              >
                Error: {(error as Error).message}
              </TableCell>
            </TableRow>
          ) : !data || data.data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={12}
                className="h-24 text-center text-muted-foreground"
              >
                No analysis data found
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((row: any) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => navigate(`/stock/${row.symbol}`)}
              >
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    {row.ticker?.logo ? (
                      <img
                        src={row.ticker?.logo}
                        alt={row.symbol}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                        {row.symbol?.substring(0, 2)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 font-mono text-[13px] font-bold">
                        {row.symbol}
                        {row.screener?.isBreakout && (
                          <span
                            className="text-warning text-[11px]"
                            title="Breakout"
                          >
                            BO
                          </span>
                        )}
                      </span>
                      <span
                        className="max-w-40 truncate text-[11px] text-muted-foreground"
                        title={row.ticker?.name || "-"}
                      >
                        {row.ticker?.name || "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                    {format(new Date(row.signalDate), "dd MMM yy")}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-mono text-[13px] font-bold">
                      {Number(row.screener?.price || 0).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "ml-1.5 font-mono text-[11px] font-medium",
                        Number(row.screener?.changePercentage || 0) > 0
                          ? "text-positive"
                          : Number(row.screener?.changePercentage || 0) < 0
                            ? "text-negative"
                            : "text-muted-foreground"
                      )}
                    >
                      {Number(row.screener?.changePercentage || 0) > 0
                        ? "+"
                        : ""}
                      {Number(row.screener?.changePercentage || 0).toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-medium">
                      {formatNumber(Number(row.screener?.volume || 0))}
                    </span>
                    <span className="mt-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                      Rp {formatNumber(Number(row.transactionValue || 0))}
                    </span>
                    {row.screener?.isVolumeSpike && (
                      <span className="text-warning mt-0.5 font-mono text-[10px] font-bold">
                        Spike
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "font-mono font-medium tracking-tight",
                        Number(row.screener?.netBrokerFlow || 0) > 0
                          ? "text-positive"
                          : Number(row.screener?.netBrokerFlow || 0) < 0
                            ? "text-negative"
                            : "text-muted-foreground"
                      )}
                    >
                      {Number(row.screener?.netBrokerFlow || 0) > 0 ? "+" : ""}
                      {formatNumber(Number(row.screener?.netBrokerFlow || 0))}
                    </span>
                    {row.netForeign !== undefined && (
                      <span
                        className={cn(
                          "mt-0.5 font-mono text-[10px] font-medium tracking-tight",
                          Number(row.netForeign) > 0
                            ? "text-positive"
                            : Number(row.netForeign) < 0
                              ? "text-negative"
                              : "text-muted-foreground"
                        )}
                        title="Net Foreign"
                      >
                        {Number(row.netForeign) > 0
                          ? "+F "
                          : Number(row.netForeign) < 0
                            ? "-F "
                            : "F "}
                        {formatNumber(Math.abs(Number(row.netForeign)))}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-[11px] whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-muted-foreground/70">1D</span>
                      <span
                        className={cn(
                          "font-medium",
                          Number(
                            row.screener?.accumulationDistribution1D || 0
                          ) > 0
                            ? "text-positive"
                            : Number(
                                  row.screener?.accumulationDistribution1D || 0
                                ) < 0
                              ? "text-negative"
                              : "text-muted-foreground"
                        )}
                      >
                        {Number(row.screener?.accumulationDistribution1D || 0) >
                        0
                          ? "+"
                          : ""}
                        {Number(
                          row.screener?.accumulationDistribution1D || 0
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-muted-foreground/70">1W</span>
                      <span
                        className={cn(
                          "font-medium",
                          Number(
                            row.screener?.accumulationDistribution1W || 0
                          ) > 0
                            ? "text-positive"
                            : Number(
                                  row.screener?.accumulationDistribution1W || 0
                                ) < 0
                              ? "text-negative"
                              : "text-muted-foreground"
                        )}
                      >
                        {Number(row.screener?.accumulationDistribution1W || 0) >
                        0
                          ? "+"
                          : ""}
                        {Number(
                          row.screener?.accumulationDistribution1W || 0
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-muted-foreground/70">1M</span>
                      <span
                        className={cn(
                          "font-medium",
                          Number(
                            row.screener?.accumulationDistribution1M || 0
                          ) > 0
                            ? "text-positive"
                            : Number(
                                  row.screener?.accumulationDistribution1M || 0
                                ) < 0
                              ? "text-negative"
                              : "text-muted-foreground"
                        )}
                      >
                        {Number(row.screener?.accumulationDistribution1M || 0) >
                        0
                          ? "+"
                          : ""}
                        {Number(
                          row.screener?.accumulationDistribution1M || 0
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={row.screener?.bandarStatus || "Neutral"}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 text-muted-foreground/70">Scr:</span>
                      <ScoreBadge
                        score={Number(row.screener?.smartMoneyScore || 0)}
                        className="text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 text-muted-foreground/70">Mom:</span>
                      <span
                        className={cn(
                          "font-mono font-medium",
                          row.screener?.momentum === "Uptrend"
                            ? "text-positive"
                            : row.screener?.momentum === "Downtrend"
                              ? "text-negative"
                              : "text-muted-foreground"
                        )}
                      >
                        {row.screener?.momentum || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 text-muted-foreground/70">Liq:</span>
                      <span
                        className={cn(
                          "font-mono font-medium",
                          row.screener?.liquidityScore === "High"
                            ? "text-blue-400"
                            : row.screener?.liquidityScore === "Medium"
                              ? "text-warning"
                              : "text-muted-foreground"
                        )}
                      >
                        {row.screener?.liquidityScore || "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-[11px] whitespace-nowrap">
                    <div
                      title="Price Volume Analysis"
                      className={cn(
                        "flex items-center gap-1 font-mono font-medium",
                        row.screener?.pvaTrend === "UPTREND"
                          ? "text-positive"
                          : row.screener?.pvaTrend === "DOWNTREND"
                            ? "text-negative"
                            : row.screener?.pvaTrend === "MIXED"
                              ? "text-warning"
                              : "text-muted-foreground"
                      )}
                    >
                      <Activity className="h-3 w-3 shrink-0" />
                      <span>{row.screener?.pvaTrend ?? "-"}</span>
                    </div>
                    {row.screener?.volumeAnomaly &&
                      row.screener.volumeAnomaly !== "NONE" && (
                        <div
                          title="Volume Anomaly"
                          className={cn(
                            "flex items-center gap-1 font-mono font-medium",
                            row.screener.volumeAnomaly === "EXTREME"
                              ? "text-negative"
                              : row.screener.volumeAnomaly === "STRONG"
                                ? "text-warning"
                                : "text-warning"
                          )}
                        >
                          <BarChart2 className="h-3 w-3 shrink-0" />
                          <span>{row.screener.volumeAnomaly}</span>
                        </div>
                      )}
                    {row.screener?.washTradingRisk &&
                      row.screener.washTradingRisk !== "LOW" && (
                        <div
                          title="Wash Trading Risk"
                          className={cn(
                            "flex items-center gap-1 font-mono font-medium",
                            row.screener.washTradingRisk === "HIGH"
                              ? "text-negative"
                              : "text-warning"
                          )}
                        >
                          <Shuffle className="h-3 w-3 shrink-0" />
                          <span>{row.screener.washTradingRisk}</span>
                        </div>
                      )}
                    {row.screener?.distributionRisk != null &&
                      Number(row.screener.distributionRisk) > 30 && (
                        <div
                          title="Distribution Risk"
                          className={cn(
                            "flex items-center gap-1 font-mono font-medium",
                            Number(row.screener.distributionRisk) > 60
                              ? "text-negative"
                              : "text-warning"
                          )}
                        >
                          <ArrowDownRight className="h-3 w-3 shrink-0" />
                          <span>
                            {Number(row.screener.distributionRisk).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    {row.screener?.repoPatternDetected && (
                      <div
                        title="Repo Pattern Detected"
                        className="text-negative flex items-center gap-1 font-medium"
                      >
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Repo</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-1.5 text-[11px]">
                    <div className="hide-scrollbar flex max-w-37.5 items-center gap-1 overflow-x-auto">
                      {row.brokerSummary?.brokersBuy?.length > 0 ? (
                        row.brokerSummary.brokersBuy.map(
                          (b: any, idx: number) => (
                            <span
                              key={(b.netbsBrokerCode || String(idx)) + "-buy"}
                              className={cn(
                                "rounded px-1 py-0.5 font-medium whitespace-nowrap",
                                getBrokerCodeClass(b.netbsBrokerCode)
                              )}
                            >
                              {b.netbsBrokerCode}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="hide-scrollbar flex max-w-37.5 items-center gap-1 overflow-x-auto">
                      {row.brokerSummary?.brokersSell?.length > 0 ? (
                        row.brokerSummary.brokersSell.map(
                          (b: any, idx: number) => (
                            <span
                              key={(b.netbsBrokerCode || String(idx)) + "-sell"}
                              className={cn(
                                "rounded px-1 py-0.5 font-medium whitespace-nowrap",
                                getBrokerCodeClass(b.netbsBrokerCode)
                              )}
                            >
                              {b.netbsBrokerCode}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-center">
                    <div className="flex justify-center gap-1.5">
                      {["1D", "3D", "5D", "10D", "20D"].map((label) => (
                        <div
                          key={`head-${label}`}
                          className="w-9 text-[10px] text-muted-foreground"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5">
                      {["1D", "3D", "5D", "10D", "20D"].map((label) => {
                        const key = `return${label}` as keyof typeof row
                        const val = row[key]
                        return (
                          <div
                            key={label}
                            className={cn(
                              "w-9 truncate rounded p-1 font-mono text-[10px] font-medium tracking-tighter",
                              Number(val) > 0
                                ? "text-positive bg-emerald-400/10"
                                : Number(val) < 0
                                  ? "text-negative bg-red-400/10"
                                  : "bg-muted/50 text-muted-foreground"
                            )}
                          >
                            {val ? formatPercent(val).replace("%", "") : "-"}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        "font-mono text-[13px] font-bold",
                        Number(row.peakReturn) > 0
                          ? "text-positive"
                          : Number(row.peakReturn) < 0
                            ? "text-negative"
                            : ""
                      )}
                    >
                      {formatPercent(row.peakReturn)}
                    </span>
                    {row.daysToPeak && (
                      <span className="text-[10px] text-muted-foreground">
                        {row.daysToPeak} days
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {data?.data.length || 0} of {data?.meta.total || 0} results
          </span>
          <Select
            value={String(limit)}
            onValueChange={(val) => {
              setLimit(Number(val))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 12, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(1)}
            disabled={page <= 1 || isLoading}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="mx-2 flex items-center gap-2">
            <span className="font-mono text-sm font-medium">Page</span>
            <Input
              className="h-8 w-16 px-1 text-center"
              value={pageInput}
              type="number"
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const p = parseInt(pageInput)
                if (!isNaN(p) && p > 0) setPage(p)
                else setPageInput(page.toString())
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = parseInt(pageInput)
                  if (!isNaN(p) && p > 0) setPage(p)
                }
              }}
            />
            <span className="font-mono text-sm font-medium">
              of {data?.meta.totalPages || 1}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!data || page >= data.meta.totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(data?.meta.totalPages || 1)}
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
