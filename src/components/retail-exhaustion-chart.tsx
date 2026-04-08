import { useQuery } from "@tanstack/react-query"
import { getRetailExhaustion } from "@/lib/apis/broker-summary/broker-summary-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"

interface RetailExhaustionChartProps {
  symbol: string
  period?: string
}

export function RetailExhaustionChart({
  symbol,
  period = "3 month",
}: RetailExhaustionChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["retail-exhaustion", symbol, period],
    queryFn: () => getRetailExhaustion(symbol, period),
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
        Failed to load retail exhaustion data
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Retail Exhaustion ({data.summary.broker})
          </CardTitle>
          <Badge variant={data.summary.isExhausted ? "default" : "secondary"}>
            {data.summary.isExhausted ? "EXHAUSTED" : "Active"}
          </Badge>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Current: {data.summary.currentHolding.toLocaleString()} lot</span>
          <span>Peak: {data.summary.peakHolding.toLocaleString()} lot</span>
          <span>Exhaustion: {data.summary.exhaustionPct.toFixed(1)}%</span>
        </div>
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
            <YAxis yAxisId="lot" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="lot"
              dataKey="dailyNetLot"
              fill="#8884d8"
              name="Daily Net Lot"
              opacity={0.6}
            />
            <Line
              yAxisId="lot"
              type="monotone"
              dataKey="cumulativeNetLot"
              stroke="#2563eb"
              strokeWidth={2}
              name="Cumulative Lot"
              dot={false}
            />
            <Line
              yAxisId="pct"
              type="monotone"
              dataKey="exhaustionPct"
              stroke="#ef4444"
              strokeWidth={2}
              name="Exhaustion %"
              dot={false}
            />
            <ReferenceLine yAxisId="pct" y={50} stroke="#f59e0b" strokeDasharray="3 3" label="50%" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
