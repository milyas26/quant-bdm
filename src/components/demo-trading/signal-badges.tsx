import type { DemoTrade } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SignalBadgesProps {
  trade: DemoTrade
}

export const SignalBadges = ({ trade }: SignalBadgesProps) => (
  <div className="flex flex-col gap-1.5 min-w-[80px]">
    <div className="flex flex-wrap gap-1">
      {trade.isBreakout && (
        <Badge
          variant="outline"
          className="h-4 border-orange-200 bg-orange-50 px-1 py-0 text-[10px] font-normal text-orange-600"
        >
          Breakout
        </Badge>
      )}
      {trade.isVolumeSpike && (
        <span className="text-[10px] font-bold text-orange-600">🔥Spike</span>
      )}
    </div>
    
    <div className="flex items-center gap-2">
      {trade.bandarStatus && (
        <Badge
          variant="outline"
          className={cn(
            "h-4 px-1 py-0 text-[10px] font-normal",
            trade.bandarStatus === "Accumulation" && "border-green-200 bg-green-50 text-green-700",
            trade.bandarStatus === "Distribution" && "border-red-200 bg-red-50 text-red-700",
            trade.bandarStatus === "Neutral" && "border-gray-200 bg-gray-50 text-gray-700"
          )}
        >
          {trade.bandarStatus}
        </Badge>
      )}
    </div>
    
    {trade.smartMoneyScore != null && (
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-muted-foreground/70">Scr:</span>
        <span className={cn(
          "font-bold",
          Number(trade.smartMoneyScore) >= 70 ? "text-green-600" : Number(trade.smartMoneyScore) <= 30 ? "text-red-600" : "text-yellow-600"
        )}>
          {Number(trade.smartMoneyScore).toFixed(0)}
        </span>
      </div>
    )}
  </div>
)
