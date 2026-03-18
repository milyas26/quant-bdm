import type { DemoTrade } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface SignalBadgesProps {
  trade: DemoTrade
}

export const SignalBadges = ({ trade }: SignalBadgesProps) => (
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
