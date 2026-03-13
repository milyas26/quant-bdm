import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { HistoricalPriceChart } from "./historical-price-chart"

interface HistoricalScreenerProps {
  data: any[]
  months: number
  onMonthsChange: (months: number) => void
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload
    return (
      <div className="flex w-[280px] flex-col gap-1 rounded-md border bg-background p-2 shadow-md">
        <div className="flex items-center justify-between border-b pb-1">
          <span className="text-xs font-semibold">
            {format(new Date(item.date), "dd MMM yyyy")}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "h-4 px-1 text-[9px] font-normal",
                item.momentum === "Uptrend" &&
                  "border-green-200 bg-green-50 text-green-700",
                item.momentum === "Downtrend" &&
                  "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {item.momentum}
            </Badge>
            <span
              className={cn(
                "text-[10px] font-bold",
                item.smartMoneyScore >= 70
                  ? "text-green-600"
                  : item.smartMoneyScore <= 30
                    ? "text-red-600"
                    : "text-yellow-600"
              )}
            >
              Score: {item.smartMoneyScore.toFixed(0)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{item.price.toLocaleString()}</span>
              <span
                className={cn(
                  item.changePercentage > 0
                    ? "text-green-600"
                    : item.changePercentage < 0
                      ? "text-red-600"
                      : "text-gray-600"
                )}
              >
                ({item.changePercentage > 0 ? "+" : ""}
                {item.changePercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Vol</span>
            <div className="flex items-center gap-1">
              <span>
                {new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(item.volume)}
              </span>
              {item.isVolumeSpike && (
                <span className="font-bold text-orange-500">🔥</span>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Net</span>
            <span
              className={cn(
                "font-medium",
                item.netBrokerFlow > 0
                  ? "text-green-600"
                  : item.netBrokerFlow < 0
                    ? "text-red-600"
                    : "text-gray-600"
              )}
            >
              {item.netBrokerFlow > 0 ? "+" : ""}
              {new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(item.netBrokerFlow)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge
              className={cn(
                "h-3.5 px-1 text-[9px] font-normal",
                item.bandarStatus === "Accumulation" &&
                  "bg-green-100 text-green-800 hover:bg-green-100",
                item.bandarStatus === "Distribution" &&
                  "bg-red-100 text-red-800 hover:bg-red-100",
                item.bandarStatus === "Neutral" &&
                  "bg-gray-100 text-gray-800 hover:bg-gray-100"
              )}
            >
              {item.bandarStatus === "Accumulation"
                ? "Acc"
                : item.bandarStatus === "Distribution"
                  ? "Dist"
                  : item.bandarStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-1 text-[9px]">
          <span className="text-muted-foreground">Acc/Dist:</span>
          <div className="flex gap-1.5">
            <span
              className={cn(
                item.accumulationDistribution.d1 > 0
                  ? "text-green-600"
                  : item.accumulationDistribution.d1 < 0
                    ? "text-red-600"
                    : "text-gray-600"
              )}
            >
              D1: {item.accumulationDistribution.d1.toFixed(1)}%
            </span>
            <span
              className={cn(
                item.accumulationDistribution.w1 > 0
                  ? "text-green-600"
                  : item.accumulationDistribution.w1 < 0
                    ? "text-red-600"
                    : "text-gray-600"
              )}
            >
              W1: {item.accumulationDistribution.w1.toFixed(1)}%
            </span>
            <span
              className={cn(
                item.accumulationDistribution.m1 > 0
                  ? "text-green-600"
                  : item.accumulationDistribution.m1 < 0
                    ? "text-red-600"
                    : "text-gray-600"
              )}
            >
              M1: {item.accumulationDistribution.m1.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Top Buyer/Seller */}
        <div className="flex flex-col gap-1 border-t pt-1 text-[9px]">
          <div className="flex w-full justify-between gap-2">
            <div className="flex w-1/2 flex-col gap-0.5">
              <span className="text-[8px] font-semibold text-muted-foreground">
                Top Buyers
              </span>
              {item.topBuyers && item.topBuyers.length > 0 ? (
                item.topBuyers.map((buyer: any, idx: number) => (
                  <div
                    key={`buyer-${idx}`}
                    className="flex items-center justify-between"
                  >
                    <span className="font-bold text-green-700">
                      {buyer.code}
                    </span>
                    <span className="text-green-600">
                      {new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(buyer.net)}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[8px] text-muted-foreground">-</span>
              )}
            </div>
            <div className="flex w-1/2 flex-col gap-0.5 border-l pl-2">
              <span className="text-[8px] font-semibold text-muted-foreground">
                Top Sellers
              </span>
              {item.topSellers && item.topSellers.length > 0 ? (
                item.topSellers.map((seller: any, idx: number) => (
                  <div
                    key={`seller-${idx}`}
                    className="flex items-center justify-between"
                  >
                    <span className="font-bold text-red-700">
                      {seller.code}
                    </span>
                    <span className="text-red-600">
                      {new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(seller.net)}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[8px] text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function HistoricalScreener({
  data,
  months,
  onMonthsChange,
}: HistoricalScreenerProps) {
  const [hoveredData, setHoveredData] = useState<any | null>(null)
  const [showCandlestick, setShowCandlestick] = useState(false)

  // Reverse data for chart (oldest to newest)
  const chartData = [...data].reverse()

  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No historical screener data available
      </div>
    )
  }

  const candlestickData = chartData.map((item) => ({
    id: 0, // dummy
    symbol: "SCREENER",
    date: item.date,
    open: item.ohlc?.open ?? item.price,
    high: item.ohlc?.high ?? item.price,
    low: item.ohlc?.low ?? item.price,
    close: item.ohlc?.close ?? item.price,
    volume: item.volume,
    change: 0,
    change_percentage: item.changePercentage,
    value: 0,
    frequency: 0,
    foreign_buy: 0,
    foreign_sell: 0,
    net_foreign: 0,
    average: 0,
    created_at: "",
    updated_at: "",
  }))

  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`col-span-9 h-[calc(100vh-280px)] ${showCandlestick ? "" : "rounded-md border p-4"}`}
      >
        <div className="mb-4 flex items-center justify-end space-x-2">
          <Label htmlFor="chart-type" className="text-xs">
            Line
          </Label>
          <Switch
            id="chart-type"
            checked={showCandlestick}
            onCheckedChange={setShowCandlestick}
          />
          <Label htmlFor="chart-type" className="text-xs">
            Candle
          </Label>
        </div>

        {showCandlestick ? (
          <HistoricalPriceChart
            data={candlestickData}
            inventoryDatasets={[
              {
                label: "Smart Money Score",
                data: chartData.map((d) => ({
                  date: d.date,
                  value: d.smartMoneyScore,
                })),
                color: "rgb(22, 163, 74)",
              },
            ]}
            height={700}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%" className="pb-4">
            <ComposedChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "dd MMM")}
                minTickGap={30}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                yAxisId="left"
                domain={["auto", "auto"]}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#666",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="smartMoneyScore"
                stroke="#16a34a"
                strokeWidth={1.5}
                dot={false}
              />
              {hoveredData && (
                <ReferenceLine
                  x={hoveredData.date}
                  stroke="#666"
                  strokeDasharray="3 3"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="col-span-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">History</span>
          <Select
            value={months.toString()}
            onValueChange={(val) => onMonthsChange(parseInt(val))}
          >
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Month</SelectItem>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex max-h-[calc(100vh-320px)] flex-col gap-1.5 overflow-y-auto pr-2">
          {data.map((item: any, index: number) => (
            <div
              key={`${item.date}-${index}`}
              className={cn(
                "flex flex-col gap-1 rounded-md border p-2 transition-colors hover:bg-muted/50",
                hoveredData?.date === item.date && "border-primary bg-muted"
              )}
              onMouseEnter={() => setHoveredData(item)}
              onMouseLeave={() => setHoveredData(null)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  {format(new Date(item.date), "dd MMM yyyy")}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 px-1 text-[9px] font-normal",
                      item.momentum === "Uptrend" &&
                        "border-green-200 bg-green-50 text-green-700",
                      item.momentum === "Downtrend" &&
                        "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {item.momentum}
                  </Badge>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      item.smartMoneyScore >= 70
                        ? "text-green-600"
                        : item.smartMoneyScore <= 30
                          ? "text-red-600"
                          : "text-yellow-600"
                    )}
                  >
                    Score: {item.smartMoneyScore.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {item.price.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        item.changePercentage > 0
                          ? "text-green-600"
                          : item.changePercentage < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      ({item.changePercentage > 0 ? "+" : ""}
                      {item.changePercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vol</span>
                  <div className="flex items-center gap-1">
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(item.volume)}
                    </span>
                    {item.isVolumeSpike && (
                      <span className="font-bold text-orange-500">🔥</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net</span>
                  <span
                    className={cn(
                      "font-medium",
                      item.netBrokerFlow > 0
                        ? "text-green-600"
                        : item.netBrokerFlow < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    {item.netBrokerFlow > 0 ? "+" : ""}
                    {new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(item.netBrokerFlow)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={cn(
                      "h-3.5 px-1 text-[9px] font-normal",
                      item.bandarStatus === "Accumulation" &&
                        "bg-green-100 text-green-800 hover:bg-green-100",
                      item.bandarStatus === "Distribution" &&
                        "bg-red-100 text-red-800 hover:bg-red-100",
                      item.bandarStatus === "Neutral" &&
                        "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    )}
                  >
                    {item.bandarStatus === "Accumulation"
                      ? "Acc"
                      : item.bandarStatus === "Distribution"
                        ? "Dist"
                        : item.bandarStatus}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-1 text-[9px]">
                <span className="text-muted-foreground">Acc/Dist:</span>
                <div className="flex gap-1.5">
                  <span
                    className={cn(
                      item.accumulationDistribution.d1 > 0
                        ? "text-green-600"
                        : item.accumulationDistribution.d1 < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    D1: {item.accumulationDistribution.d1.toFixed(1)}%
                  </span>
                  <span
                    className={cn(
                      item.accumulationDistribution.w1 > 0
                        ? "text-green-600"
                        : item.accumulationDistribution.w1 < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    W1: {item.accumulationDistribution.w1.toFixed(1)}%
                  </span>
                  <span
                    className={cn(
                      item.accumulationDistribution.m1 > 0
                        ? "text-green-600"
                        : item.accumulationDistribution.m1 < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    M1: {item.accumulationDistribution.m1.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
