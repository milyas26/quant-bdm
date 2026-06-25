import type { PortfolioSummary, PortfolioSnapshot } from "@/lib/api"
import { fmtIDR, fmtCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, PiggyBank, TrendingUp, BarChart3 } from "lucide-react"

interface PortfolioBalanceProps {
  summary: PortfolioSummary | null
  history: PortfolioSnapshot[]
  loading?: boolean
}

export const PortfolioBalance = ({
  summary,
  history,
  loading,
}: PortfolioBalanceProps) => {
  const allocationPercent = summary
    ? Math.min((summary.totalAllocated / summary.initialCapital) * 100, 100)
    : 0

  const equityHistory = history.map((s) => s.equity)
  const minEquity = equityHistory.length > 0 ? Math.min(...equityHistory) : 0
  const maxEquity = equityHistory.length > 0 ? Math.max(...equityHistory) : 0
  const rangeEquity = maxEquity - minEquity || 1

  if (loading) {
    return (
      <div className="rounded-sm border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex flex-1 items-center gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center rounded-sm border border-border bg-card py-8">
        <p className="font-mono text-xs text-muted-foreground">
          No portfolio data
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Equity
            </span>
          </div>
          <p
            className={cn(
              "mt-1 font-mono text-xl font-bold tabular-nums",
              summary.totalEquity >= summary.initialCapital
                ? "text-positive"
                : "text-negative"
            )}
          >
            {fmtIDR(summary.totalEquity)}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-[11px] font-semibold tabular-nums",
                summary.totalReturn >= 0 ? "text-positive" : "text-negative"
              )}
            >
              {summary.totalReturn >= 0 ? "+" : ""}
              {summary.totalReturn.toFixed(2)}%
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              dari {fmtIDR(summary.initialCapital)}
            </span>
          </div>

          {equityHistory.length > 1 && (
            <div className="mt-3 flex items-end gap-0.5" style={{ height: 32 }}>
              {equityHistory.map((val, i) => {
                const h = ((val - minEquity) / rangeEquity) * 100
                return (
                  <div
                    key={i}
                    className="w-1 rounded-t-[1px] bg-primary/60"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-sm border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <PiggyBank className="h-3 w-3" />
              Available
            </div>
            <p
              className={cn(
                "mt-0.5 font-mono text-sm font-bold tabular-nums",
                summary.availableBalance >= 0
                  ? "text-positive"
                  : "text-negative"
              )}
            >
              {fmtIDR(summary.availableBalance)}
            </p>
          </div>

          <div className="rounded-sm border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              Allocated
            </div>
            <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-muted-foreground">
              {fmtIDR(summary.totalAllocated)}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/60">
              {allocationPercent.toFixed(0)}% deployed
            </p>
          </div>

          <div className="rounded-sm border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              PnL
            </div>
            <p
              className={cn(
                "mt-0.5 font-mono text-sm font-bold tabular-nums",
                summary.totalUnrealizedPnL + summary.totalRealizedPnL >= 0
                  ? "text-positive"
                  : "text-negative"
              )}
            >
              {fmtCurrency(
                summary.totalUnrealizedPnL + summary.totalRealizedPnL
              )}
            </p>
            <div className="flex gap-2 text-[10px] font-mono text-muted-foreground/60">
              <span>
                U: {fmtCurrency(summary.totalUnrealizedPnL)}
              </span>
              <span>
                R: {fmtCurrency(summary.totalRealizedPnL)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
