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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, RefreshCw, Download, Bookmark } from "lucide-react"
import { AddToWatchlistDialog } from "@/components/add-to-watchlist-dialog"
import { Badge } from "@/components/ui/badge"
import { BrokerInventory } from "@/components/broker-inventory"
import { HistoricalScreener } from "@/components/historical-screener"
import { PvaAnalysis } from "@/components/pva-analysis"
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

  return (
    <div className="space-y-6">
      <AddToWatchlistDialog
        symbol={watchlistDialogOpen ? selectedTicker : null}
        onClose={() => setWatchlistDialogOpen(false)}
      />

      <div className="flex items-start justify-between">
        <div>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Back
          </Button>
          <div className="flex items-center gap-4">
            {tickerInfo?.logo && (
              <img
                src={tickerInfo.logo}
                alt={selectedTicker}
                className="h-14 w-14 rounded-full border-2 border-border object-cover"
              />
            )}
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="font-mono text-2xl font-bold tracking-tight">
                  {selectedTicker}
                </h1>
                {tickerInfo?.latestHistoricalData && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold">
                      {parseInt(
                        tickerInfo.latestHistoricalData.close
                      ).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-sm font-medium",
                        parseFloat(
                          tickerInfo.latestHistoricalData.change_percentage
                        ) > 0
                          ? "text-positive"
                          : parseFloat(
                                tickerInfo.latestHistoricalData
                                  .change_percentage
                              ) < 0
                            ? "text-negative"
                            : "text-muted-foreground"
                      )}
                    >
                      {parseFloat(
                        tickerInfo.latestHistoricalData.change_percentage
                      ) > 0
                        ? "+"
                        : ""}
                      {parseFloat(
                        tickerInfo.latestHistoricalData.change_percentage
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {tickerInfo?.name || "-"}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {tickerInfo?.sector && (
                  <Badge
                    variant="outline"
                    className="rounded-sm font-mono text-[10px]"
                  >
                    {tickerInfo.sector}
                  </Badge>
                )}
                {tickerInfo?.subSector && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm font-mono text-[10px]"
                  >
                    {tickerInfo.subSector}
                  </Badge>
                )}
                {screenerTicker && (
                  <SimulateBuyButton ticker={screenerTicker} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-sm font-mono text-[11px]"
            onClick={() => setWatchlistDialogOpen(true)}
          >
            <Bookmark
              className={cn(
                "h-3.5 w-3.5",
                tickerInfo?.isOnWatchlist && "fill-[#c8a951] text-[#c8a951]"
              )}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-sm font-mono text-[11px]"
            onClick={async () => {
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
            }}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 rounded-sm font-mono text-[11px]"
            onClick={() => setRefreshDialogOpen(true)}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <Dialog open={refreshDialogOpen} onOpenChange={setRefreshDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refresh {selectedTicker}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Select date range for broker summary data.
            </p>
            <DatePickerWithRange
              date={refreshDateRange}
              setDate={setRefreshDateRange}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefreshDialogOpen(false)}
              className="rounded-sm"
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
              className="rounded-sm"
            >
              {refreshMutation.isPending ? (
                <>
                  <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />{" "}
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <DatePickerWithRange date={date} setDate={setDate} />
        <Select
          value={valueType}
          onValueChange={(val) => setValueType(val as "Net" | "Gross")}
        >
          <SelectTrigger className="h-8 w-20 rounded-sm font-mono text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Net">Net</SelectItem>
            <SelectItem value="Gross">Gross</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BrokerSummaryDashboard
        selectedTicker={selectedTicker}
        date={date}
        valueType={valueType}
        onBrokerClick={setBrokerCode}
        highlightedBroker={brokerCode}
      />

      {stockProfile ? (
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {stockProfile.data?.background && (
              <div>
                <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                  Business Background
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {stockProfile.data.background}
                </p>
              </div>
            )}
            {stockProfile.data?.address?.[0] && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {stockProfile.data.address[0].office && (
                  <div>
                    <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                      Office
                    </div>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {stockProfile.data.address[0].office}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  {stockProfile.data.address[0].website && (
                    <div>
                      <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                        Website
                      </div>
                      <a
                        href={`https://${stockProfile.data.address[0].website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {stockProfile.data.address[0].website}
                      </a>
                    </div>
                  )}
                  {stockProfile.data.address[0].phone && (
                    <div>
                      <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                        Phone
                      </div>
                      <span className="text-muted-foreground">
                        {stockProfile.data.address[0].phone}
                      </span>
                    </div>
                  )}
                  {stockProfile.data.address[0].fax && (
                    <div>
                      <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                        Fax
                      </div>
                      <span className="text-muted-foreground">
                        {stockProfile.data.address[0].fax}
                      </span>
                    </div>
                  )}
                  {stockProfile.data.address[0].email?.[0] && (
                    <div>
                      <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                        Email
                      </div>
                      <a
                        href={`mailto:${stockProfile.data.address[0].email[0]}`}
                        className="text-blue-400 hover:underline"
                      >
                        {stockProfile.data.address[0].email[0]}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            {stockProfile.data?.listingDate && (
              <div>
                <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
                  Listing Date
                </div>
                <span className="text-muted-foreground">
                  {stockProfile.data.listingDate}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-border bg-card/30">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="font-mono text-xs text-muted-foreground">
                No profile data available
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/50">
                Click "Get All Profiles" from the screener page to fetch
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {screenerTicker && (
          <PvaAnalysis
            pvaTrend={screenerTicker.pvaTrend}
            pvaScore={screenerTicker.pvaScore}
            volumeAnomaly={screenerTicker.volumeAnomaly}
            correctionHealth={screenerTicker.correctionHealth}
            volumeDistributionRisk={screenerTicker.volumeDistributionRisk}
            volumeChangeRatio={screenerTicker.volumeChangeRatio}
            washTradingRisk={screenerTicker.washTradingRisk}
            washTradingScore={screenerTicker.washTradingScore}
            distributionRisk={screenerTicker.distributionRisk}
            repoPatternDetected={screenerTicker.repoPatternDetected}
          />
        )}
        <BrokerInventory selectedTicker={selectedTicker} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FloorPriceChart symbol={selectedTicker} />
          <RetailExhaustionChart symbol={selectedTicker} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WhaleDetection
            symbol={selectedTicker}
            from={date?.from ? format(date.from, "yyyy-MM-dd") : undefined}
            to={date?.to ? format(date.to, "yyyy-MM-dd") : undefined}
          />
          <CohesionAnalysisChart symbol={selectedTicker} />
        </div>
        <div>
          <div className="mb-3 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Historical Screener
          </div>
          <HistoricalScreener
            data={historicalScreenerData?.data || []}
            months={screenerMonths}
            onMonthsChange={setScreenerMonths}
          />
        </div>
      </div>
    </div>
  )
}
