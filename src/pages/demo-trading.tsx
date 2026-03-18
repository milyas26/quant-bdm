import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import {
  getActiveTrades,
  getTradeHistory,
  closeTrade,
  captureSnapshots,
} from "@/lib/api"
import type { DemoTrade } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Camera,
  Activity,
  Trophy,
  Percent,
  Wallet,
  History,
  BarChart2,
  X,
} from "lucide-react"

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

const fmtCurrency = (n: number) => {
  const abs = Math.abs(n)
  const sign = n >= 0 ? "+" : "-"
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return `${n >= 0 ? "+" : ""}${n.toFixed(0)}`
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

// ─── PnL Cell ────────────────────────────────────────────────────────────────

const PnlCell = ({ pnl, pnlPercent }: { pnl: number; pnlPercent: number }) => {
  const positive = pnl >= 0
  return (
    <div
      className={cn(
        "flex flex-col items-end tabular-nums",
        positive ? "text-green-500" : "text-red-500"
      )}
    >
      <span className="flex items-center gap-1 text-sm font-semibold">
        {positive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {fmtCurrency(pnl)}
      </span>
      <span className="text-xs opacity-70">
        {positive ? "+" : ""}
        {pnlPercent.toFixed(2)}%
      </span>
      <span className="text-[10px] font-normal opacity-50">{fmtIDR(pnl)}</span>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) =>
  status === "OPEN" ? (
    <Badge className="border-emerald-500/25 bg-emerald-500/15 font-medium text-emerald-500">
      <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      OPEN
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-muted-foreground">
      CLOSED
    </Badge>
  )

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  valueClass,
  loading,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: React.ElementType
  valueClass?: string
  loading?: boolean
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pt-4 pb-0">
      <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </CardTitle>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent className="px-4 pt-2 pb-4">
      {loading ? (
        <Skeleton className="mt-1 h-7 w-20" />
      ) : (
        <>
          <p className={cn("text-2xl font-bold tracking-tight", valueClass)}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </>
      )}
    </CardContent>
  </Card>
)

// ─── Summary Cards ────────────────────────────────────────────────────────────

const SummaryCards = ({
  trades,
  loading,
}: {
  trades: DemoTrade[]
  loading?: boolean
}) => {
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
  const winners = trades.filter((t) => t.pnl > 0).length
  const winRate = trades.length > 0 ? (winners / trades.length) * 100 : 0
  const bestTrade = trades.reduce(
    (best, t) => (t.pnlPercent > (best?.pnlPercent ?? -Infinity) ? t : best),
    null as DemoTrade | null
  )

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="Open Positions"
        value={trades.length}
        icon={Activity}
        loading={loading}
        sub={
          trades.length === 1
            ? "1 active trade"
            : `${trades.length} active trades`
        }
      />
      <StatCard
        label="Unrealised PnL"
        value={loading ? "—" : fmtCurrency(totalPnl)}
        icon={Wallet}
        loading={loading}
        valueClass={totalPnl >= 0 ? "text-green-500" : "text-red-500"}
        sub={loading ? undefined : fmtIDR(totalPnl)}
      />
      <StatCard
        label="Win Rate"
        value={`${winRate.toFixed(0)}%`}
        icon={Percent}
        loading={loading}
        sub={`${winners} of ${trades.length} profitable`}
        valueClass={
          winRate >= 50
            ? "text-green-500"
            : winRate > 0
              ? "text-yellow-500"
              : undefined
        }
      />
      <StatCard
        label="Best Performer"
        value={bestTrade?.symbol ?? "—"}
        icon={Trophy}
        loading={loading}
        sub={
          bestTrade
            ? `+${bestTrade.pnlPercent.toFixed(2)}% return`
            : "no trades yet"
        }
        valueClass={bestTrade ? "text-green-500" : undefined}
      />
    </div>
  )
}

// ─── Signal Badges ────────────────────────────────────────────────────────────

const SignalBadges = ({ trade }: { trade: DemoTrade }) => (
  <div className="flex flex-wrap gap-1">
    {trade.isBreakout && (
      <Badge
        variant="outline"
        className="h-4 border-yellow-500/30 bg-yellow-500/5 px-1.5 py-0 text-[10px] text-yellow-500"
      >
        Breakout
      </Badge>
    )}
    {trade.isVolumeSpike && (
      <Badge
        variant="outline"
        className="h-4 border-blue-500/30 bg-blue-500/5 px-1.5 py-0 text-[10px] text-blue-400"
      >
        Vol Spike
      </Badge>
    )}
    {trade.bandarStatus && (
      <Badge variant="outline" className="h-4 px-1.5 py-0 text-[10px]">
        {trade.bandarStatus}
      </Badge>
    )}
    {trade.smartMoneyScore != null && (
      <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
        SMS {Number(trade.smartMoneyScore).toFixed(1)}
      </Badge>
    )}
  </div>
)

// ─── Loading Skeleton Rows ───────────────────────────────────────────────────

const TableSkeletonRows = ({ cols }: { cols: number }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)

// ─── Trades Table ─────────────────────────────────────────────────────────────

const TradesTable = ({
  trades,
  showCloseButton,
  onClose,
  isClosing,
  closingId,
  loading,
}: {
  trades: DemoTrade[]
  showCloseButton: boolean
  onClose?: (id: number) => void
  isClosing?: boolean
  closingId?: number | null
  loading?: boolean
}) => {
  const colCount = showCloseButton ? 10 : 9
  const [confirmTrade, setConfirmTrade] = useState<DemoTrade | null>(null)

  if (!loading && trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No trades found</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {showCloseButton
              ? "Simulate a trade from the Screener page."
              : "Closed trades will appear here."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-4 font-semibold">Symbol</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">
                Entry Price
              </TableHead>
              <TableHead className="text-right font-semibold">
                Current
              </TableHead>
              <TableHead className="text-right font-semibold">Qty</TableHead>
              <TableHead className="text-right font-semibold">
                Buy Value
              </TableHead>
              <TableHead className="text-right font-semibold">PnL</TableHead>
              <TableHead className="font-semibold">Signals</TableHead>
              <TableHead className="font-semibold">Entry Time</TableHead>
              {showCloseButton && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows cols={colCount} />
            ) : (
              trades.map((trade) => {
                const isPnlPositive = trade.pnl >= 0
                return (
                  <TableRow
                    key={trade.id}
                    className={cn(
                      "transition-colors",
                      isPnlPositive
                        ? "hover:bg-green-500/3"
                        : "hover:bg-red-500/3"
                    )}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "h-8 w-1 shrink-0 rounded-full",
                            isPnlPositive ? "bg-green-500" : "bg-red-500"
                          )}
                        />
                        <div>
                          <div className="text-sm font-semibold">
                            {trade.symbol}
                          </div>
                          {trade.ticker.name && (
                            <div className="max-w-30 truncate text-xs text-muted-foreground">
                              {trade.ticker.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={trade.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {fmtPrice(trade.entryPrice)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm font-medium tabular-nums",
                        isPnlPositive ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {fmtPrice(trade.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {trade.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="text-sm font-medium">
                        {fmtIDR(trade.entryPrice * trade.quantity * 100)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <PnlCell pnl={trade.pnl} pnlPercent={trade.pnlPercent} />
                    </TableCell>
                    <TableCell>
                      <SignalBadges trade={trade} />
                    </TableCell>
                    <TableCell>
                      <div className="text-xs whitespace-nowrap text-muted-foreground">
                        {format(new Date(trade.entryTime), "dd MMM yy")}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(trade.entryTime), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    {showCloseButton && (
                      <TableCell className="pr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-destructive/30 px-2 text-xs text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                          disabled={isClosing && closingId === trade.id}
                          onClick={() => setConfirmTrade(trade)}
                        >
                          {isClosing && closingId === trade.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Close
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!confirmTrade}
        onOpenChange={(open) => !open && setConfirmTrade(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutup Posisi?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="w-full space-y-3">
                <p>Apakah kamu yakin ingin menutup posisi ini?</p>
                {confirmTrade && (
                  <div className="w-full space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol</span>
                      <span className="font-semibold">
                        {confirmTrade.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Price</span>
                      <span className="font-mono">
                        {fmtPrice(confirmTrade.entryPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current Price
                      </span>
                      <span
                        className={cn(
                          "font-mono font-medium",
                          confirmTrade.pnl >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {fmtPrice(confirmTrade.currentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Unrealised PnL
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          confirmTrade.pnl >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {fmtCurrency(confirmTrade.pnl)} (
                        {confirmTrade.pnl >= 0 ? "+" : ""}
                        {confirmTrade.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer bg-destructive text-white hover:bg-red-500 hover:text-white hover:opacity-90">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground cursor-pointer"
              onClick={() => {
                if (confirmTrade) {
                  onClose?.(confirmTrade.id)
                  setConfirmTrade(null)
                }
              }}
            >
              Ya, Tutup Posisi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── History Summary Bar ──────────────────────────────────────────────────────

const HistorySummary = ({ trades }: { trades: DemoTrade[] }) => {
  const pnl = trades.reduce((s, t) => s + t.pnl, 0)
  const wins = trades.filter((t) => t.pnl > 0).length
  const losses = trades.filter((t) => t.pnl < 0).length
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
  const avgPnl = trades.length > 0 ? pnl / trades.length : 0

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="Closed Trades"
        value={trades.length}
        icon={History}
        sub={`${wins}W / ${losses}L`}
      />
      <StatCard
        label="Realised PnL"
        value={fmtCurrency(pnl)}
        icon={Wallet}
        valueClass={pnl >= 0 ? "text-green-500" : "text-red-500"}
        sub={`${fmtIDR(pnl)} · avg ${fmtIDR(avgPnl)}`}
      />
      <StatCard
        label="Win Rate"
        value={`${winRate.toFixed(0)}%`}
        icon={Percent}
        valueClass={
          winRate >= 50
            ? "text-green-500"
            : winRate > 0
              ? "text-yellow-500"
              : undefined
        }
        sub={`${wins} winning trades`}
      />
      <StatCard
        label="Best Trade"
        value={
          trades.length > 0
            ? trades.reduce((b, t) => (t.pnlPercent > b.pnlPercent ? t : b))
                .symbol
            : "—"
        }
        icon={Trophy}
        valueClass="text-green-500"
        sub={
          trades.length > 0
            ? `+${trades.reduce((b, t) => (t.pnlPercent > b.pnlPercent ? t : b)).pnlPercent.toFixed(2)}%`
            : undefined
        }
      />
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

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Demo Trading</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Simulate &amp; track trades from screener signals — no real money.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSnapshotting}
            onClick={() => handleSnapshot()}
          >
            {isSnapshotting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            Capture Snapshots
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
            }
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <Separator />

      {/* Summary */}
      <SummaryCards trades={activeTrades} loading={loadingActive} />

      {/* Tabs */}
      <Tabs defaultValue="active" className="gap-4">
        <TabsList className="h-9">
          <TabsTrigger value="active" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Active Trades
            {!loadingActive && activeTrades.length > 0 && (
              <Badge className="ml-0.5 h-4 min-w-4 border-emerald-500/30 bg-emerald-500/20 px-1 text-[10px] text-emerald-500">
                {activeTrades.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            History
            {!loadingHistory && historyTrades.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 min-w-4 px-1 text-[10px]"
              >
                {historyTrades.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <TradesTable
            trades={activeTrades}
            showCloseButton
            onClose={(id) => handleClose(id)}
            isClosing={isClosing}
            closingId={closingId}
            loading={loadingActive}
          />
        </TabsContent>

        <TabsContent value="history">
          {!loadingHistory && historyTrades.length > 0 && (
            <HistorySummary trades={historyTrades} />
          )}
          <TradesTable
            trades={historyTrades}
            showCloseButton={false}
            loading={loadingHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
