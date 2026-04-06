import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import type { DemoTrade } from "@/lib/api"
import { fmtPrice, fmtIDR, fmtCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
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
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BarChart2, RefreshCw, X } from "lucide-react"
import { PnlCell } from "./pnl-cell"
import { StatusBadge } from "./status-badge"
import { SignalBadges } from "./signal-badges"
import { TableSkeletonRows } from "./table-skeleton-rows"
import { useNavigate } from "react-router-dom"

interface TradesTableProps {
  trades: DemoTrade[]
  showCloseButton: boolean
  onClose?: (id: number) => void
  isClosing?: boolean
  closingId?: number | null
  loading?: boolean
}

export const TradesTable = ({
  trades,
  showCloseButton,
  onClose,
  isClosing,
  closingId,
  loading,
}: TradesTableProps) => {
  const colCount = showCloseButton ? 10 : 9
  const [confirmTrade, setConfirmTrade] = useState<DemoTrade | null>(null)
  const navigate = useNavigate()

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
                Price
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
                            "h-9 w-1 shrink-0 rounded-full",
                            isPnlPositive ? "bg-green-500" : "bg-red-500"
                          )}
                        />
                        <div
                          onClick={() => navigate(`/stock/${trade.symbol}`)}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          {(trade.ticker as any)?.logo ? (
                            <img src={(trade.ticker as any).logo} className="h-8 w-8 rounded-full object-cover border" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {trade.symbol.substring(0, 2)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{trade.symbol}</span>
                            {trade.ticker.name && (
                              <span className="max-w-[120px] truncate text-[10px] text-muted-foreground">{trade.ticker.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={trade.status} />
                    </TableCell>
                    <TableCell className="text-right flex flex-col font-mono text-sm tabular-nums gap-0.5 justify-center py-3">
                      <span className="font-medium text-muted-foreground decoration-muted-foreground/30">{fmtPrice(trade.entryPrice)}</span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right flex flex-col font-mono text-sm font-bold tabular-nums gap-0.5 justify-center py-3",
                        isPnlPositive ? "text-green-600" : "text-red-600"
                      )}
                    >
                      <span>{fmtPrice(trade.currentPrice)}</span>
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
                        {trade.screenerDate
                          ? format(new Date(trade.screenerDate), "dd MMM yy")
                          : format(new Date(trade.entryTime), "dd MMM yy")}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60">
                        {trade.screenerDate
                          ? formatDistanceToNow(new Date(trade.screenerDate), { addSuffix: true })
                          : formatDistanceToNow(new Date(trade.entryTime), { addSuffix: true })}
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
