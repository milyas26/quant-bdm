import { useQuery } from "@tanstack/react-query"
import { getCohesionAnalysis } from "@/lib/apis/broker-summary/broker-summary-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"

interface CohesionAnalysisChartProps {
  symbol: string
  period?: string
}

export function CohesionAnalysisChart({
  symbol,
  period = "1 month",
}: CohesionAnalysisChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cohesion-analysis", symbol, period],
    queryFn: () => getCohesionAnalysis(symbol, period),
    enabled: !!symbol,
  })

  if (isLoading) {
    return (
      <div className="flex h-75 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-75 w-full items-center justify-center text-muted-foreground">
        Failed to load cohesion analysis data
      </div>
    )
  }

  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(1)}B`
    if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`
    return val.toFixed(0)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Cohesion Analysis (Door 3)
          </CardTitle>
          <div className="flex gap-2">
            {data.summary.isImposterMove && (
              <Badge variant="destructive">Imposter Move</Badge>
            )}
            <Badge variant="outline">
              Cohesion: {data.summary.cohesionScore.toFixed(0)}%
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Aligned: {data.summary.alignedDays}/{data.summary.totalDays} days</span>
          <span>Contrarian: {data.summary.contrarianDays} days</span>
          <span>Avg SM: {data.summary.avgSmPct.toFixed(1)}%</span>
          <span>Avg Retail: {data.summary.avgRetailPct.toFixed(1)}%</span>
        </div>
        <p className="text-xs italic text-muted-foreground">
          {data.summary.interpretation}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={formatValue} />
            <Tooltip
              formatter={(value) => {
                const num = typeof value === 'number' ? value : Number(value)
                return [isNaN(num) ? value : formatValue(num)]
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#666" />
            <Bar
              dataKey="smNetVal"
              fill="#22c55e"
              name="Smart Money Net"
              opacity={0.7}
            />
            <Bar
              dataKey="retailNetVal"
              fill="#ef4444"
              name="Retail Net"
              opacity={0.7}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
