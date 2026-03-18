import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmtCurrency, fmtIDR } from "@/lib/format"

interface PnlCellProps {
  pnl: number
  pnlPercent: number
}

export const PnlCell = ({ pnl, pnlPercent }: PnlCellProps) => {
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
