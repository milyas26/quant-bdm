import { useQuery } from "@tanstack/react-query"
import { getBrokerPositionChart } from "@/lib/apis/broker-summary/broker-summary-api"
import { HistoricalPriceChart } from "./historical-price-chart"
import { Loader2 } from "lucide-react"

interface BrokerInventoryAnalysisProps {
  symbol: string
}

const BROKER_COLORS = [
  "rgb(255, 99, 132)", // Red
  "rgb(54, 162, 235)", // Blue
  "rgb(255, 206, 86)", // Yellow
  "rgb(75, 192, 192)", // Green
  "rgb(153, 102, 255)", // Purple
  "rgb(255, 159, 64)", // Orange
  "rgb(199, 199, 199)", // Grey
  "rgb(83, 102, 255)", // Indigo
  "rgb(255, 99, 255)", // Magenta
  "rgb(99, 255, 132)", // Lime
]

export function BrokerInventoryAnalysis({
  symbol,
}: BrokerInventoryAnalysisProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["broker-position-chart", symbol],
    queryFn: () => getBrokerPositionChart(symbol),
    enabled: !!symbol,
  })

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-muted-foreground">
        Failed to load chart data
      </div>
    )
  }

  const historicalData = data.data.map((item) => ({
    id: 0,
    symbol: symbol,
    date: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
    change_percentage: item.change_percentage || 0,
    // Add dummy values for required fields not used by chart
    change: 0,
    value: 0,
    frequency: 0,
    foreign_buy: 0,
    foreign_sell: 0,
    net_foreign: 0,
    average: 0,
    created_at: "",
    updated_at: "",
  }))

  const accumulators = (data.topAccumulators || []).map((broker, index) => ({
    label: broker,
    data: data.data.map((item) => ({
      date: item.date,
      value: Number(item[broker] || 0),
    })),
    color: BROKER_COLORS[index % BROKER_COLORS.length],
    group: "Net Akum",
  }))

  const distributors = (data.topDistributors || []).map((broker, index) => ({
    label: broker,
    data: data.data.map((item) => ({
      date: item.date,
      value: Number(item[broker] || 0),
    })),
    color: BROKER_COLORS[(index + 5) % BROKER_COLORS.length],
    group: "Net Dist",
  }))

  const inventoryDatasets = [...accumulators, ...distributors]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Broker Inventory Analysis</h3>
      </div>
      <HistoricalPriceChart
        data={historicalData}
        inventoryDatasets={inventoryDatasets}
        title={`Broker Inventory Analysis - ${symbol}`}
        height={500}
      />
    </div>
  )
}
