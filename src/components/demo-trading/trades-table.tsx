import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import type { DemoTrade } from "@/lib/api"
import { fmtPrice, fmtIDR, fmtCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { getBrokerCodeClass } from "@/lib/utils"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, RefreshCw, X } from "lucide-react"
import { PnlCell } from "./pnl-cell"
import { StatusBadge } from "./status-badge"
import { SignalBadges } from "./signal-badges"
import { TableSkeletonRows } from "./table-skeleton-rows"
import { useNavigate } from "react-router-dom"

interface TradesTableProps {
  trades: DemoTrade[]
  showCloseButton: boolean
  onClose?: (symbol: string) => void
  isClosing?: boolean
  closingSymbol?: string | null
  loading?: boolean
}

export const TradesTable = ({ trades, showCloseButton, onClose, isClosing, closingSymbol, loading }: TradesTableProps) => {
  const colCount = showCloseButton ? 12 : 11
  const [confirmTrade, setConfirmTrade] = useState<DemoTrade | null>(null)
  const navigate = useNavigate()

  if (!loading && trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xs font-mono text-muted-foreground">No trades found</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-8 pl-3 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Symbol</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="h-8 text-right font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Entry</TableHead>
              <TableHead className="h-8 text-right font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current</TableHead>
              <TableHead className="h-8 text-right font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Qty</TableHead>
              <TableHead className="h-8 text-right font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Value</TableHead>
              <TableHead className="h-8 text-right font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">PnL</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Signals</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Brokers</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</TableHead>
              <TableHead className="h-8 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Entry Time</TableHead>
              {showCloseButton && <TableHead className="h-8 w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows cols={colCount} />
            ) : (
              trades.map((trade) => {
                const isPnlPositive = trade.pnl >= 0
                return (
                  <TableRow key={trade.id} className={cn("border-border transition-colors", isPnlPositive ? "hover:bg-emerald-400/5" : "hover:bg-red-400/5")}>
                    <TableCell className="py-2 pl-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-7 w-0.5 shrink-0 rounded-sm", isPnlPositive ? "bg-emerald-400" : "bg-red-400")} />
                        <div onClick={() => navigate(`/stock/${trade.symbol}`)} className="flex cursor-pointer items-center gap-2">
                          {(trade.ticker as any)?.logo ? (
                            <img src={(trade.ticker as any).logo} className="h-6 w-6 rounded-sm object-cover border border-border" />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted text-[10px] font-mono">{trade.symbol.substring(0, 2)}</div>
                          )}
                          <div>
                            <span className="text-[12px] font-mono font-bold">{trade.symbol}</span>
                            {trade.ticker.name && <span className="ml-1 text-[10px] text-muted-foreground truncate max-w-28">{trade.ticker.name}</span>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={trade.status} /></TableCell>
                    <TableCell className="text-right font-mono text-[12px] tabular-nums text-muted-foreground">{fmtPrice(trade.entryPrice)}</TableCell>
                    <TableCell className={cn("text-right font-mono text-[12px] font-bold tabular-nums", isPnlPositive ? "text-positive" : "text-negative")}>{fmtPrice(trade.currentPrice)}</TableCell>
                    <TableCell className="text-right font-mono text-[11px] tabular-nums">{trade.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">{fmtIDR(trade.entryPrice * trade.quantity * 100)}</TableCell>
                    <TableCell className="text-right"><PnlCell pnl={trade.pnl} pnlPercent={trade.pnlPercent} /></TableCell>
                    <TableCell><SignalBadges trade={trade} /></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1 max-w-32">
                        {trade.brokersBuy?.map((b: any, idx: number) => (
                          <span key={"b-" + idx} className={cn("px-1 py-0.5 text-[9px] font-mono rounded-sm", getBrokerCodeClass(b.netbsBrokerCode))}>{b.netbsBrokerCode}</span>
                        ))}
                        {trade.brokersSell?.map((b: any, idx: number) => (
                          <span key={"s-" + idx} className={cn("px-1 py-0.5 text-[9px] font-mono rounded-sm", getBrokerCodeClass(b.netbsBrokerCode))}>{b.netbsBrokerCode}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-36 truncate text-[10px] font-mono text-muted-foreground" title={trade.notes ?? undefined}>
                        {trade.notes || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] font-mono whitespace-nowrap text-muted-foreground">
                        {trade.screenerDate ? format(new Date(trade.screenerDate), "dd MMM yy") : format(new Date(trade.entryTime), "dd MMM yy")}
                      </div>
                      <div className="text-[9px] text-muted-foreground/50 font-mono">
                        {trade.screenerDate ? formatDistanceToNow(new Date(trade.screenerDate), { addSuffix: true }) : formatDistanceToNow(new Date(trade.entryTime), { addSuffix: true })}
                      </div>
                    </TableCell>
                    {showCloseButton && (
                      <TableCell className="pr-2">
                        <Button size="sm" variant="outline" className="h-6 rounded-sm border-destructive/30 px-1.5 text-[10px] font-mono text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                          disabled={isClosing && closingSymbol === trade.symbol} onClick={() => setConfirmTrade(trade)}>
                          {isClosing && closingSymbol === trade.symbol ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <X className="h-2.5 w-2.5" />}
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

      <AlertDialog open={!!confirmTrade} onOpenChange={(open) => !open && setConfirmTrade(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutup Posisi?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="w-full space-y-3">
                <p>
                  {confirmTrade && confirmTrade.positionCount > 1
                    ? `Apakah kamu yakin ingin menutup ${confirmTrade.positionCount} posisi ${confirmTrade.symbol} sekaligus?`
                    : "Apakah kamu yakin ingin menutup posisi ini?"}
                </p>
                {confirmTrade && (
                  <div className="w-full space-y-1.5 rounded-sm border border-border bg-card p-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Symbol</span><span className="font-semibold">{confirmTrade.symbol}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Entry</span><span className="font-mono">{fmtPrice(confirmTrade.entryPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className={cn("font-mono font-medium", confirmTrade.pnl >= 0 ? "text-positive" : "text-negative")}>{fmtPrice(confirmTrade.currentPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Unrealised PnL</span><span className={cn("font-semibold", confirmTrade.pnl >= 0 ? "text-positive" : "text-negative")}>{fmtCurrency(confirmTrade.pnl)} ({confirmTrade.pnl >= 0 ? "+" : ""}{confirmTrade.pnlPercent.toFixed(2)}%)</span></div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-sm">Batal</AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer rounded-sm" onClick={() => { if (confirmTrade) { onClose?.(confirmTrade.symbol); setConfirmTrade(null) } }}>Ya, Tutup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
