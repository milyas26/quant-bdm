import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { getActiveTrades, getTradeHistory, closeTrade, captureSnapshots } from "@/lib/api"
import type { DemoTrade } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TrendingUp, TrendingDown, RefreshCw, Camera } from "lucide-react"

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

const fmtCurrency = (n: number) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

const PnlCell = ({ pnl, pnlPercent }: { pnl: number; pnlPercent: number }) => {
  const positive = pnl >= 0
  return (
    <div className={cn("flex flex-col", positive ? "text-green-500" : "text-red-500")}>
      <span className="flex items-center gap-1 font-semibold">
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {positive ? "+" : ""}
        {fmtCurrency(pnl)}
      </span>
      <span className="text-xs opacity-80">
        {positive ? "+" : ""}
        {pnlPercent.toFixed(2)}%
      </span>
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) =>
  status === "OPEN" ? (
    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">OPEN</Badge>
  ) : (
    <Badge variant="secondary">CLOSED</Badge>
  )

// ─── Summary cards ────────────────────────────────────────────────────────────

const SummaryCards = ({ trades }: { trades: DemoTrade[] }) => {
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
  const winners = trades.filter((t) => t.pnl > 0).length
  const winRate = trades.length > 0 ? (winners / trades.length) * 100 : 0
  const bestTrade = trades.reduce(
    (best, t) => (t.pnlPercent > (best?.pnlPercent ?? -Infinity) ? t : best),
    null as DemoTrade | null
  )

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
            Open Positions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-2xl font-bold">{trades.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Unrealised PnL
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p
            className={cn(
              "text-2xl font-bold",
              totalPnl >= 0 ? "text-green-500" : "text-red-500"
            )}
          >
            {totalPnl >= 0 ? "+" : ""}
            {fmtCurrency(totalPnl)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-2xl font-bold">{winRate.toFixed(0)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
            Best Performer
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {bestTrade ? (
            <div>
              <p className="text-2xl font-bold">{bestTrade.symbol}</p>
              <p className="text-xs text-green-500">
                +{bestTrade.pnlPercent.toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-2xl font-bold">—</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Trades table ─────────────────────────────────────────────────────────────

const TradesTable = ({
  trades,
  showCloseButton,
  onClose,
  isClosing,
}: {
  trades: DemoTrade[]
  showCloseButton: boolean
  onClose?: (id: number) => void
  isClosing?: boolean
}) => {
  if (trades.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        No trades found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Entry</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">PnL</TableHead>
            <TableHead>Signals</TableHead>
            <TableHead>Entry Time</TableHead>
            {showCloseButton && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>
                <div className="font-semibold">{trade.symbol}</div>
                {trade.ticker.name && (
                  <div className="text-xs text-muted-foreground truncate max-w-30">
                    {trade.ticker.name}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={trade.status} />
              </TableCell>
              <TableCell className="text-right font-mono">
                {fmtPrice(trade.entryPrice)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {fmtPrice(trade.currentPrice)}
              </TableCell>
              <TableCell className="text-right">{trade.quantity}</TableCell>
              <TableCell className="text-right">
                <PnlCell pnl={trade.pnl} pnlPercent={trade.pnlPercent} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {trade.isBreakout && (
                    <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/30">
                      Breakout
                    </Badge>
                  )}
                  {trade.isVolumeSpike && (
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                      Vol Spike
                    </Badge>
                  )}
                  {trade.bandarStatus && (
                    <Badge variant="outline" className="text-xs">
                      {trade.bandarStatus}
                    </Badge>
                  )}
                  {trade.smartMoneyScore != null && (
                    <Badge variant="secondary" className="text-xs">
                      SMS {Number(trade.smartMoneyScore).toFixed(1)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(trade.entryTime), "dd MMM yy HH:mm")}
              </TableCell>
              {showCloseButton && (
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isClosing}
                    onClick={() => onClose?.(trade.id)}
                  >
                    Close
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoTradingPage() {
  const queryClient = useQueryClient()
  const [closingId, setClosingId] = useState<number | null>(null)

  const { data: activeTrades = [], isLoading: loadingActive } = useQuery({
    queryKey: ["demo-trades", "active"],
    queryFn: getActiveTrades,
    refetchInterval: 60_000,
  })

  const { data: historyTrades = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["demo-trades", "history"],
    queryFn: getTradeHistory,
  })

  const { mutate: handleClose, isPending: isClosing } = useMutation({
    mutationFn: closeTrade,
    onMutate: (id) => setClosingId(id),
    onSuccess: () => {
      toast.success("Trade closed successfully")
      queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to close trade")
    },
    onSettled: () => setClosingId(null),
  })

  const { mutate: handleSnapshot, isPending: isSnapshotting } = useMutation({
    mutationFn: captureSnapshots,
    onSuccess: () => toast.success("Price snapshots captured"),
    onError: () => toast.error("Failed to capture snapshots"),
  })

  const historyPnl = historyTrades.reduce((s, t) => s + t.pnl, 0)
  const historyWins = historyTrades.filter((t) => t.pnl > 0).length
  const historyWinRate =
    historyTrades.length > 0
      ? (historyWins / historyTrades.length) * 100
      : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demo Trading</h1>
          <p className="text-sm text-muted-foreground">
            Simulate trades from screener signals. No real money involved.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSnapshotting}
            onClick={() => handleSnapshot()}
          >
            <Camera className="h-4 w-4 mr-1" />
            Capture Snapshots
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["demo-trades"] })}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      {!loadingActive && <SummaryCards trades={activeTrades} />}

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Trades{" "}
            {activeTrades.length > 0 && (
              <Badge className="ml-1 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {activeTrades.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            History{" "}
            {historyTrades.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {historyTrades.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {loadingActive ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <TradesTable
              trades={activeTrades}
              showCloseButton
              onClose={(id) => handleClose(id)}
              isClosing={isClosing && closingId !== null}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {/* Closed trades summary */}
          {historyTrades.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Closed Trades
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-2xl font-bold">{historyTrades.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Realised PnL
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      historyPnl >= 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {historyPnl >= 0 ? "+" : ""}
                    {fmtCurrency(historyPnl)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-2xl font-bold">{historyWinRate.toFixed(0)}%</p>
                </CardContent>
              </Card>
            </div>
          )}

          {loadingHistory ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <TradesTable
              trades={historyTrades}
              showCloseButton={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
