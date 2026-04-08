import { useQuery } from "@tanstack/react-query"
import { getFloorPrice } from "@/lib/apis/broker-summary/broker-summary-api"
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
} from "recharts"

interface FloorPriceChartProps {
  symbol: string
  period?: string
}

export function FloorPriceChart({
  symbol,
  period = "3 month",
}: FloorPriceChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["floor-price", symbol, period],
    queryFn: () => getFloorPrice(symbol, period),
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
        Failed to load floor price data
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Smart Money Floor Price
          </CardTitle>
          <Badge variant={data.summary.isAboveFloor ? "default" : "destructive"}>
            {data.summary.isAboveFloor ? "Above Floor" : "Below Floor"}
          </Badge>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Floor: {data.summary.floorPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span>Current: {data.summary.latestPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span>Distance: {data.summary.distanceFromFloor.toFixed(1)}%</span>
          <span>SM Net Lot: {data.summary.smNetLot.toLocaleString()}</span>
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
            <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="lot"
              dataKey="smNetLot"
              fill="#22c55e"
              name="SM Daily Net Lot"
              opacity={0.6}
            />
            <Line
              yAxisId="lot"
              type="monotone"
              dataKey="cumulativeNetLot"
              stroke="#2563eb"
              strokeWidth={2}
              name="Cumulative Net Lot"
              dot={false}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="avgEntryPrice"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Avg Entry Price (Floor)"
              dot={false}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
