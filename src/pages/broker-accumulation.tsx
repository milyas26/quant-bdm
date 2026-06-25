import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { searchBrokerAccumulation, getBrokers, getWatchlists } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn, formatNumber, getBrokerCodeClass } from "@/lib/utils"
import { StatusBadge } from "@/components/indicators"
import { BrokerMultiSelect } from "@/components/broker-multi-select"
import type { BrokerOption } from "@/components/broker-multi-select"
import { MultiSelect } from "@/components/multi-select"
import type { MultiSelectOption } from "@/components/multi-select"
import { FilterMultiSelect } from "@/components/filter-multi-select"
import { useBrokerAccumulationStore } from "@/stores/brokerAccumulationStore"
import { useMemo, useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Search,
} from "lucide-react"
import { Pagination } from "@/components/pagination"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, parseISO, addDays, subDays } from "date-fns"
import type { BrokerAccumulationSearchResult } from "@/lib/apis/broker-summary/broker-summary-api"

const DATE_PRESETS = [
  { label: "3D", value: "3d" },
  { label: "1W", value: "1w" },
  { label: "2W", value: "2w" },
] as const

export default function BrokerAccumulationPage() {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const {
    brokerCodes,
    watchlistIds,
    preset,
    cutoffDate,
    from,
    to,
    page,
    limit,
    minPrice,
    maxPrice,
    signals,
    bandarStatus,
    momentum,
    liquidity,
    setBrokerCodes,
    setWatchlistIds,
    setPreset,
    setCutoffDate,
    setPage,
    setLimit,
    setMinPrice,
    setMaxPrice,
    setSignals,
    setBandarStatus,
    setMomentum,
    setLiquidity,
  } = useBrokerAccumulationStore()

  const [symbolSearch, setSymbolSearch] = useState("")
  const debouncedSymbol = useDebounce(symbolSearch, 500)
  const [minPriceInput, setMinPriceInput] = useState(minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice)

  const { data: brokerGroup } = useQuery({
    queryKey: ["brokers"],
    queryFn: getBrokers,
    staleTime: 10 * 60 * 1000,
  })
  const { data: watchlists } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
    staleTime: 10 * 60 * 1000,
  })

  const brokerOptions = useMemo((): Record<string, BrokerOption[]> => {
    if (!brokerGroup) return {}
    const result: Record<string, BrokerOption[]> = {}
    for (const [type, brokers] of Object.entries(brokerGroup)) {
      result[type] = brokers.map((b) => ({
        value: b.code,
        label: b.code,
        name: b.name,
        type: b.type,
      }))
    }
    return result
  }, [brokerGroup])

  const watchlistOptions = useMemo((): MultiSelectOption[] => {
    if (!watchlists) return []
    return watchlists.map((w) => ({
      value: String(w.id),
      label: w.name,
      description: `${w._count.tickers} saham`,
    }))
  }, [watchlists])

  const selectedWatchlistIds = useMemo(
    () => watchlistIds.map(String),
    [watchlistIds]
  )

  const { data, isLoading } = useQuery({
    queryKey: [
      "broker-accumulation-search",
      brokerCodes,
      from,
      to,
      debouncedSymbol,
      cutoffDate,
      watchlistIds,
    ],
    queryFn: () =>
      searchBrokerAccumulation(
        brokerCodes,
        from,
        to,
        debouncedSymbol || undefined,
        cutoffDate,
        watchlistIds.length > 0 ? watchlistIds : undefined
      ),
    enabled: !!from && !!to,
  })

  const filteredData = useMemo(() => {
    if (!data?.data) return []
    return data.data.filter((item: BrokerAccumulationSearchResult) => {
      const s = item.screener
      if (!s) return true
      if (minPrice && s.price < parseInt(minPrice)) return false
      if (maxPrice && s.price > parseInt(maxPrice)) return false
      if (signals.length > 0) {
        const hasBreakout = signals.includes("Breakout") && s.isBreakout
        const hasSpike = signals.includes("Spike") && s.isVolumeSpike
        if (!hasBreakout && !hasSpike) return false
      }
      if (bandarStatus.length > 0 && !bandarStatus.includes(s.bandarStatus))
        return false
      if (momentum.length > 0 && !momentum.includes(s.momentum)) return false
      if (liquidity.length > 0 && !liquidity.includes(s.liquidityScore))
        return false
      return true
    })
  }, [
    data,
    minPrice,
    maxPrice,
    signals,
    bandarStatus,
    momentum,
    liquidity,
  ])

  const hasActiveFilters = !!(
    minPrice ||
    maxPrice ||
    signals.length ||
    bandarStatus.length ||
    momentum.length ||
    liquidity.length
  )
  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const paginatedData = useMemo(
    () => filteredData.slice((page - 1) * limit, (page - 1) * limit + limit),
    [filteredData, page, limit]
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])

  const handlePriceUpdate = () => {
    setMinPrice(minPriceInput)
    setMaxPrice(maxPriceInput)
  }
  const handleStepDate = (direction: 1 | -1) => {
    const current = parseISO(cutoffDate)
    const next = direction === 1 ? addDays(current, 1) : subDays(current, 1)
    setCutoffDate(format(next, "yyyy-MM-dd"))
  }
  const handleResetFilters = () => {
    setMinPriceInput("")
    setMaxPriceInput("")
    setMinPrice("")
    setMaxPrice("")
    setSignals([])
    setBandarStatus([])
    setMomentum([])
    setLiquidity([])
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-mono text-lg font-bold tracking-tight">
          Broker Accumulation
        </h1>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Cari saham yang diakumulasi broker tertentu dalam rentang waktu yang
          dipilih.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search symbol..."
            className="h-9 border-border bg-transparent pl-8 font-mono text-sm placeholder:text-muted-foreground/40"
            value={symbolSearch}
            onChange={(e) => {
              setSymbolSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="max-w-56 min-w-44 flex-1">
          <MultiSelect
            options={watchlistOptions}
            selected={selectedWatchlistIds}
            onChange={(ids) =>
              setWatchlistIds(ids.map((id) => parseInt(id, 10)))
            }
            placeholder="Watchlist..."
            searchPlaceholder="Cari..."
          />
        </div>
        <div className="max-w-xs min-w-56 flex-1">
          <BrokerMultiSelect
            options={brokerOptions}
            selected={brokerCodes}
            onChange={setBrokerCodes}
            placeholder="Pilih broker..."
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-8 shrink-0 rounded-sm"
            onClick={() => handleStepDate(-1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 w-28 justify-start rounded-sm px-2 text-left font-mono text-[11px]",
                  cutoffDate === format(new Date(), "yyyy-MM-dd") &&
                    "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(parseISO(cutoffDate), "dd MMM yy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseISO(cutoffDate)}
                onSelect={(d) => {
                  if (d) setCutoffDate(format(d, "yyyy-MM-dd"))
                }}
                initialFocus
              />
              {cutoffDate !== format(new Date(), "yyyy-MM-dd") && (
                <div className="border-t border-border p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full rounded-sm font-mono text-[11px]"
                    onClick={() =>
                      setCutoffDate(format(new Date(), "yyyy-MM-dd"))
                    }
                  >
                    Reset to Today
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-8 shrink-0 rounded-sm"
            onClick={() => handleStepDate(1)}
            disabled={cutoffDate >= format(new Date(), "yyyy-MM-dd")}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          {DATE_PRESETS.map((p) => (
            <Button
              key={p.value}
              variant={preset === p.value ? "default" : "outline"}
              size="sm"
              className="h-9 rounded-sm font-mono text-[11px]"
              onClick={() => setPreset(p.value)}
            >
              {p.label}
            </Button>
          ))}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="h-9 rounded-sm font-mono text-[11px]"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-4 rounded-sm px-1 font-mono text-[9px]"
              >
                ON
              </Badge>
            )}
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
              <div className="flex h-9 items-center gap-1 rounded-sm border border-border bg-transparent px-2 font-mono text-xs">
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
            <div className="flex flex-col justify-end">
              <Button
                onClick={handleResetFilters}
                size="sm"
                variant="ghost"
                className="h-7 rounded-sm px-2 font-mono text-[10px] text-destructive hover:bg-destructive/10"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-8 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Ticker
              </TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Price
              </TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Net Value
              </TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Net Lot
              </TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Brokers
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!paginatedData.length ? (
              <TableRow className="border-border">
                <TableCell
                  colSpan={6}
                  className="h-24 text-center font-mono text-sm text-muted-foreground"
                >
                  {isLoading ? "Loading..." : "No results"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={item.symbol}
                  className="cursor-pointer border-border hover:bg-accent/50"
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      {item.logo && (
                        <img
                          src={item.logo}
                          alt={item.symbol}
                          className="h-7 w-7 rounded-full border border-border object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[13px] font-bold">
                            {item.symbol}
                          </span>
                          {item.screener?.isBreakout && (
                            <span className="text-positive rounded-sm bg-emerald-400/10 px-1 font-mono text-[9px]">
                              BO
                            </span>
                          )}
                          {item.screener?.isVolumeSpike && (
                            <span className="text-warning rounded-sm bg-amber-400/10 px-1 font-mono text-[9px]">
                              Spike
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {item.name || "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {item.screener ? (
                      <div>
                        <span className="font-mono text-[13px] font-bold">
                          {item.screener.price.toLocaleString()}
                        </span>
                        <span
                          className={cn(
                            "ml-1.5 font-mono text-[11px] font-medium",
                            item.screener.changePercentage > 0
                              ? "text-positive"
                              : item.screener.changePercentage < 0
                                ? "text-negative"
                                : "text-muted-foreground"
                          )}
                        >
                          {item.screener.changePercentage > 0 ? "+" : ""}
                          {item.screener.changePercentage.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-positive font-mono text-[12px] font-semibold">
                      +{formatNumber(item.totalNetVal)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="font-mono text-[12px]">
                      {formatNumber(item.totalNetLot)} lot
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    {item.screener ? (
                      <div className="flex flex-col gap-0.5">
                        <div>
                          <StatusBadge status={item.screener.bandarStatus} />
                        </div>
                        <span
                          className={cn(
                            "font-mono text-[9px]",
                            item.screener.momentum === "Uptrend" &&
                              "text-positive",
                            item.screener.momentum === "Downtrend" &&
                              "text-negative",
                            !item.screener.momentum ||
                              item.screener.momentum === "Sideways"
                              ? "text-muted-foreground"
                              : ""
                          )}
                        >
                          {item.screener.momentum || "-"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {item.brokers.map((b) => (
                        <div
                          key={b.brokerCode}
                          className={cn(
                            "flex items-center gap-1 rounded-sm bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]",
                            getBrokerCodeClass(b.brokerCode)
                          )}
                        >
                          <span className="font-bold">{b.brokerCode}</span>
                          <span className="text-muted-foreground">
                            {formatNumber(b.netVal)} · {b.daysActive}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        totalItems={totalItems}
        currentItems={paginatedData.length}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  )
}
