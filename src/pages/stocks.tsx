import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  getScreener,
  getScreenerDates,
  refreshAllTickers,
} from "@/lib/api"
import { AddToWatchlistDialog } from "@/components/add-to-watchlist-dialog"
import { useStocksFilterStore } from "@/stores/stocksFilterStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search, RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  SlidersHorizontal
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { cn, getBrokerCodeClass } from "@/lib/utils"
import { toast } from "sonner"
import { FilterMultiSelect } from "@/components/filter-multi-select"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { SimulateBuyButton } from "@/components/simulate-buy-button"
import { Bookmark } from "lucide-react"

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

export default function StocksPage() {
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [watchlistDialogSymbol, setWatchlistDialogSymbol] = useState<string | null>(null)

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
    date,
    accDistOperator,
    accDist1D,
    accDist1W,
    accDist1M,
    minScore,
    maxScore,
    netBrokerFlowOperator,
    netBrokerFlowValue,
    setPage,
    setLimit,
    setSearch,
    setMinPrice,
    setMaxPrice,
    setSort,
    setSignals,
    setBandarStatus,
    setMomentum,
    setDate,
    setAccDistOperator,
    setAccDist1D,
    setAccDist1W,
    setAccDist1M,
    setMinScore,
    setMaxScore,
    setNetBrokerFlowOperator,
    setNetBrokerFlowValue,
    liquidity,
    setLiquidity,
    reset,
  } = useStocksFilterStore()

  // Local input states for controlled inputs
  const [searchTerm, setSearchTerm] = useState(search)
  const [minPriceInput, setMinPriceInput] = useState(minPriceStr)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceStr)
  const [minScoreInput, setMinScoreInput] = useState(minScore)
  const [maxScoreInput, setMaxScoreInput] = useState(maxScore)
  const [pageInput, setPageInput] = useState(page.toString())
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined
  const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined

  useEffect(() => {
    setPageInput(page.toString())
  }, [page])

  // Sync debounced search to store
  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch)
    }
  }, [debouncedSearch])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSort(column, sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSort(column, "desc")
    }
  }

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
    setNetBrokerFlowValue("0")
    setAccDist1D("-1")
    setAccDist1W("-1")
    setAccDist1M("-1")
    setBandarStatus(["Accumulation"])
    if (withBreakout) {
      setSignals(["Breakout"])
    }
  }

  const { data: screenerDates, isLoading: isLoadingDates } = useQuery({
    queryKey: ["screener-dates"],
    queryFn: getScreenerDates,
    staleTime: 5 * 60 * 1000,
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "tickers",
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
      date,
      accDistOperator,
      accDist1D,
      accDist1W,
      accDist1M,
      minScore,
      maxScore,
      netBrokerFlowOperator,
      netBrokerFlowValue,
      liquidity,
    ],
    queryFn: () =>
      getScreener({
        page,
        limit,
        search: debouncedSearch,
        minPrice,
        maxPrice,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
        signals,
        bandarStatus,
        momentum,
        date: date || undefined,
        accDistOperator,
        accDist1D: accDist1D ? parseFloat(accDist1D) : undefined,
        accDist1W: accDist1W ? parseFloat(accDist1W) : undefined,
        accDist1M: accDist1M ? parseFloat(accDist1M) : undefined,
        minScore: minScore ? parseInt(minScore) : undefined,
        maxScore: maxScore ? parseInt(maxScore) : undefined,
        netBrokerFlowOperator,
        netBrokerFlowValue: netBrokerFlowValue ? parseFloat(netBrokerFlowValue) : undefined,
        liquidity,
      }),
  })

  const { mutate: handleRefreshAllTickers, isPending: isRefreshing } =
    useMutation({
      mutationFn: refreshAllTickers,
      onSuccess: () => {
        toast.success("Refreshing all tickers data in background started.")
      },
      onError: (error) => {
        toast.error(`Failed to start refreshing: ${(error as Error).message}`)
      },
    })

  return (
    <div className="space-y-3">
      <AddToWatchlistDialog
        symbol={watchlistDialogSymbol}
        onClose={() => setWatchlistDialogSymbol(null)}
      />
      <Card className="bg-card/20 mb-2 py-0 border-muted">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            {/* Top Bar: Search, Presets, Filter Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Search symbol or name..."
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRefreshAllTickers()}
                  disabled={isRefreshing}
                  className="h-9 w-9 shrink-0"
                  title="Refresh Tickers"
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flow & Date</span>
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
                    <Select value={netBrokerFlowOperator} onValueChange={(val) => setNetBrokerFlowOperator(val as "gt" | "lt")}>
                      <SelectTrigger className="h-6 w-11 border-none px-1 py-0 h-auto text-[11px] focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Separator orientation="vertical" className="mx-1 h-3" />
                    <span className="text-[10px] text-muted-foreground">Net:</span>
                    <input className="w-full bg-transparent outline-none" placeholder="0" type="number" value={netBrokerFlowValue} onChange={(e) => setNetBrokerFlowValue(e.target.value)} />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn("h-8 flex-1 justify-start text-left font-normal text-xs px-2", !date && "text-muted-foreground")}
                          disabled={isLoadingDates}
                        >
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                          {date ? format(parseISO(date), "dd MMM yy") : "Latest"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={date ? parseISO(date) : undefined}
                          onSelect={(d) => {
                            if (!d) { setDate(null); return }
                            const str = format(d, "yyyy-MM-dd")
                            setDate(screenerDates?.includes(str) ? str : null)
                            setPage(1)
                          }}
                          disabled={(d) => {
                            const str = format(d, "yyyy-MM-dd")
                            return !screenerDates?.includes(str)
                          }}
                          initialFocus
                        />
                        {date && (
                          <div className="border-t p-2">
                            <Button variant="ghost" size="sm" className="w-full text-xs h-7" onClick={() => { setDate(null); setPage(1) }}>Reset Date</Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>

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
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("symbol")}
            >
              <div className="flex items-center gap-1">
                Ticker
                {sortBy === "symbol" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("price")}
            >
              <div className="flex items-center gap-1">
                Price
                {sortBy === "price" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("volume")}
            >
              <div className="flex items-center gap-1">
                Vol/Val
                {sortBy === "volume" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("netBrokerFlow")}
            >
              <div className="flex items-center gap-1">
                Broker Net
                {sortBy === "netBrokerFlow" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("accumulationDistribution1D")}
            >
              <div className="flex items-center gap-1">
                Acc/Dist (%)
                {sortBy === "accumulationDistribution1D" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("bandarStatus")}
            >
              <div className="flex items-center gap-1">
                Bandar Status
                {sortBy === "bandarStatus" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("smartMoneyScore")}
            >
              <div className="flex items-center gap-1">
                Score
                {sortBy === "smartMoneyScore" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("momentum")}
            >
              <div className="flex items-center gap-1">
                Momentum
                {sortBy === "momentum" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead>Top Brokers</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("liquidityScore")}
            >
              <div className="flex items-center gap-1">
                Liquidity
                {sortBy === "liquidityScore" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("sector")}
            >
              <div className="flex items-center gap-1">
                Sector
                {sortBy === "sector" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={14} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={14} className="h-24 text-center text-red-500">
                Error: {(error as Error).message}
              </TableCell>
            </TableRow>
          ) : data?.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((ticker) => (
              <TableRow
                key={ticker.symbol}
                className="cursor-pointer"
                onClick={() => navigate(`/stock/${ticker.symbol}`)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setWatchlistDialogSymbol(ticker.symbol)
                      }}
                    >
                      <Bookmark
                        className={cn(
                          "h-4 w-4",
                          ticker.isOnWatchlist
                            ? "fill-blue-500 text-blue-500"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                    <div className="flex items-center gap-2">
                      {ticker.logo && (
                        <img
                          src={ticker.logo}
                          alt={ticker.symbol}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-sm font-bold">
                          {ticker.symbol}
                          {ticker.isBreakout && (
                            <span
                              title="Breakout"
                              className="text-[11px] text-orange-500"
                            >
                              ⚡Breakout
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ticker.name || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {ticker.price.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        ticker.changePercentage > 0
                          ? "text-green-600"
                          : ticker.changePercentage < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {ticker.changePercentage > 0 ? "+" : ""}
                      {ticker.changePercentage.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {formatNumber(ticker.volume)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      Rp {formatNumber(Number(ticker.transactionValue || 0))}
                    </span>
                    {ticker.isVolumeSpike && (
                      <span className="text-xs font-bold text-orange-500">
                        🔥 Spike
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-medium",
                      ticker.netBrokerFlow > 0
                        ? "text-green-600"
                        : ticker.netBrokerFlow < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    {ticker.netBrokerFlow > 0 ? "+" : ""}
                    {formatNumber(ticker.netBrokerFlow)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-muted-foreground/70">1D</span>
                      <span className={cn("font-medium", ticker.accumulationDistribution.d1 > 0 ? "text-green-600" : ticker.accumulationDistribution.d1 < 0 ? "text-red-600" : "text-gray-600")}>
                        {ticker.accumulationDistribution.d1 > 0 ? "+" : ""}{ticker.accumulationDistribution.d1.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-muted-foreground/70">1W</span>
                      <span className={cn("font-medium", ticker.accumulationDistribution.w1 > 0 ? "text-green-600" : ticker.accumulationDistribution.w1 < 0 ? "text-red-600" : "text-gray-600")}>
                        {ticker.accumulationDistribution.w1 > 0 ? "+" : ""}{ticker.accumulationDistribution.w1.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-muted-foreground/70">1M</span>
                      <span className={cn("font-medium", ticker.accumulationDistribution.m1 > 0 ? "text-green-600" : ticker.accumulationDistribution.m1 < 0 ? "text-red-600" : "text-gray-600")}>
                        {ticker.accumulationDistribution.m1 > 0 ? "+" : ""}{ticker.accumulationDistribution.m1.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium tracking-tight",
                      ticker.bandarStatus === "Accumulation" && "border-green-200 bg-green-50 text-green-700",
                      ticker.bandarStatus === "Distribution" && "border-red-200 bg-red-50 text-red-700",
                      ticker.bandarStatus === "Neutral" && "border-gray-200 bg-gray-50 text-gray-700"
                    )}
                  >
                    {ticker.bandarStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-bold",
                      ticker.smartMoneyScore >= 70
                        ? "text-green-600"
                        : ticker.smartMoneyScore <= 30
                          ? "text-red-600"
                          : "text-yellow-600"
                    )}
                  >
                    {ticker.smartMoneyScore}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      ticker.momentum === "Uptrend" && "text-green-600",
                      ticker.momentum === "Downtrend" && "text-red-600"
                    )}
                  >
                    {ticker.momentum}
                  </Badge>
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[135px]">
                      {ticker.topBuyers?.length > 0 ? (
                        ticker.topBuyers.map((b: any, idx: number) => (
                          <span
                            key={(b.code || String(idx)) + "-tb"}
                            className={cn("px-1 py-0.5 rounded bg-muted/50 whitespace-nowrap font-medium", getBrokerCodeClass(b.code))}
                          >
                            {b.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[135px]">
                      {ticker.topSellers?.length > 0 ? (
                        ticker.topSellers.map((b: any, idx: number) => (
                          <span
                            key={(b.code || String(idx)) + "-ts"}
                            className={cn("px-1 py-0.5 rounded bg-muted/50 whitespace-nowrap font-medium", getBrokerCodeClass(b.code))}
                          >
                            {b.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      ticker.liquidityScore === "High"
                        ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
                        : ticker.liquidityScore === "Medium"
                          ? "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {ticker.liquidityScore}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticker.sector ? (
                    <span className="text-[11px] font-medium text-muted-foreground line-clamp-2 leading-tight">
                      {ticker.sector}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <SimulateBuyButton ticker={ticker} />
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
              {[10, 25, 50, 100].map((n) => (
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
