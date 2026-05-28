import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmtCurrency, fmtIDR } from "@/lib/format"

interface PnlCellProps { pnl: number; pnlPercent: number }

export const PnlCell = ({ pnl, pnlPercent }: PnlCellProps) => {
  const positive = pnl >= 0
  return (
    <div className={cn("flex flex-col items-end font-mono tabular-nums", positive ? "text-positive" : "text-negative")}>
      <span className="flex items-center gap-1 text-sm font-semibold">
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {fmtCurrency(pnl)}
      </span>
      <span className="text-[10px] opacity-70">{positive ? "+" : ""}{pnlPercent.toFixed(2)}%</span>
      <span className="text-[10px] opacity-50">{fmtIDR(pnl)}</span>
    </div>
  )
}
