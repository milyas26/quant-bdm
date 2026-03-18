import type { DemoTrade } from "@/lib/api"
import { StatCard } from "./stat-card"
import { fmtCurrency, fmtIDR } from "@/lib/format"
import { History, Wallet, Percent, Trophy } from "lucide-react"

interface HistorySummaryProps {
  trades: DemoTrade[]
}

export const HistorySummary = ({ trades }: HistorySummaryProps) => {
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
