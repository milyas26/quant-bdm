import type { DemoTrade } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/indicators"
import { ScoreBadge } from "@/components/indicators"

interface SignalBadgesProps { trade: DemoTrade }

export const SignalBadges = ({ trade }: SignalBadgesProps) => (
  <div className="flex flex-col gap-1 min-w-20">
    <div className="flex flex-wrap gap-1">
      {trade.isBreakout && (
        <Badge variant="outline" className="h-4 rounded-sm border-emerald-400/20 bg-emerald-400/10 px-1 py-0 text-[9px] font-mono text-positive">BO</Badge>
      )}
      {trade.isVolumeSpike && (
        <span className="text-[9px] font-mono font-medium text-warning bg-amber-400/10 px-1 rounded-sm">Spike</span>
      )}
    </div>
    {trade.bandarStatus && (
      <StatusBadge status={trade.bandarStatus} />
    )}
    {trade.smartMoneyScore != null && (
      <div className="flex items-center gap-1 text-[9px] font-mono">
        <span className="text-muted-foreground">Scr:</span>
        <ScoreBadge score={Number(trade.smartMoneyScore)} className="text-[9px]" />
      </div>
    )}
  </div>
)
