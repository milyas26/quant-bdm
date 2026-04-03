import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import {
  getScreenerAnalysis,
  generateScreenerAnalysis,
  exportScreenerAnalysis,
} from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce"
import { useScreenerAnalysisFilterStore } from "@/stores/screenerAnalysisFilterStore"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        minScore,
        maxScore,
        accDist1D: accDist1D ? parseInt(accDist1D) : undefined,
        accDist1W: accDist1W ? parseInt(accDist1W) : undefined,
        accDist1M: accDist1M ? parseInt(accDist1M) : undefined,
        accDistOperator: accDistOperator as "gt" | "lt",
        peakReturn: peakReturnStr
          ? parseFloat(peakReturnStr) / 100
          : undefined,
        peakReturnOperator: peakReturnOperator as "gt" | "lt",
        useCutoff,
        liquidity,
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

  const exportMutation = useMutation({
    mutationFn: async () => {
      const blob = await exportScreenerAnalysis({
        search: debouncedSearch,
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
        peakReturn: peakReturnStr
          ? parseFloat(peakReturnStr) / 100
          : undefined,
        peakReturnOperator: peakReturnOperator as "gt" | "lt",
        useCutoff,
        liquidity,
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
      <Card className="bg-card/20 mb-2 border-muted">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            {/* Top Bar: Search, Presets, Filter Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Search symbol..."
                  className="h-9 py-2 pl-9 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 cursor-pointer text-[13px] font-medium"
                  onClick={() => handleApplyPerfectSetup(false)}
                >
                  ⭐ Perfect Setup
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 cursor-pointer text-[13px] font-medium whitespace-nowrap"
                  onClick={() => handleApplyPerfectSetup(true)}
                >
                  ⚡ + Breakout
                </Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                  Filters
                </Button>

                <div className="flex items-center gap-1.5 ml-1">
                  <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    size="sm"
                    className="h-9 cursor-pointer shrink-0"
                    variant="default"
                  >
                    {generateMutation.isPending ? "..." : <><Play className="mr-1.5 h-3.5 w-3.5" /> Generate</>}
                  </Button>
                  <Button
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                    size="sm"
                    className="h-9 cursor-pointer shrink-0"
                    variant="outline"
                    title="Export CSV"
                  >
                    {exportMutation.isPending ? "..." : <Download className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable Advanced Filters */}
            {showFilters && (
              <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price & Score</span>
                  <div className="flex h-9 items-center rounded-md border bg-background px-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">Price</span>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <input
                      className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50"
                      placeholder="Min"
                      type="number"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      onBlur={handlePriceUpdate}
                      onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/50"
                      placeholder="Max"
                      type="number"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      onBlur={handlePriceUpdate}
                      onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
                    />
                  </div>
                  <div className="flex h-9 items-center rounded-md border bg-background px-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">Score</span>
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
                      onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()}
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
                      onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signals & Status</span>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Momentum & Liquidity</span>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Returns & Cutoff</span>

                  <div className="flex h-9 items-center gap-1 rounded-md border bg-background px-2.5 text-xs">
                    <Select value={accDistOperator} onValueChange={(val) => setAccDistOperator(val as "gt" | "lt")}>
                      <SelectTrigger className="h-6 w-11 border-none px-1 py-0 h-auto text-[11px] focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Separator orientation="vertical" className="mx-1 h-3" />
                    <span className="text-[10px] text-muted-foreground">A/D:</span>
                    <input className="w-6 bg-transparent text-center outline-none" placeholder="1D" type="number" value={accDist1D} onChange={(e) => setAccDist1D(e.target.value)} />
                    <input className="w-6 bg-transparent text-center outline-none" placeholder="1W" type="number" value={accDist1W} onChange={(e) => setAccDist1W(e.target.value)} />
                    <input className="w-6 bg-transparent text-center outline-none" placeholder="1M" type="number" value={accDist1M} onChange={(e) => setAccDist1M(e.target.value)} />
                  </div>

                  <div className="flex h-9 items-center gap-1 rounded-md border bg-background px-2.5 text-xs">
                    <Select value={peakReturnOperator} onValueChange={(val) => setPeakReturnOperator(val as "gt" | "lt")}>
                      <SelectTrigger className="h-6 w-11 border-none px-1 py-0 h-auto text-[11px] focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Separator orientation="vertical" className="mx-1 h-3" />
                    <span className="text-[10px] text-muted-foreground">Peak:</span>
                    <div className="flex items-center gap-1 flex-1">
                      <input className="w-full bg-transparent text-right outline-none" placeholder="Value" type="number" value={peakReturnStr} onChange={(e) => setPeakReturn(e.target.value)} />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <Switch id="cutoff-toggle" checked={useCutoff} onCheckedChange={(val) => setUseCutoff(val)} />
                      <Label htmlFor="cutoff-toggle" className="cursor-pointer text-xs font-medium">Cutoff 20D</Label>
                    </div>

                    <Button onClick={handleResetFilters} size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs shrink-0">
                      <X className="mr-1 h-3 w-3" />
                      Clear
                    </Button>
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
            <TableHead>Volume</TableHead>
            <TableHead>Broker Net</TableHead>
            <TableHead>Acc/Dist (%)</TableHead>
            <TableHead>Bandar Status</TableHead>
            <TableHead>Insight</TableHead>
            <TableHead>Top Brokers</TableHead>
            <TableHead className="text-center">Returns (%)</TableHead>
            <TableHead className="text-right">Peak Return</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">Loading analysis data...</TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-red-500">Error: {(error as Error).message}</TableCell>
            </TableRow>
          ) : !data || data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">No analysis data found</TableCell>
            </TableRow>
          ) : (
            data.data.map((row: any) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => navigate(`/stock/${row.symbol}`)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {row.ticker?.logo ? (
                      <img
                        src={row.ticker?.logo}
                        alt={row.symbol}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {row.symbol?.substring(0, 2)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-sm font-bold">
                        {row.symbol}
                        {row.screener?.isBreakout && (
                          <span className="text-[11px] text-orange-500" title="Breakout">⚡Breakout</span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground max-w-[120px] truncate" title={row.ticker?.name || "-"}>
                        {row.ticker?.name || "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(row.signalDate), "dd MMM yy")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {Number(row.screener?.price || 0).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        Number(row.screener?.changePercentage || 0) > 0
                          ? "text-green-600"
                          : Number(row.screener?.changePercentage || 0) < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {Number(row.screener?.changePercentage || 0) > 0 ? "+" : ""}
                      {Number(row.screener?.changePercentage || 0).toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {formatNumber(Number(row.screener?.volume || 0))}
                    </span>
                    {row.screener?.isVolumeSpike && (
                      <span className="text-[10px] font-bold text-orange-500">🔥 Spike</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-medium tracking-tight",
                      Number(row.screener?.netBrokerFlow || 0) > 0
                        ? "text-green-600"
                        : Number(row.screener?.netBrokerFlow || 0) < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    {Number(row.screener?.netBrokerFlow || 0) > 0 ? "+" : ""}
                    {formatNumber(Number(row.screener?.netBrokerFlow || 0))}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-muted-foreground/70">1D</span>
                      <span className={cn("font-medium", Number(row.screener?.accumulationDistribution1D || 0) > 0 ? "text-green-600" : Number(row.screener?.accumulationDistribution1D || 0) < 0 ? "text-red-600" : "text-gray-600")}>
                        {Number(row.screener?.accumulationDistribution1D || 0) > 0 ? "+" : ""}{Number(row.screener?.accumulationDistribution1D || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-muted-foreground/70">1W</span>
                      <span className={cn("font-medium", Number(row.screener?.accumulationDistribution1W || 0) > 0 ? "text-green-600" : Number(row.screener?.accumulationDistribution1W || 0) < 0 ? "text-red-600" : "text-gray-600")}>
                        {Number(row.screener?.accumulationDistribution1W || 0) > 0 ? "+" : ""}{Number(row.screener?.accumulationDistribution1W || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-muted-foreground/70">1M</span>
                      <span className={cn("font-medium", Number(row.screener?.accumulationDistribution1M || 0) > 0 ? "text-green-600" : Number(row.screener?.accumulationDistribution1M || 0) < 0 ? "text-red-600" : "text-gray-600")}>
                        {Number(row.screener?.accumulationDistribution1M || 0) > 0 ? "+" : ""}{Number(row.screener?.accumulationDistribution1M || 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium tracking-tight",
                      row.screener?.bandarStatus === "Accumulation" && "border-green-200 bg-green-50 text-green-700",
                      row.screener?.bandarStatus === "Distribution" && "border-red-200 bg-red-50 text-red-700",
                      row.screener?.bandarStatus === "Neutral" && "border-gray-200 bg-gray-50 text-gray-700"
                    )}
                  >
                    {row.screener?.bandarStatus || "-"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground/70 w-6">Scr:</span>
                      <span className={cn("font-bold", Number(row.screener?.smartMoneyScore || 0) >= 70 ? "text-green-600" : Number(row.screener?.smartMoneyScore || 0) <= 30 ? "text-red-600" : "text-yellow-600")}>
                        {row.screener?.smartMoneyScore || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground/70 w-6">Mom:</span>
                      <span className={cn("font-medium", row.screener?.momentum === "Uptrend" ? "text-green-600" : row.screener?.momentum === "Downtrend" ? "text-red-600" : "text-gray-600")}>
                        {row.screener?.momentum || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground/70 w-6">Liq:</span>
                      <span className={cn("font-medium", row.screener?.liquidityScore === "High" ? "text-blue-600" : row.screener?.liquidityScore === "Medium" ? "text-yellow-600" : "text-gray-600")}>
                        {row.screener?.liquidityScore || "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[120px]">
                      <span className="text-green-600/70 font-medium mr-0.5">B</span>
                      {row.brokerSummary?.brokersBuy?.length > 0 ? (
                        row.brokerSummary.brokersBuy.map((b: any, idx: number) => (
                          <span
                            key={(b.netbsBrokerCode || String(idx)) + "-buy"}
                            className={cn("px-1 py-0.5 rounded bg-muted/50 whitespace-nowrap font-medium", getBrokerCodeClass(b.netbsBrokerCode))}
                          >
                            {b.netbsBrokerCode}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[120px]">
                      <span className="text-red-600/70 font-medium mr-0.5">S</span>
                      {row.brokerSummary?.brokersSell?.length > 0 ? (
                        row.brokerSummary.brokersSell.map((b: any, idx: number) => (
                          <span
                            key={(b.netbsBrokerCode || String(idx)) + "-sell"}
                            className={cn("px-1 py-0.5 rounded bg-muted/50 whitespace-nowrap font-medium", getBrokerCodeClass(b.netbsBrokerCode))}
                          >
                            {b.netbsBrokerCode}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-center justify-center">
                    <div className="flex gap-1.5 justify-center">
                      {["1D", "3D", "5D", "10D", "20D"].map((label) => (
                        <div key={`head-${label}`} className="w-9 text-[10px] text-muted-foreground">{label}</div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 justify-center">
                      {["1D", "3D", "5D", "10D", "20D"].map((label) => {
                        const key = `return${label}` as keyof typeof row
                        const val = row[key]
                        return (
                          <div
                            key={label}
                            className={cn(
                              "w-9 rounded p-1 text-[10px] font-medium tracking-tighter truncate",
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
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span
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
          <span>Showing {data?.data.length || 0} of {data?.meta.total || 0} results</span>
          <Select
            value={String(limit)}
            onValueChange={(val) => { setLimit(Number(val)); setPage(1) }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
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
            <span className="text-sm font-medium">Page</span>
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
            <span className="text-sm font-medium">
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
