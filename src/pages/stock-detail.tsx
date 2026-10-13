import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import {
  getTickerDetail,
  getHistoricalScreenerData,
  getScreener,
  refreshSingleTicker,
  exportTickerData,
  getStockProfile,
} from "@/lib/api"
import { SimulateBuyButton } from "@/components/simulate-buy-button"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/indicators"
import { fmtCurrency } from "@/lib/format"
import { useState } from "react"
import { format, startOfMonth, subMonths } from "date-fns"
import { BrokerSummaryDashboard } from "@/components/broker-summary-dashboard"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, RefreshCw, Download, Bookmark } from "lucide-react"
import { AddToWatchlistDialog } from "@/components/add-to-watchlist-dialog"
import { BrokerInventory } from "@/components/broker-inventory"
import { HistoricalScreener } from "@/components/historical-screener"
import { RetailExhaustionChart } from "@/components/retail-exhaustion-chart"
import { FloorPriceChart } from "@/components/floor-price-chart"
import { WhaleDetection } from "@/components/whale-detection"
import { CohesionAnalysisChart } from "@/components/cohesion-analysis-chart"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function StockDetail() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { ticker } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTicker = ticker?.toUpperCase() || ""
  const [brokerCode, setBrokerCode] = useState("")
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false)
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false)
  const [refreshDateRange, setRefreshDateRange] = useState<
    DateRange | undefined
  >({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: new Date(),
  })

  const { data: tickerInfo } = useQuery({
    queryKey: ["ticker-detail", selectedTicker],
    queryFn: () => getTickerDetail(selectedTicker),
    enabled: !!selectedTicker,
  })

  const { data: screenerData } = useQuery({
    queryKey: ["screener-ticker", selectedTicker],
    queryFn: () => getScreener({ search: selectedTicker, limit: 1 }),
    enabled: !!selectedTicker,
  })

  const screenerTicker = screenerData?.data?.[0]
  const [screenerMonths, setScreenerMonths] = useState(3)

  const { data: historicalScreenerData } = useQuery({
    queryKey: ["historical-screener", selectedTicker, screenerMonths],
    queryFn: () => getHistoricalScreenerData(selectedTicker, screenerMonths),
    enabled: !!selectedTicker,
  })

  const { data: stockProfile } = useQuery({
    queryKey: ["stock-profile", selectedTicker],
    queryFn: () => getStockProfile(selectedTicker),
    enabled: !!selectedTicker,
    retry: false,
  })

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: new Date(),
  })
  const [valueType, setValueType] = useState<"Net" | "Gross">("Net")

  const refreshMutation = useMutation({
    mutationFn: () =>
      refreshSingleTicker(
        selectedTicker,
        refreshDateRange?.from
          ? format(refreshDateRange.from, "yyyy-MM-dd")
          : "",
        refreshDateRange?.to ? format(refreshDateRange.to, "yyyy-MM-dd") : ""
      ),
    onSuccess: () => {
      toast.success(`Refreshing ${selectedTicker} in background.`)
      setRefreshDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["broker-summary-range"] })
      queryClient.invalidateQueries({
        queryKey: ["ticker-detail", selectedTicker],
      })
      queryClient.invalidateQueries({
        queryKey: ["screener-ticker", selectedTicker],
      })
    },
    onError: (error) =>
      toast.error(`Failed to refresh: ${(error as Error).message}`),
  })

  const latest = tickerInfo?.latestHistoricalData
  const changePct = latest ? parseFloat(latest.change_percentage) : 0
  const tab = searchParams.get("tab") ?? "flow"
  const usesDateRange = tab === "flow" || tab === "signals"
  const profile = stockProfile?.data
  const address = profile?.address?.[0]

  const handleExport = async () => {
    try {
      const data = await exportTickerData(
        selectedTicker,
        date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
        date?.to ? format(date.to, "yyyy-MM-dd") : undefined
      )
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedTicker}_${format(new Date(), "yyyyMMdd")}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("JSON exported")
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`)
    }
  }

  return (
    <div className="space-y-5">
      <AddToWatchlistDialog
        symbol={watchlistDialogOpen ? selectedTicker : null}
        onClose={() => setWatchlistDialogOpen(false)}
      />

      <div className="space-y-3">
        <Button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-3 md:gap-4">
            {tickerInfo?.logo && (
              <img
                src={tickerInfo.logo}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full border border-border object-cover md:h-12 md:w-12"
              />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="font-mono text-2xl font-semibold tracking-tight">
                  {selectedTicker}
                </h1>
                {latest && (
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-semibold">
                      {parseInt(latest.close).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        changePct > 0
                          ? "text-positive"
                          : changePct < 0
                            ? "text-negative"
                            : "text-muted-foreground"
                      )}
                    >
                      {changePct > 0 ? "+" : ""}
                      {changePct.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {tickerInfo?.name || "-"}
              </p>
              {(tickerInfo?.sector || tickerInfo?.subSector) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {[tickerInfo?.sector, tickerInfo?.subSector]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {screenerTicker && <SimulateBuyButton ticker={screenerTicker} />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWatchlistDialogOpen(true)}
            >
              <Bookmark
                className={cn(
                  "h-3.5 w-3.5",
                  tickerInfo?.isOnWatchlist && "fill-brand text-brand"
                )}
              />
              {tickerInfo?.isOnWatchlist ? "In watchlist" : "Watchlist"}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleExport}
              title="Export JSON for the selected date range"
              aria-label="Export JSON"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={() => setRefreshDialogOpen(true)}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {screenerTicker && (
        <section aria-label="Latest screener signals" className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 className="text-xs font-medium text-muted-foreground">
              Latest screener
            </h2>
            {screenerTicker.date && (
              <span className="font-mono text-xs text-muted-foreground">
                {format(new Date(screenerTicker.date), "d MMM yyyy")}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Bandar status">
              <StatusBadge status={screenerTicker.bandarStatus} />
            </Stat>
            <Stat label="Net broker flow">
              <span className={cn("font-mono", signColor(screenerTicker.netBrokerFlow))}>
                {fmtCurrency(screenerTicker.netBrokerFlow)}
              </span>
            </Stat>
            <Stat label="Acc/Dist 1D · 1W · 1M">
              <span className="flex gap-2 font-mono">
                {[
                  screenerTicker.accumulationDistribution.d1,
                  screenerTicker.accumulationDistribution.w1,
                  screenerTicker.accumulationDistribution.m1,
                ].map((v, i) => (
                  <span key={i} className={signColor(v)}>
                    {v > 0 ? "+" : ""}
                    {v.toFixed(1)}%
                  </span>
                ))}
              </span>
            </Stat>
            <Stat label="Momentum">
              <span className={cn(
                screenerTicker.momentum === "Uptrend" && "text-positive",
                screenerTicker.momentum === "Downtrend" && "text-negative"
              )}>
                {screenerTicker.momentum}
              </span>
            </Stat>
            <Stat label="Liquidity">{screenerTicker.liquidityScore}</Stat>
            <Stat label="Volume · Value">
              <span className="font-mono">
                {fmtCurrency(screenerTicker.volume).replace("+", "")}
                <span className="text-muted-foreground">
                  {" · "}Rp {fmtCurrency(Number(screenerTicker.transactionValue || 0)).replace("+", "")}
                </span>
              </span>
              {screenerTicker.isVolumeSpike && (
                <span className="text-warning ml-1.5 text-xs">Spike</span>
              )}
            </Stat>
          </dl>
        </section>
      )}

      <Dialog open={refreshDialogOpen} onOpenChange={setRefreshDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refresh {selectedTicker}</DialogTitle>
            <DialogDescription>
              Pick the date range of broker summary data to fetch again.
            </DialogDescription>
          </DialogHeader>
          <DatePickerWithRange
            date={refreshDateRange}
            setDate={setRefreshDateRange}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefreshDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => refreshMutation.mutate()}
              disabled={
                refreshMutation.isPending ||
                !refreshDateRange?.from ||
                !refreshDateRange?.to
              }
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", refreshMutation.isPending && "animate-spin")}
              />
              {refreshMutation.isPending ? "Refreshing..." : "Refresh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          setSearchParams(
            (prev) => {
              prev.set("tab", value)
              return prev
            },
            { replace: true }
          )
        }
        className="gap-4"
      >
        <div className="flex flex-col gap-3 border-b border-border lg:flex-row lg:items-end lg:justify-between">
          <TabsList className="scrollbar-thin -mb-px h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0 lg:w-auto">
            {DETAIL_TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-[13px] text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {usesDateRange && (
            <div className="flex items-center gap-2 pb-3">
              <DatePickerWithRange date={date} setDate={setDate} />
              <Select
                value={valueType}
                onValueChange={(val) => setValueType(val as "Net" | "Gross")}
              >
                <SelectTrigger className="h-8 w-24 text-xs" aria-label="Value type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net">Net</SelectItem>
                  <SelectItem value="Gross">Gross</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="flow">
          <BrokerSummaryDashboard
            selectedTicker={selectedTicker}
            date={date}
            valueType={valueType}
            onBrokerClick={setBrokerCode}
            highlightedBroker={brokerCode}
          />
        </TabsContent>

        <TabsContent value="inventory">
          <BrokerInventory selectedTicker={selectedTicker} />
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FloorPriceChart symbol={selectedTicker} />
            <RetailExhaustionChart symbol={selectedTicker} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WhaleDetection
              symbol={selectedTicker}
              from={date?.from ? format(date.from, "yyyy-MM-dd") : undefined}
              to={date?.to ? format(date.to, "yyyy-MM-dd") : undefined}
            />
            <CohesionAnalysisChart symbol={selectedTicker} />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <HistoricalScreener
            data={historicalScreenerData?.data || []}
            months={screenerMonths}
            onMonthsChange={setScreenerMonths}
          />
        </TabsContent>

        <TabsContent value="profile">
          {profile ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <h2 className="mb-2 text-sm font-medium">Business background</h2>
                <p className="max-w-prose text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {profile.background || "No background on file."}
                </p>
              </section>
              <dl className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm">
                {profile.listingDate && (
                  <ProfileField label="Listing date">{profile.listingDate}</ProfileField>
                )}
                {address?.office && (
                  <ProfileField label="Office">
                    <span className="whitespace-pre-line">{address.office}</span>
                  </ProfileField>
                )}
                {address?.website && (
                  <ProfileField label="Website">
                    <a
                      href={`https://${address.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-4 hover:text-brand"
                    >
                      {address.website}
                    </a>
                  </ProfileField>
                )}
                {address?.phone && <ProfileField label="Phone">{address.phone}</ProfileField>}
                {address?.fax && <ProfileField label="Fax">{address.fax}</ProfileField>}
                {address?.email?.[0] && (
                  <ProfileField label="Email">
                    <a
                      href={`mailto:${address.email[0]}`}
                      className="text-foreground underline underline-offset-4 hover:text-brand"
                    >
                      {address.email[0]}
                    </a>
                  </ProfileField>
                )}
              </dl>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No company profile saved for {selectedTicker} yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fetch it from the Screener page with the "Get All Profiles" button in the toolbar.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const DETAIL_TABS = [
  { value: "flow", label: "Broker flow" },
  { value: "inventory", label: "Inventory" },
  { value: "signals", label: "Signals" },
  { value: "history", label: "History" },
  { value: "profile", label: "Profile" },
]

const signColor = (v: number) =>
  v > 0 ? "text-positive" : v < 0 ? "text-negative" : "text-muted-foreground"

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card px-4 py-3">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  )
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
