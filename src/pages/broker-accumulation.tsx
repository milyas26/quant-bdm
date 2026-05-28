import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { searchBrokerAccumulation, getBrokers, getWatchlists } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CalendarIcon, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parseISO, addDays, subDays } from "date-fns"
import type { BrokerAccumulationSearchResult } from "@/lib/apis/broker-summary/broker-summary-api"

const DATE_PRESETS = [{ label: "3D", value: "3d" }, { label: "1W", value: "1w" }, { label: "2W", value: "2w" }] as const

const scoreColor = (v: number) => v >= 70 ? "text-positive" : v <= 30 ? "text-negative" : "text-warning"

export default function BrokerAccumulationPage() {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const { brokerCodes, watchlistIds, preset, cutoffDate, from, to, page, limit, minPrice, maxPrice, minScore, maxScore, signals, bandarStatus, momentum, liquidity,
    setBrokerCodes, setWatchlistIds, setPreset, setCutoffDate, setPage, setLimit, setMinPrice, setMaxPrice, setMinScore, setMaxScore, setSignals, setBandarStatus, setMomentum, setLiquidity,
  } = useBrokerAccumulationStore()

  const [pageInput, setPageInput] = useState(page.toString())
  const [symbolSearch, setSymbolSearch] = useState("")
  const debouncedSymbol = useDebounce(symbolSearch, 500)
  const [minPriceInput, setMinPriceInput] = useState(minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice)
  const [minScoreInput, setMinScoreInput] = useState(minScore)
  const [maxScoreInput, setMaxScoreInput] = useState(maxScore)

  const { data: brokerGroup } = useQuery({ queryKey: ["brokers"], queryFn: getBrokers, staleTime: 10 * 60 * 1000 })
  const { data: watchlists } = useQuery({ queryKey: ["watchlists"], queryFn: getWatchlists, staleTime: 10 * 60 * 1000 })

  const brokerOptions = useMemo((): Record<string, BrokerOption[]> => {
    if (!brokerGroup) return {}
    const result: Record<string, BrokerOption[]> = {}
    for (const [type, brokers] of Object.entries(brokerGroup)) {
      result[type] = brokers.map((b) => ({ value: b.code, label: b.code, name: b.name, type: b.type }))
    }
    return result
  }, [brokerGroup])

  const watchlistOptions = useMemo((): MultiSelectOption[] => {
    if (!watchlists) return []
    return watchlists.map((w) => ({ value: String(w.id), label: w.name, description: `${w._count.tickers} saham` }))
  }, [watchlists])

  const selectedWatchlistIds = useMemo(() => watchlistIds.map(String), [watchlistIds])

  const { data, isLoading } = useQuery({
    queryKey: ["broker-accumulation-search", brokerCodes, from, to, debouncedSymbol, cutoffDate, watchlistIds],
    queryFn: () => searchBrokerAccumulation(brokerCodes, from, to, debouncedSymbol || undefined, cutoffDate, watchlistIds.length > 0 ? watchlistIds : undefined),
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
      if (signals.length > 0) { const hasBreakout = signals.includes("Breakout") && s.isBreakout; const hasSpike = signals.includes("Spike") && s.isVolumeSpike; if (!hasBreakout && !hasSpike) return false }
      if (bandarStatus.length > 0 && !bandarStatus.includes(s.bandarStatus)) return false
      if (momentum.length > 0 && !momentum.includes(s.momentum)) return false
      if (liquidity.length > 0 && !liquidity.includes(s.liquidityScore)) return false
      return true
    })
  }, [data, minPrice, maxPrice, minScore, maxScore, signals, bandarStatus, momentum, liquidity])

  const hasActiveFilters = !!(minPrice || maxPrice || minScore || maxScore || signals.length || bandarStatus.length || momentum.length || liquidity.length)
  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const paginatedData = useMemo(() => filteredData.slice((page - 1) * limit, (page - 1) * limit + limit), [filteredData, page, limit])

  useEffect(() => { if (page > totalPages) setPage(1) }, [totalPages])
  useEffect(() => setPageInput(page.toString()), [page])

  const handlePriceUpdate = () => { setMinPrice(minPriceInput); setMaxPrice(maxPriceInput) }
  const handleScoreUpdate = () => { setMinScore(minScoreInput); setMaxScore(maxScoreInput) }
  const handleStepDate = (direction: 1 | -1) => { const current = parseISO(cutoffDate); const next = direction === 1 ? addDays(current, 1) : subDays(current, 1); setCutoffDate(format(next, "yyyy-MM-dd")) }
  const handleResetFilters = () => { setMinPriceInput(""); setMaxPriceInput(""); setMinScoreInput(""); setMaxScoreInput(""); setMinPrice(""); setMaxPrice(""); setMinScore(""); setMaxScore(""); setSignals([]); setBandarStatus([]); setMomentum([]); setLiquidity([]) }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-mono text-lg font-bold tracking-tight">Broker Accumulation</h1>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Cari saham yang diakumulasi broker tertentu dalam rentang waktu yang dipilih.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search symbol..." className="h-9 pl-8 bg-transparent border-border font-mono text-sm placeholder:text-muted-foreground/40" value={symbolSearch} onChange={(e) => { setSymbolSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="min-w-44 flex-1 max-w-56"><MultiSelect options={watchlistOptions} selected={selectedWatchlistIds} onChange={(ids) => setWatchlistIds(ids.map((id) => parseInt(id, 10)))} placeholder="Watchlist..." searchPlaceholder="Cari..." /></div>
        <div className="min-w-56 flex-1 max-w-xs"><BrokerMultiSelect options={brokerOptions} selected={brokerCodes} onChange={setBrokerCodes} placeholder="Pilih broker..." /></div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-9 w-8 rounded-sm shrink-0" onClick={() => handleStepDate(-1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 w-28 rounded-sm justify-start text-left font-mono text-[11px] px-2", cutoffDate === format(new Date(), "yyyy-MM-dd") && "text-muted-foreground")}>
                <CalendarIcon className="mr-1 h-3 w-3" />{format(parseISO(cutoffDate), "dd MMM yy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={parseISO(cutoffDate)} onSelect={(d) => { if (d) setCutoffDate(format(d, "yyyy-MM-dd")) }} initialFocus />
              {cutoffDate !== format(new Date(), "yyyy-MM-dd") && <div className="border-t border-border p-2"><Button variant="ghost" size="sm" className="w-full text-[11px] font-mono h-7 rounded-sm" onClick={() => setCutoffDate(format(new Date(), "yyyy-MM-dd"))}>Reset to Today</Button></div>}
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" className="h-9 w-8 rounded-sm shrink-0" onClick={() => handleStepDate(1)} disabled={cutoffDate >= format(new Date(), "yyyy-MM-dd")}><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          {DATE_PRESETS.map((p) => (
            <Button key={p.value} variant={preset === p.value ? "default" : "outline"} size="sm" className="h-9 rounded-sm font-mono text-[11px]" onClick={() => setPreset(p.value)}>{p.label}</Button>
          ))}
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          <Button variant={showFilters ? "default" : "outline"} size="sm" className="h-9 rounded-sm font-mono text-[11px]" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />Filters{hasActiveFilters && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px] font-mono rounded-sm">ON</Badge>}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-border bg-card/50"><CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">Price & Score</span>
            <div className="flex h-8 items-center gap-1 rounded-sm border border-border bg-transparent px-2 text-xs font-mono">
              <span className="font-medium text-muted-foreground">Price</span><span className="text-border">|</span>
              <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground/30" placeholder="Min" type="number" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} onBlur={handlePriceUpdate} onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()} />
              <span className="text-muted-foreground">-</span>
              <input className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/30" placeholder="Max" type="number" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} onBlur={handlePriceUpdate} onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()} />
            </div>
            <div className="flex h-8 items-center gap-1 rounded-sm border border-border bg-transparent px-2 text-xs font-mono">
              <span className="font-medium text-muted-foreground">Score</span><span className="text-border">|</span>
              <input className="w-full bg-transparent outline-none placeholder:text-muted-foreground/30" placeholder="Min" type="number" min="0" max="100" value={minScoreInput} onChange={(e) => setMinScoreInput(e.target.value)} onBlur={handleScoreUpdate} onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()} />
              <span className="text-muted-foreground">-</span>
              <input className="w-full bg-transparent text-right outline-none placeholder:text-muted-foreground/30" placeholder="Max" type="number" min="0" max="100" value={maxScoreInput} onChange={(e) => setMaxScoreInput(e.target.value)} onBlur={handleScoreUpdate} onKeyDown={(e) => e.key === "Enter" && handleScoreUpdate()} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">Signals & Status</span>
            <FilterMultiSelect title="Signals" options={[{ label: "Breakout", value: "Breakout" }, { label: "Spike", value: "Spike" }]} selected={signals} onChange={setSignals} />
            <FilterMultiSelect title="Status" options={[{ label: "Accumulation", value: "Accumulation" }, { label: "Neutral", value: "Neutral" }, { label: "Distribution", value: "Distribution" }]} selected={bandarStatus} onChange={setBandarStatus} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">Momentum & Liquidity</span>
            <FilterMultiSelect title="Momentum" options={[{ label: "Uptrend", value: "Uptrend" }, { label: "Sideways", value: "Sideways" }, { label: "Downtrend", value: "Downtrend" }]} selected={momentum} onChange={setMomentum} />
            <FilterMultiSelect title="Liquidity" options={[{ label: "High", value: "High" }, { label: "Medium", value: "Medium" }, { label: "Low", value: "Low" }]} selected={liquidity} onChange={setLiquidity} />
          </div>
          <div className="flex flex-col justify-end">
            <Button onClick={handleResetFilters} size="sm" variant="ghost" className="h-7 rounded-sm px-2 text-destructive hover:bg-destructive/10 text-[10px] font-mono"><X className="mr-1 h-3 w-3" />Clear</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticker</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Price</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Net Value</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Net Lot</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Score</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Brokers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!paginatedData.length ? (
              <TableRow className="border-border"><TableCell colSpan={7} className="h-24 text-center font-mono text-sm text-muted-foreground">{isLoading ? "Loading..." : "No results"}</TableCell></TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.symbol} className="cursor-pointer border-border hover:bg-accent/50" onClick={() => navigate(`/stock/${item.symbol}`)}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      {item.logo && <img src={item.logo} alt={item.symbol} className="h-7 w-7 rounded-full object-cover border border-border" />}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[13px] font-bold">{item.symbol}</span>
                          {item.screener?.isBreakout && <span className="font-mono text-[9px] text-positive bg-emerald-400/10 px-1 rounded-sm">BO</span>}
                          {item.screener?.isVolumeSpike && <span className="font-mono text-[9px] text-warning bg-amber-400/10 px-1 rounded-sm">Spike</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.name || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {item.screener ? (
                      <div>
                        <span className="font-mono text-[13px] font-bold">{item.screener.price.toLocaleString()}</span>
                        <span className={cn("ml-1.5 font-mono text-[11px] font-medium", item.screener.changePercentage > 0 ? "text-positive" : item.screener.changePercentage < 0 ? "text-negative" : "text-muted-foreground")}>
                          {item.screener.changePercentage > 0 ? "+" : ""}{item.screener.changePercentage.toFixed(2)}%
                        </span>
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="py-2"><span className="font-mono text-[12px] font-semibold text-positive">+{formatNumber(item.totalNetVal)}</span></TableCell>
                  <TableCell className="py-2"><span className="font-mono text-[12px]">{formatNumber(item.totalNetLot)} lot</span></TableCell>
                  <TableCell className="py-2">
                    {item.screener ? <span className={cn("font-mono text-[13px] font-bold", scoreColor(item.screener.smartMoneyScore))}>{item.screener.smartMoneyScore}</span> : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="py-2">
                    {item.screener ? (
                      <div className="flex flex-col gap-0.5">
                        <StatusBadge status={item.screener.bandarStatus} />
                        <span className={cn("font-mono text-[9px]", item.screener.momentum === "Uptrend" && "text-positive", item.screener.momentum === "Downtrend" && "text-negative", !item.screener.momentum || item.screener.momentum === "Sideways" ? "text-muted-foreground" : "")}>{item.screener.momentum || "-"}</span>
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {item.brokers.map((b) => (
                        <div key={b.brokerCode} className={cn("flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-mono bg-muted/50", getBrokerCodeClass(b.brokerCode))}>
                          <span className="font-bold">{b.brokerCode}</span>
                          <span className="text-muted-foreground">{formatNumber(b.netVal)} · {b.daysActive}d</span>
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span>{paginatedData.length} of {totalItems}</span>
          <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
            <SelectTrigger className="h-7 w-14 rounded-sm border-border text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>{[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-sm" onClick={() => setPage(1)} disabled={page <= 1}><ChevronsLeft className="h-3 w-3" /></Button>
          <Button variant="outline" size="sm" className="h-7 rounded-sm font-mono text-[11px]" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}><ChevronLeft className="h-3 w-3" /> Prev</Button>
          <Input className="h-7 w-14 rounded-sm text-center font-mono text-[11px]" value={pageInput} type="number" onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => { const p = parseInt(pageInput); if (!isNaN(p) && p > 0 && p <= totalPages) setPage(p); else setPageInput(page.toString()) }}
            onKeyDown={(e) => { if (e.key === "Enter") { const p = parseInt(pageInput); if (!isNaN(p) && p > 0 && p <= totalPages) setPage(p) } }} />
          <span className="font-mono text-[11px] text-muted-foreground">/ {totalPages}</span>
          <Button variant="outline" size="sm" className="h-7 rounded-sm font-mono text-[11px]" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next <ChevronRight className="h-3 w-3" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}><ChevronsRight className="h-3 w-3" /></Button>
        </div>
      </div>
    </div>
  )
}
