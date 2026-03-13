import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBrokerInventory } from "@/lib/api"
import { getHistoricalData } from "@/lib/apis/historical-data/historical-data-api"
import { cn, formatNumber, formatNumberWithDecimal } from "@/lib/utils"
import { BrokerInventoryChart } from "./broker-inventory-chart"
import { HistoricalPriceChart } from "./historical-price-chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BrokerInventoryProps {
  selectedTicker: string
}

type Period = "1 month" | "3 month" | "6 month"

const getStartDate = (period: Period) => {
  const date = new Date()
  switch (period) {
    case "1 month":
      date.setMonth(date.getMonth() - 1)
      break
    case "3 month":
      date.setMonth(date.getMonth() - 3)
      break
    case "6 month":
      date.setMonth(date.getMonth() - 6)
      break
  }
  return date.toISOString().split("T")[0]
}

const TYPE_MAP = {
  ASING: {
    lot: "netALot",
    val: "netAVal",
    avg: "avgNetAPrice",
    label: "Asing",
    color: "rgb(34, 197, 94)", // green-500
  },
  RITEL: {
    lot: "netRLot",
    val: "netRVal",
    avg: "avgNetRPrice",
    label: "Ritel",
    color: "rgb(239, 68, 68)", // red-500
  },
  LOKAL: {
    lot: "netLLot",
    val: "netLVal",
    avg: "avgNetLPrice",
    label: "Lokal",
    color: "rgb(59, 130, 246)", // blue-500
  },
  PEMERINTAH: {
    lot: "netPLot",
    val: "netPVal",
    avg: "avgNetPPrice",
    label: "Pemerintah",
    color: "rgb(249, 115, 22)", // orange-500
  },
  SMART_MONEY: {
    lot: "netSMLot",
    val: "netSMVal",
    avg: "avgNetSMPrice",
    label: "Smart Money",
    color: "rgb(168, 85, 247)", // purple-500
  },
  DUMB_MONEY: {
    lot: "netDMLot",
    val: "netDMVal",
    avg: "avgNetDMPrice",
    label: "Dumb Money",
    color: "rgb(100, 116, 139)", // slate-500
  },
} as const


const TYPE_ORDER: (keyof typeof TYPE_MAP)[] = [
  "SMART_MONEY",
  "ASING",
  "PEMERINTAH",
  "DUMB_MONEY",
  "RITEL",
  "LOKAL",
]

export function BrokerInventory({ selectedTicker }: BrokerInventoryProps) {
  const [period, setPeriod] = useState<Period>("3 month")
  const [showRunningBalance, setShowRunningBalance] = useState(true)

  const {
    data: brokerInventory,
    isError,
    error,
  } = useQuery({
    queryKey: ["broker-inventory", selectedTicker, period],
    queryFn: () => getBrokerInventory(selectedTicker, period),
    enabled: !!selectedTicker,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const { data: historicalData } = useQuery({
    queryKey: ["historical-data", selectedTicker, period],
    queryFn: () =>
      getHistoricalData({
        symbol: selectedTicker,
        start_date: getStartDate(period),
        end_date: new Date().toISOString().split("T")[0],
      }),
    enabled: !!selectedTicker,
  })

  // Helper to process data for a specific type
  const getProcessedData = (typeKey: keyof typeof TYPE_MAP) => {
    if (!brokerInventory) return { chartData: [], resume: null }

    const keys = TYPE_MAP[typeKey]
    let currentTotalLot = 0
    let currentTotalVal = 0

    // Data is from API is ascending (Oldest to Newest)
    const chartData = brokerInventory.data.map((item: any) => {
      const netLot = item[keys.lot]
      const netVal = item[keys.val]

      currentTotalLot += netLot
      currentTotalVal += netVal

      return {
        ...item,
        netLot, // For Inventory Chart
        netVal,
        runningBalance: currentTotalLot, // For Balance Position Chart
        runningBalanceVal: currentTotalVal,
      }
    })

    const resume = {
      netLot: brokerInventory.resume[keys.lot],
      netVal: brokerInventory.resume[keys.val],
      avgNetPrice: brokerInventory.resume[keys.avg],
    }

    return { chartData, resume }
  }

  // Get data for the main chart based on all types
  const mainInventoryDatasets = TYPE_ORDER.map((type) => {
    const { chartData } = getProcessedData(type)
    const config = TYPE_MAP[type]
    return {
      label: config.label,
      data: chartData.map((item: any) => ({
        date: item.date,
        value: showRunningBalance ? item.runningBalance : item.netLot,
      })),
      color: config.color,
    }
  })

  return (
    <div className="space-y-6">
      {isError && (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      )}

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-8">
          {historicalData && (
            <HistoricalPriceChart
              data={historicalData}
              inventoryDatasets={mainInventoryDatasets}
              title={`Historical Price - ${selectedTicker}`}
              height={700}
            />
          )}
        </div>
        <div className="col-span-4 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-running-balance"
                checked={showRunningBalance}
                onCheckedChange={setShowRunningBalance}
                size="sm"
              />
              <Label htmlFor="show-running-balance" className="text-xs">
                Show Running Balance
              </Label>
            </div>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 month">1 Month</SelectItem>
                <SelectItem value="3 month">3 Months</SelectItem>
                <SelectItem value="6 month">6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            {TYPE_ORDER.map((type) => {
              const config = TYPE_MAP[type]
              const { chartData, resume } = getProcessedData(type)

              if (!resume) return null

              return (
                <div
                  key={type}
                  className="overflow-hidden rounded-lg border p-2"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs font-medium">{config.label}</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Net Lot:</span>
                        <span
                          className={cn(
                            "font-mono font-medium",
                            resume.netLot < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          )}
                        >
                          {formatNumber(resume.netLot)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Net Value:
                        </span>
                        <span
                          className={cn(
                            "font-mono font-medium",
                            resume.netVal < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          )}
                        >
                          {formatNumber(resume.netVal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Avg Price:
                        </span>
                        <span className="font-mono font-medium">
                          {formatNumberWithDecimal(resume.avgNetPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1">
                    <div className="col-span-1">
                      {showRunningBalance ? (
                        <div>
                          <BrokerInventoryChart
                            data={chartData}
                            dataKey="runningBalance"
                            valueKey="runningBalanceVal"
                            label="Inventory"
                            title=""
                          />
                        </div>
                      ) : (
                        <div>
                          <BrokerInventoryChart
                            data={chartData}
                            dataKey="netLot"
                            valueKey="netVal"
                            label="Net Lot"
                            title=""
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
