import type { DemoTrade } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/indicators"
import { ScoreBadge } from "@/components/indicators"

interface SignalBadgesProps {
  trade: DemoTrade
}

export const SignalBadges = ({ trade }: SignalBadgesProps) => (
  <div className="flex min-w-20 flex-col gap-1">
    <div className="flex flex-wrap gap-1">
      {trade.isBreakout && (
        <Badge
          variant="outline"
          className="text-positive h-4 rounded-sm border-emerald-400/20 bg-emerald-400/10 px-1 py-0 font-mono text-[9px]"
        >
          BO
        </Badge>
      )}
      {trade.isVolumeSpike && (
        <span className="text-warning rounded-sm bg-amber-400/10 px-1 font-mono text-[9px] font-medium">
          Spike
        </span>
      )}
    </div>
    {trade.bandarStatus && (
      <div>
        <StatusBadge status={trade.bandarStatus} />
      </div>
    )}
    {trade.smartMoneyScore != null && (
      <div className="flex items-center gap-1 font-mono text-[9px]">
        <span className="text-muted-foreground">Scr:</span>
        <ScoreBadge
          score={Number(trade.smartMoneyScore)}
          className="text-[9px]"
        />
      </div>
    )}
  </div>
)
