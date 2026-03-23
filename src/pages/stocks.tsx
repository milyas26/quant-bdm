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
  Search,
  MoreHorizontal,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
    setAccDist1D("0")
    setAccDist1W("0")
    setAccDist1M("0")
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
    <div className="space-y-4">
      <AddToWatchlistDialog
        symbol={watchlistDialogSymbol}
        onClose={() => setWatchlistDialogSymbol(null)}
      />
      <Card className="bg-card/20">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Presets:</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={() => handleApplyPerfectSetup(false)}
            >
              ⭐ Perfect Setup
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={() => handleApplyPerfectSetup(true)}
            >
              ⚡ Perfect Setup + Breakout
            </Button>
          </div>
          <div className="flex flex-col flex-wrap gap-2 md:flex-row md:items-end">
            <div className="w-full min-w-50 md:w-auto md:flex-1">
              <div className="relative">
                <Search className="absolute top-3 left-2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Search symbol or name..."
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

            <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="font-medium">Score</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <input
                className="w-16 bg-transparent outline-none placeholder:text-muted-foreground md:w-20"
                placeholder="Min"
                type="number"
                step="10"
                min="0"
                max="100"
                value={minScoreInput}
                onChange={(e) => setMinScoreInput(e.target.value)}
                onBlur={handleScoreUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()}
              />
              <span className="mx-1 text-muted-foreground">-</span>
              <input
                className="w-16 bg-transparent text-right outline-none placeholder:text-muted-foreground md:w-20"
                placeholder="Max"
                type="number"
                step="10"
                min="0"
                max="100"
                value={maxScoreInput}
                onChange={(e) => setMaxScoreInput(e.target.value)}
                onBlur={handleScoreUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()}
              />
            </div>

            <div className="w-full space-y-2 md:w-60">
              <FilterMultiSelect
                title="Signals"
                options={[
                  { label: "Breakout", value: "Breakout" },
                  { label: "Spike", value: "Spike" },
                ]}
                selected={signals}
                onChange={(val) => setSignals(val)}
              />
            </div>

            <div className="w-full space-y-2 md:w-60">
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

            <div className="w-full space-y-2 md:w-60">
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
            </div>

            <div className="w-full space-y-2 md:w-60">
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

            <div className="flex h-10 items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="mr-1 font-medium">Acc/Dist</span>
              <Select
                value={accDistOperator}
                onValueChange={(val) => setAccDistOperator(val as "gt" | "lt")}
              >
                <SelectTrigger className="h-6 w-13.75 border-none px-1 text-xs focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gt">&gt;</SelectItem>
                  <SelectItem value="lt">&lt;</SelectItem>
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <div className="flex gap-2">
                <input
                  className="w-8 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                  placeholder="1D"
                  type="number"
                  value={accDist1D}
                  onChange={(e) => setAccDist1D(e.target.value)}
                />
                <input
                  className="w-8 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                  placeholder="1W"
                  type="number"
                  value={accDist1W}
                  onChange={(e) => setAccDist1W(e.target.value)}
                />
                <input
                  className="w-8 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                  placeholder="1M"
                  type="number"
                  value={accDist1M}
                  onChange={(e) => setAccDist1M(e.target.value)}
                />
              </div>
            </div>

            <div className="flex h-10 items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="mr-1 font-medium whitespace-nowrap">Broker Net</span>
              <Select
                value={netBrokerFlowOperator}
                onValueChange={(val) => setNetBrokerFlowOperator(val as "gt" | "lt")}
              >
                <SelectTrigger className="h-6 w-13.75 border-none px-1 text-xs focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gt">&gt;</SelectItem>
                  <SelectItem value="lt">&lt;</SelectItem>
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <input
                className="w-20 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                placeholder="0"
                type="number"
                value={netBrokerFlowValue}
                onChange={(e) => setNetBrokerFlowValue(e.target.value)}
              />
            </div>

            <div className="w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-start text-left font-normal md:w-44",
                      !date && "text-muted-foreground"
                    )}
                    disabled={isLoadingDates}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(parseISO(date), "dd MMM yyyy") : "Latest"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ? parseISO(date) : undefined}
                    onSelect={(d) => {
                      if (!d) {
                        setDate(null)
                        return
                      }
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => { setDate(null); setPage(1) }}
                      >
                        Reset to Latest
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleResetFilters}
              className="h-10 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-500/80"
              variant="ghost"
              title="Reset all filters"
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              onClick={() => handleRefreshAllTickers()}
              disabled={isRefreshing}
              className="h-10 cursor-pointer"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
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
                Volume
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
                  <div className="flex flex-col gap-0.5 text-xs">
                    <div className="flex gap-1">
                      <span className="w-5 text-muted-foreground">1D:</span>
                      <span
                        className={cn(
                          "font-medium",
                          ticker.accumulationDistribution.d1 > 0
                            ? "text-green-600"
                            : ticker.accumulationDistribution.d1 < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {ticker.accumulationDistribution.d1 > 0 ? "+" : ""}
                        {ticker.accumulationDistribution.d1.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-5 text-muted-foreground">1W:</span>
                      <span
                        className={cn(
                          "font-medium",
                          ticker.accumulationDistribution.w1 > 0
                            ? "text-green-600"
                            : ticker.accumulationDistribution.w1 < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {ticker.accumulationDistribution.w1 > 0 ? "+" : ""}
                        {ticker.accumulationDistribution.w1.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-5 text-muted-foreground">1M:</span>
                      <span
                        className={cn(
                          "font-medium",
                          ticker.accumulationDistribution.m1 > 0
                            ? "text-green-600"
                            : ticker.accumulationDistribution.m1 < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {ticker.accumulationDistribution.m1 > 0 ? "+" : ""}
                        {ticker.accumulationDistribution.m1.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      ticker.bandarStatus === "Accumulation" &&
                        "bg-green-100 text-green-800 hover:bg-green-100",
                      ticker.bandarStatus === "Distribution" &&
                        "bg-red-100 text-red-800 hover:bg-red-100",
                      ticker.bandarStatus === "Neutral" &&
                        "bg-gray-100 text-gray-800 hover:bg-gray-100"
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
                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-green-800">
                        {ticker.topBuyers?.length > 0
                          ? ticker.topBuyers.map((b) => b.code).join(", ")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-red-800">
                        {ticker.topSellers?.length > 0
                          ? ticker.topSellers.map((b) => b.code).join(", ")
                          : "-"}
                      </span>
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
                    <Badge variant="default">{ticker.sector}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <SimulateBuyButton ticker={ticker} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
