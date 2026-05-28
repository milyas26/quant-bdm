import type { DemoTrade } from "@/lib/api"
import { StatCard } from "./stat-card"
import { fmtCurrency, fmtIDR } from "@/lib/format"
import { Activity, Wallet, Percent, Trophy } from "lucide-react"

interface SummaryCardsProps { trades: DemoTrade[]; loading?: boolean }

export const SummaryCards = ({ trades, loading }: SummaryCardsProps) => {
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
  const winners = trades.filter((t) => t.pnl > 0).length
  const winRate = trades.length > 0 ? (winners / trades.length) * 100 : 0
  const bestTrade = trades.reduce(
    (best, t) => (t.pnlPercent > (best?.pnlPercent ?? -Infinity) ? t : best),
    null as DemoTrade | null
  )

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Open Positions" value={trades.length} icon={Activity} loading={loading}
        sub={trades.length === 1 ? "1 active trade" : `${trades.length} active trades`} />
      <StatCard label="Unrealised PnL" value={fmtCurrency(totalPnl)} icon={Wallet} loading={loading}
        valueClass={totalPnl >= 0 ? "text-positive" : "text-negative"} sub={fmtIDR(totalPnl)} />
      <StatCard label="Win Rate" value={`${winRate.toFixed(0)}%`} icon={Percent} loading={loading}
        valueClass={winRate >= 50 ? "text-positive" : winRate > 0 ? "text-warning" : undefined}
        sub={`${winners} of ${trades.length} profitable`} />
      <StatCard label="Best Performer" value={bestTrade?.symbol ?? "—"} icon={Trophy} loading={loading}
        valueClass={bestTrade ? "text-positive" : undefined}
        sub={bestTrade ? `+${bestTrade.pnlPercent.toFixed(2)}% return` : "no trades yet"} />
    </div>
  )
}
