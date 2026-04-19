import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { searchBrokerAccumulation, getBrokers } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { BrokerMultiSelect } from "@/components/broker-multi-select"
import type { BrokerOption } from "@/components/broker-multi-select"
import { FilterMultiSelect } from "@/components/filter-multi-select"
import { useBrokerAccumulationStore } from "@/stores/brokerAccumulationStore"
import { useMemo, useState, useEffect } from "react"
import {
  SlidersHorizontal, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BrokerAccumulationSearchResult } from "@/lib/apis/broker-summary/broker-summary-api"

const DATE_PRESETS = [
  { label: "3 Days", value: "3d" },
  { label: "1 Week", value: "1w" },
  { label: "2 Weeks", value: "2w" },
] as const

export default function BrokerAccumulationPage() {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const {
    brokerCodes,
    preset,
    from,
    to,
    page,
    limit,
    minPrice,
    maxPrice,
    minScore,
    maxScore,
    signals,
    bandarStatus,
    momentum,
    liquidity,
    setBrokerCodes,
    setPreset,
    setPage,
    setLimit,
    setMinPrice,
    setMaxPrice,
    setMinScore,
    setMaxScore,
    setSignals,
    setBandarStatus,
    setMomentum,
    setLiquidity,
  } = useBrokerAccumulationStore()

  const [pageInput, setPageInput] = useState(page.toString())

  const [minPriceInput, setMinPriceInput] = useState(minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice)
  const [minScoreInput, setMinScoreInput] = useState(minScore)
  const [maxScoreInput, setMaxScoreInput] = useState(maxScore)

  const { data: brokerGroup } = useQuery({
    queryKey: ["brokers"],
    queryFn: getBrokers,
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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["broker-accumulation-search", brokerCodes, from, to],
    queryFn: () => searchBrokerAccumulation(brokerCodes, from, to),
    enabled: !!from && !!to,
  })

  const filteredData = useMemo(() => {
    if (!data?.data) return []
    return data.data.filter((item: BrokerAccumulationSearchResult) => {
      const s = item.screener
      if (!s) return true
      if (minPrice && s.price < parseInt(minPrice)) return false
      if (maxPrice && s.price > parseInt(maxPrice)) return false
      if (minScore && s.smartMoneyScore < parseInt(minScore)) return false
      if (maxScore && s.smartMoneyScore > parseInt(maxScore)) return false
      if (signals.length > 0) {
        const hasBreakout = signals.includes("Breakout") && s.isBreakout
        const hasSpike = signals.includes("Spike") && s.isVolumeSpike
        if (!hasBreakout && !hasSpike) return false
      }
      if (bandarStatus.length > 0 && !bandarStatus.includes(s.bandarStatus)) return false
      if (momentum.length > 0 && !momentum.includes(s.momentum)) return false
      if (liquidity.length > 0 && !liquidity.includes(s.liquidityScore)) return false
      return true
    })
  }, [data, minPrice, maxPrice, minScore, maxScore, signals, bandarStatus, momentum, liquidity])

  const hasActiveFilters = !!(minPrice || maxPrice || minScore || maxScore || signals.length || bandarStatus.length || momentum.length || liquidity.length)

  // Pagination
  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit
    return filteredData.slice(start, start + limit)
  }, [filteredData, page, limit])

  // Reset page when filters change
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])

  useEffect(() => {
    setPageInput(page.toString())
  }, [page])

  const handlePriceUpdate = () => { setMinPrice(minPriceInput); setMaxPrice(maxPriceInput) }
  const handleScoreUpdate = () => { setMinScore(minScoreInput); setMaxScore(maxScoreInput) }
  const handleResetFilters = () => {
    setMinPriceInput(""); setMaxPriceInput(""); setMinScoreInput(""); setMaxScoreInput("")
    setMinPrice(""); setMaxPrice(""); setMinScore(""); setMaxScore("")
    setSignals([]); setBandarStatus([]); setMomentum([]); setLiquidity([])
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Broker Accumulation Search</h1>
      <p className="text-sm text-muted-foreground">
        Cari saham yang sedang diakumulasi oleh broker tertentu dalam rentang waktu yang dipilih.
        Jika tidak memilih broker, akan menampilkan saham yang diakumulasi oleh broker yang sama secara berturut-turut.
      </p>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-64 flex-1">
              <BrokerMultiSelect
                options={brokerOptions}
                selected={brokerCodes}
                onChange={setBrokerCodes}
                placeholder="Pilih broker..."
              />
            </div>
            <div className="flex items-center gap-1">
              {DATE_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  variant={preset === p.value ? "default" : "outline"}
                  size="sm"
                  className="h-10"
                  onClick={() => setPreset(p.value)}
                >
                  {p.label}
                </Button>
              ))}
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="h-10"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">ON</Badge>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price & Score</span>
                <div className="flex h-9 items-center rounded-md border bg-background px-2.5 text-xs">
                  <span className="font-medium text-muted-foreground">Price</span>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50" placeholder="Min" type="number" value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)} onBlur={handlePriceUpdate} onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()} />
                  <span className="text-muted-foreground">-</span>
                  <input className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/50" placeholder="Max" type="number" value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)} onBlur={handlePriceUpdate} onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()} />
                </div>
                <div className="flex h-9 items-center rounded-md border bg-background px-2.5 text-xs">
                  <span className="font-medium text-muted-foreground">Score</span>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50" placeholder="Min" type="number" min="0" max="100" value={minScoreInput}
                    onChange={(e) => setMinScoreInput(e.target.value)} onBlur={handleScoreUpdate} onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()} />
                  <span className="text-muted-foreground">-</span>
                  <input className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/50" placeholder="Max" type="number" min="0" max="100" value={maxScoreInput}
                    onChange={(e) => setMaxScoreInput(e.target.value)} onBlur={handleScoreUpdate} onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signals & Status</span>
                <FilterMultiSelect title="Signals" options={[{ label: "Breakout", value: "Breakout" }, { label: "Spike", value: "Spike" }]} selected={signals} onChange={setSignals} />
                <FilterMultiSelect title="Status" options={[{ label: "Accumulation", value: "Accumulation" }, { label: "Neutral", value: "Neutral" }, { label: "Distribution", value: "Distribution" }]} selected={bandarStatus} onChange={setBandarStatus} />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Momentum & Liquidity</span>
                <FilterMultiSelect title="Momentum" options={[{ label: "Uptrend", value: "Uptrend" }, { label: "Sideways", value: "Sideways" }, { label: "Downtrend", value: "Downtrend" }]} selected={momentum} onChange={setMomentum} />
                <FilterMultiSelect title="Liquidity" options={[{ label: "High", value: "High" }, { label: "Medium", value: "Medium" }, { label: "Low", value: "Low" }]} selected={liquidity} onChange={setLiquidity} />
              </div>

              <div className="flex flex-col justify-end">
                <Button onClick={handleResetFilters} size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs">
                  <X className="mr-1 h-3 w-3" /> Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              Hasil
              {data && (
                <Badge variant="outline">
                  {filteredData.length}
                  {hasActiveFilters && data.meta.totalStocks !== filteredData.length
                    ? ` / ${data.meta.totalStocks}`
                    : ""} saham
                </Badge>
              )}
              {(isLoading || isFetching) && (
                <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Net Value</TableHead>
                  <TableHead>Net Lot</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Brokers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!paginatedData.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {isLoading ? "Loading..." : "Tidak ada saham yang diakumulasi broker tersebut."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.symbol}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/stock/${item.symbol}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.logo && (
                            <img
                              src={item.logo}
                              alt={item.symbol}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-sm font-bold">
                              {item.symbol}
                              {item.screener?.isBreakout && (
                                <span className="text-[11px] text-orange-500">⚡</span>
                              )}
                              {item.screener?.isVolumeSpike && (
                                <span className="text-[11px] text-orange-500">🔥</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-36">
                              {item.name || "-"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.screener ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">
                              {item.screener.price.toLocaleString()}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                item.screener.changePercentage > 0
                                  ? "text-green-600"
                                  : item.screener.changePercentage < 0
                                    ? "text-red-600"
                                    : "text-gray-600",
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
                      <TableCell>
                        <span className="font-medium text-green-600">
                          +{formatNumber(item.totalNetVal)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatNumber(item.totalNetLot)} lot
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.screener ? (
                          <span
                            className={cn(
                              "font-bold",
                              item.screener.smartMoneyScore >= 70
                                ? "text-green-600"
                                : item.screener.smartMoneyScore <= 30
                                  ? "text-red-600"
                                  : "text-yellow-600",
                            )}
                          >
                            {item.screener.smartMoneyScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.screener ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px]",
                                item.screener.bandarStatus === "Accumulation" && "border-green-200 bg-green-50 text-green-700",
                                item.screener.bandarStatus === "Distribution" && "border-red-200 bg-red-50 text-red-700",
                                item.screener.bandarStatus === "Neutral" && "border-gray-200 bg-gray-50 text-gray-700",
                              )}
                            >
                              {item.screener.bandarStatus}
                            </Badge>
                            <Badge variant="secondary" className={cn(
                              "text-[11px]",
                              item.screener.momentum === "Uptrend" && "text-green-600",
                              item.screener.momentum === "Downtrend" && "text-red-600",
                            )}>
                              {item.screener.momentum}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {item.brokers.map((b) => (
                            <div
                              key={b.brokerCode}
                              className={cn(
                                "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-muted/50",
                                getBrokerCodeClass(b.brokerCode),
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

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {paginatedData.length} of {totalItems} results
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => setLimit(Number(val))}
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
                  disabled={page <= 1}
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
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
                      if (!isNaN(p) && p > 0 && p <= totalPages) setPage(p)
                      else setPageInput(page.toString())
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const p = parseInt(pageInput)
                        if (!isNaN(p) && p > 0 && p <= totalPages) setPage(p)
                      }
                    }}
                  />
                  <span className="text-sm font-medium">
                    of {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
