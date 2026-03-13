import { useQuery } from "@tanstack/react-query"
import { getBrokerPositionChart } from "@/lib/apis/broker-summary/broker-summary-api"
import { HistoricalPriceChart } from "./historical-price-chart"
import { Loader2 } from "lucide-react"

interface BrokerInventoryAnalysisProps {
  symbol: string
  height?: number
  period?: "1 month" | "3 month" | "6 month"
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
  height = 500,
  period = "3 month",
}: BrokerInventoryAnalysisProps) {
  const startDate = new Date()
  switch (period) {
    case "1 month":
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case "3 month":
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "6 month":
      startDate.setMonth(startDate.getMonth() - 6)
      break
  }
  const from = startDate.toISOString().split("T")[0]

  const { data, isLoading, error } = useQuery({
    queryKey: ["broker-position-chart", symbol, period],
    queryFn: () => getBrokerPositionChart(symbol, from),
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

  const accumulators = (data.topAccumulators || []).map((broker, index) => {
    // Calculate total net for this broker
    const brokerData = data.data.map((item) => Number(item[broker] || 0))
    const totalNet = brokerData[brokerData.length - 1] // The last value is the cumulative total

    return {
      label: broker,
      data: data.data.map((item) => ({
        date: item.date,
        value: Number(item[broker] || 0),
      })),
      color: BROKER_COLORS[index % BROKER_COLORS.length],
      group: "Net Akum",
      totalNet: totalNet,
    }
  })

  const distributors = (data.topDistributors || []).map((broker, index) => {
    // Calculate total net for this broker
    const brokerData = data.data.map((item) => Number(item[broker] || 0))
    const totalNet = brokerData[brokerData.length - 1] // The last value is the cumulative total

    return {
      label: broker,
      data: data.data.map((item) => ({
        date: item.date,
        value: Number(item[broker] || 0),
      })),
      color: BROKER_COLORS[(index + 5) % BROKER_COLORS.length],
      group: "Net Dist",
      totalNet: totalNet,
    }
  })

  const inventoryDatasets = [...accumulators, ...distributors]

  return (
    <HistoricalPriceChart
      data={historicalData}
      inventoryDatasets={inventoryDatasets}
      title={`Broker Inventory Analysis - ${symbol}`}
      height={height}
    />
  )
}
