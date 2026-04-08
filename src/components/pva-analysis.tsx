import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PvaAnalysisProps {
  pvaTrend: string | null
  pvaScore: number | null
  volumeAnomaly: string | null
  correctionHealth: number | null
  volumeDistributionRisk: boolean | null
  volumeChangeRatio: number | null
  washTradingRisk: string | null
  washTradingScore: number | null
  distributionRisk: number | null
  repoPatternDetected: boolean | null
}

export function PvaAnalysis({
  pvaTrend,
  pvaScore,
  volumeAnomaly,
  correctionHealth,
  volumeDistributionRisk,
  volumeChangeRatio,
  washTradingRisk,
  washTradingScore,
  distributionRisk,
  repoPatternDetected,
}: PvaAnalysisProps) {
  if (!pvaTrend && pvaScore === null) {
    return null
  }

  const pvaTrendColor =
    pvaTrend === "UPTREND"
      ? "text-green-600"
      : pvaTrend === "DOWNTREND"
        ? "text-red-600"
        : pvaTrend === "MIXED"
          ? "text-orange-500"
          : "text-gray-500"

  const volumeAnomalyVariant =
    volumeAnomaly === "EXTREME"
      ? "destructive"
      : volumeAnomaly === "STRONG"
        ? "default"
        : volumeAnomaly === "MILD"
          ? "secondary"
          : "outline"

  const washTradingColor =
    washTradingRisk === "HIGH"
      ? "text-red-600"
      : washTradingRisk === "MEDIUM"
        ? "text-orange-500"
        : "text-green-600"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Remora Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {/* PVA Trend */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">PVA Trend</p>
            <p className={cn("text-sm font-semibold", pvaTrendColor)}>
              {pvaTrend || "-"}
            </p>
            {pvaScore !== null && (
              <p className="text-xs text-muted-foreground">
                Score: {pvaScore.toFixed(0)}%
              </p>
            )}
          </div>

          {/* Volume Anomaly */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Volume Anomaly</p>
            <Badge variant={volumeAnomalyVariant as any}>
              {volumeAnomaly || "NONE"}
            </Badge>
            {volumeChangeRatio !== null && (
              <p className="text-xs text-muted-foreground">
                {volumeChangeRatio.toFixed(1)}x avg
              </p>
            )}
          </div>

          {/* Correction Health */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Correction Health</p>
            <p
              className={cn(
                "text-sm font-semibold",
                correctionHealth !== null && correctionHealth < 0.8
                  ? "text-green-600"
                  : correctionHealth !== null && correctionHealth > 1.2
                    ? "text-red-600"
                    : "text-yellow-600"
              )}
            >
              {correctionHealth !== null ? correctionHealth.toFixed(2) : "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {correctionHealth !== null && correctionHealth < 0.8
                ? "Healthy"
                : correctionHealth !== null && correctionHealth > 1.2
                  ? "Unhealthy"
                  : "Moderate"}
            </p>
          </div>

          {/* Wash Trading */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Wash Trading</p>
            <p className={cn("text-sm font-semibold", washTradingColor)}>
              {washTradingRisk || "-"}
            </p>
            {washTradingScore !== null && (
              <p className="text-xs text-muted-foreground">
                Score: {washTradingScore.toFixed(0)}%
              </p>
            )}
          </div>

          {/* Distribution Risk */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Distribution Risk</p>
            <p
              className={cn(
                "text-sm font-semibold",
                distributionRisk !== null && distributionRisk > 60
                  ? "text-red-600"
                  : distributionRisk !== null && distributionRisk > 30
                    ? "text-orange-500"
                    : "text-green-600"
              )}
            >
              {distributionRisk !== null ? `${distributionRisk.toFixed(0)}%` : "-"}
            </p>
          </div>

          {/* Volume Distribution Risk */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Vol Dist. Risk</p>
            <Badge variant={volumeDistributionRisk ? "destructive" : "outline"}>
              {volumeDistributionRisk ? "DETECTED" : "Clear"}
            </Badge>
          </div>

          {/* Repo Pattern */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Repo Pattern</p>
            <Badge variant={repoPatternDetected ? "destructive" : "outline"}>
              {repoPatternDetected ? "DETECTED" : "Clear"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
