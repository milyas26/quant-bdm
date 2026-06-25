import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  getScreener,
  getScreenerDates,
  refreshAllTickers,
  getWatchlists,
  refreshAllProfiles,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SlidersHorizontal,
  Building2,
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { cn, getBrokerCodeClass } from "@/lib/utils"
import { StatusBadge } from "@/components/indicators"
import { toast } from "sonner"
import { FilterMultiSelect } from "@/components/filter-multi-select"
import { MultiSelect } from "@/components/multi-select"
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
import { Pagination } from "@/components/pagination"
import { Bookmark } from "lucide-react"

const formatNumber = (num: number) => {
  if (Math.abs(num) >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1) + "B"
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(1) + "K"
  return num.toString()
}

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: string
  sortBy: string
  sortOrder: string
}) {
  if (sortBy === column) {
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )
  }
  return <ArrowUpDown className="h-3 w-3 opacity-20" />
}

export default function StocksPage() {
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [watchlistDialogSymbol, setWatchlistDialogSymbol] = useState<
    string | null
  >(null)

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
    date,
    accDistOperator,
    accDist1D,
    accDist1W,
    accDist1M,
    netBrokerFlowOperator,
    netBrokerFlowValue,
    setPage,
    setLimit,
    setSearch,
    setWatchlistId,
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
    setNetBrokerFlowOperator,
    setNetBrokerFlowValue,
    liquidity,
    setLiquidity,
    reset,
  } = useStocksFilterStore()

  const [searchTerm, setSearchTerm] = useState(search)
  const [minPriceInput, setMinPriceInput] = useState(minPriceStr)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceStr)
  const [showFilters, setShowFilters] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)
  const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined
  const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch)
  }, [debouncedSearch])

  const handleSort = (column: string) => {
    if (sortBy === column) setSort(column, sortOrder === "asc" ? "desc" : "asc")
    else setSort(column, "desc")
  }

  const handlePriceUpdate = () => {
    setMinPrice(minPriceInput)
    setMaxPrice(maxPriceInput)
    setPage(1)
  }
  const handleResetFilters = () => {
    setSearchTerm("")
    setMinPriceInput("")
    setMaxPriceInput("")
    reset()
  }

  const handleApplyPerfectSetup = (withBreakout = false) => {
    reset()
    setSearchTerm("")
    setMinPriceInput("")
    setMaxPriceInput("")
    setNetBrokerFlowValue("0")
    setAccDist1D("-1")
    setAccDist1W("-1")
    setAccDist1M("-1")
    setBandarStatus(["Accumulation"])
    setWatchlistId(watchlistId)
    if (withBreakout) setSignals(["Breakout"])
  }

  const { data: screenerDates } = useQuery({
    queryKey: ["screener-dates"],
    queryFn: getScreenerDates,
    staleTime: 5 * 60 * 1000,
  })

  const { data: watchlists } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
    staleTime: 10 * 60 * 1000,
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "tickers",
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
      date,
      accDistOperator,
      accDist1D,
      accDist1W,
      accDist1M,
      netBrokerFlowOperator,
      netBrokerFlowValue,
      liquidity,
    ],
    queryFn: () =>
      getScreener({
        page,
        limit,
        search: debouncedSearch,
        watchlistId: watchlistId ?? undefined,
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
        netBrokerFlowOperator,
        netBrokerFlowValue: netBrokerFlowValue
          ? parseFloat(netBrokerFlowValue)
          : undefined,
        liquidity,
      }),
  })

  const { mutate: handleRefreshAllTickers, isPending: isRefreshing } =
    useMutation({
      mutationFn: refreshAllTickers,
      onSuccess: () =>
        toast.success("Refreshing all tickers data in background started."),
      onError: (error) =>
        toast.error(`Failed to start refreshing: ${(error as Error).message}`),
    })

  const { mutate: handleRefreshAllProfiles, isPending: isFetchingProfiles } =
    useMutation({
      mutationFn: refreshAllProfiles,
      onSuccess: () =>
        toast.success("Started fetching all stock profiles in background."),
      onError: (error) =>
        toast.error(`Failed to start profile fetch: ${(error as Error).message}`),
    })

  const changeColor = (v: number) =>
    v > 0 ? "text-positive" : v < 0 ? "text-negative" : "text-muted-foreground"

  return (
    <div className="space-y-3">
      <AddToWatchlistDialog
        symbol={watchlistDialogSymbol}
        onClose={() => setWatchlistDialogSymbol(null)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search symbol or name..."
            className="h-9 border-border bg-transparent pl-8 font-mono text-sm placeholder:text-muted-foreground/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-w-56 min-w-40 flex-1">
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
            placeholder="Watchlist..."
            searchPlaceholder="Cari watchlist..."
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="h-9 font-mono text-[12px] font-medium tracking-tight"
            onClick={() => handleApplyPerfectSetup(false)}
          >
            <Bookmark className="mr-1 h-3 w-3" />
            Perfect Setup
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 font-mono text-[12px] font-medium tracking-tight"
            onClick={() => handleApplyPerfectSetup(true)}
          >
            + Breakout
          </Button>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9 font-mono text-[12px]"
          >
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
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
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setProfileDialogOpen(true)}
            disabled={isFetchingProfiles}
            className="h-9 w-9 shrink-0"
            title="Get All Profiles"
          >
            <Building2
              className={cn("h-3.5 w-3.5", isFetchingProfiles && "animate-pulse")}
            />
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-border bg-card/50">
          <CardContent className="grid animate-in grid-cols-1 gap-3 p-3 duration-150 fade-in slide-in-from-top-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                Price
              </span>
              <div className="flex h-8 items-center gap-1 rounded-sm border border-border bg-transparent px-2 font-mono text-xs">
                <span className="font-medium text-muted-foreground">Price</span>
                <span className="text-border">|</span>
                <input
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground/30"
                  placeholder="Min"
                  type="number"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={handlePriceUpdate}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
                />
                <span className="text-muted-foreground">-</span>
                <input
                  className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/30"
                  placeholder="Max"
                  type="number"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onBlur={handlePriceUpdate}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                Signals & Status
              </span>
              <FilterMultiSelect
                title="Signals"
                options={[
                  { label: "Breakout", value: "Breakout" },
                  { label: "Spike", value: "Spike" },
                ]}
                selected={signals}
                onChange={setSignals}
              />
              <FilterMultiSelect
                title="Status"
                options={[
                  { label: "Accumulation", value: "Accumulation" },
                  { label: "Neutral", value: "Neutral" },
                  { label: "Distribution", value: "Distribution" },
                ]}
                selected={bandarStatus}
                onChange={setBandarStatus}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
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
                onChange={setMomentum}
              />
              <FilterMultiSelect
                title="Liquidity"
                options={[
                  { label: "High", value: "High" },
                  { label: "Medium", value: "Medium" },
                  { label: "Low", value: "Low" },
                ]}
                selected={liquidity}
                onChange={setLiquidity}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                Flow & Date
              </span>
              <div className="flex h-8 items-center gap-1 rounded-sm border border-border bg-transparent px-2 font-mono text-xs">
                <Select
                  value={accDistOperator}
                  onValueChange={(val) =>
                    setAccDistOperator(val as "gt" | "lt")
                  }
                >
                  <SelectTrigger className="h-auto w-9 border-none bg-transparent px-0 py-0 text-[10px] focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">&gt;</SelectItem>
                    <SelectItem value="lt">&lt;</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">AD</span>
                <input
                  className="w-full bg-transparent text-center outline-none"
                  placeholder="1D"
                  type="number"
                  value={accDist1D}
                  onChange={(e) => setAccDist1D(e.target.value)}
                />
                <input
                  className="w-full bg-transparent text-center outline-none"
                  placeholder="1W"
                  type="number"
                  value={accDist1W}
                  onChange={(e) => setAccDist1W(e.target.value)}
                />
                <input
                  className="w-full bg-transparent text-center outline-none"
                  placeholder="1M"
                  type="number"
                  value={accDist1M}
                  onChange={(e) => setAccDist1M(e.target.value)}
                />
              </div>
              <div className="flex h-8 items-center gap-1 rounded-sm border border-border bg-transparent px-2 font-mono text-xs">
                <Select
                  value={netBrokerFlowOperator}
                  onValueChange={(val) =>
                    setNetBrokerFlowOperator(val as "gt" | "lt")
                  }
                >
                  <SelectTrigger className="h-auto w-9 border-none bg-transparent px-0 py-0 text-[10px] focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">&gt;</SelectItem>
                    <SelectItem value="lt">&lt;</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">Net</span>
                <input
                  className="w-full bg-transparent text-right outline-none"
                  placeholder="0"
                  type="number"
                  value={netBrokerFlowValue}
                  onChange={(e) => setNetBrokerFlowValue(e.target.value)}
                />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-7 flex-1 justify-start rounded-sm px-2 text-left font-mono text-[11px]",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {date ? format(parseISO(date), "dd MMM yy") : "Latest"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
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
                      <div className="border-t border-border p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-full text-xs"
                          onClick={() => {
                            setDate(null)
                            setPage(1)
                          }}
                        >
                          Reset Date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handleResetFilters}
                  size="sm"
                  variant="ghost"
                  className="h-7 shrink-0 px-2 text-xs text-destructive hover:bg-destructive/10"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden rounded-sm border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center gap-1">
                    Ticker{" "}
                    <SortIcon
                      column="symbol"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center gap-1">
                    Price{" "}
                    <SortIcon
                      column="price"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("volume")}
                >
                  <div className="flex items-center gap-1">
                    Vol/Val{" "}
                    <SortIcon
                      column="volume"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("netBrokerFlow")}
                >
                  <div className="flex items-center gap-1">
                    B. Net{" "}
                    <SortIcon
                      column="netBrokerFlow"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("accumulationDistribution1D")}
                >
                  <div className="flex items-center gap-1">
                    Acc/Dist%{" "}
                    <SortIcon
                      column="accumulationDistribution1D"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("bandarStatus")}
                >
                  <div className="flex items-center gap-1">
                    Status{" "}
                    <SortIcon
                      column="bandarStatus"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("momentum")}
                >
                  <div className="flex items-center gap-1">
                    Mom{" "}
                    <SortIcon
                      column="momentum"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-8 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Top Brokers
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("liquidityScore")}
                >
                  <div className="flex items-center gap-1">
                    Liq{" "}
                    <SortIcon
                      column="liquidityScore"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="h-8 cursor-pointer font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                  onClick={() => handleSort("sector")}
                >
                  <div className="flex items-center gap-1">
                    Sector{" "}
                    <SortIcon
                      column="sector"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-8 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-32 text-center font-mono text-sm text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-32 text-center font-mono text-sm text-destructive"
                  >
                    {(error as Error).message}
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-32 text-center font-mono text-sm text-muted-foreground"
                  >
                    No results
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((ticker) => (
                  <TableRow
                    key={ticker.symbol}
                    className="cursor-pointer border-border transition-colors hover:bg-accent/50"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey)
                        window.open(`/stock/${ticker.symbol}`, "_blank")
                      else navigate(`/stock/${ticker.symbol}`)
                    }}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setWatchlistDialogSymbol(ticker.symbol)
                          }}
                        >
                          <Bookmark
                            className={cn(
                              "h-3.5 w-3.5",
                              ticker.isOnWatchlist
                                ? "fill-[#c8a951] text-[#c8a951]"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </Button>
                        {ticker.logo && (
                          <img
                            src={ticker.logo}
                            alt={ticker.symbol}
                            className="h-7 w-7 rounded-full border border-border object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[13px] font-bold text-foreground">
                              {ticker.symbol}
                            </span>
                            {ticker.isBreakout && (
                              <span className="text-positive bg-positive rounded-sm px-1 py-px font-mono text-[10px]">
                                BO
                              </span>
                            )}
                          </div>
                          <span className="line-clamp-1 max-w-40 text-[10px] text-muted-foreground">
                            {ticker.name || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div>
                        <span className="font-mono text-[13px] font-bold">
                          {ticker.price.toLocaleString()}
                        </span>
                        <span
                          className={cn(
                            "ml-1.5 font-mono text-[11px]",
                            changeColor(ticker.changePercentage)
                          )}
                        >
                          {ticker.changePercentage > 0 ? "+" : ""}
                          {ticker.changePercentage.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div>
                        <span className="font-mono text-[12px]">
                          {formatNumber(ticker.volume)}
                        </span>
                        <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                          Rp{" "}
                          {formatNumber(Number(ticker.transactionValue || 0))}
                        </span>
                        {ticker.isVolumeSpike && (
                          <span className="text-warning bg-warning ml-1 rounded-sm px-1 py-px font-mono text-[10px]">
                            Spike
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span
                        className={cn(
                          "font-mono text-[13px] font-semibold tracking-tight",
                          changeColor(ticker.netBrokerFlow)
                        )}
                      >
                        {ticker.netBrokerFlow > 0 ? "+" : ""}
                        {formatNumber(ticker.netBrokerFlow)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col gap-0.5 font-mono text-[10px]">
                        {[
                          { k: "1d", v: ticker.accumulationDistribution.d1 },
                          { k: "1w", v: ticker.accumulationDistribution.w1 },
                          { k: "1m", v: ticker.accumulationDistribution.m1 },
                        ].map(({ k, v }) => (
                          <div
                            key={k}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-muted-foreground">{k}</span>
                            <span
                              className={cn(
                                "font-medium tracking-tight",
                                v > 0
                                  ? "text-positive"
                                  : v < 0
                                    ? "text-negative"
                                    : "text-muted-foreground"
                              )}
                            >
                              {v > 0 ? "+" : ""}
                              {v.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <StatusBadge status={ticker.bandarStatus} />
                    </TableCell>
                    <TableCell className="py-2">
                      <span
                        className={cn(
                          "font-mono text-[11px] font-medium",
                          ticker.momentum === "Uptrend" && "text-positive",
                          ticker.momentum === "Downtrend" && "text-negative"
                        )}
                      >
                        {ticker.momentum}
                      </span>
                    </TableCell>
                    <TableCell
                      className="py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col gap-1 font-mono text-[10px]">
                        <div className="flex max-w-36 flex-wrap items-center gap-1">
                          {ticker.topBuyers?.length > 0 ? (
                            ticker.topBuyers.map((b: any, idx: number) => (
                              <span
                                key={b.code || String(idx)}
                                className={cn(
                                  "rounded-sm bg-muted/50 px-1 py-0.5 font-medium whitespace-nowrap",
                                  getBrokerCodeClass(b.code)
                                )}
                              >
                                {b.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <div className="flex max-w-36 flex-wrap items-center gap-1">
                          {ticker.topSellers?.length > 0 ? (
                            ticker.topSellers.map((b: any, idx: number) => (
                              <span
                                key={b.code || String(idx)}
                                className={cn(
                                  "rounded-sm bg-muted/50 px-1 py-0.5 font-medium whitespace-nowrap",
                                  getBrokerCodeClass(b.code)
                                )}
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
                    <TableCell className="py-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-sm border-border font-mono text-[10px]",
                          ticker.liquidityScore === "High" &&
                            "border-blue-400/20 bg-blue-400/10 text-blue-400",
                          ticker.liquidityScore === "Medium" &&
                            "text-warning bg-warning border-amber-400/20",
                          ticker.liquidityScore === "Low" &&
                            "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {ticker.liquidityScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      {ticker.sector ? (
                        <span className="line-clamp-2 font-mono text-[10px] leading-tight text-muted-foreground">
                          {ticker.sector}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SimulateBuyButton ticker={ticker} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={data?.meta.totalPages || 1}
        limit={limit}
        totalItems={data?.meta.total || 0}
        currentItems={data?.data.length || 0}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(val) => {
          setLimit(val)
          setPage(1)
        }}
      />

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get All Stock Profiles</DialogTitle>
            <DialogDescription>
              This will fetch company profiles for all tickers from Stockbit. The
              process runs in background and may take up to 30 minutes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfileDialogOpen(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setProfileDialogOpen(false)
                handleRefreshAllProfiles()
              }}
              className="rounded-sm"
            >
              Start Fetch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
