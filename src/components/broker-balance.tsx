import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { getBrokerBalance } from "@/lib/api"
import type { DateRange } from "react-day-picker"
import { cn, formatNumber, formatNumberWithDecimal } from "@/lib/utils"
import { BrokerInventoryChart } from "./broker-inventory-chart"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BrokerBalanceProps {
  selectedTicker: string
  date: DateRange | undefined
  brokerCode: string
}

export function BrokerBalance({
  selectedTicker,
  date,
  brokerCode,
}: BrokerBalanceProps) {
  const [showRunningBalance, setShowRunningBalance] = useState(false)
  const selectedBrokers = useMemo(
    () => (brokerCode ? [brokerCode] : []),
    [brokerCode]
  )

  const {
    data: brokerBalance,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "broker-balance",
      selectedTicker,
      selectedBrokers.join(","),
      date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    ],
    queryFn: () =>
      getBrokerBalance(
        selectedTicker,
        selectedBrokers.join(","),
        date?.from ? format(date.from, "yyyy-MM-dd") : "",
        date?.to ? format(date.to, "yyyy-MM-dd") : ""
      ),
    enabled:
      !!selectedTicker &&
      selectedBrokers.length > 0 &&
      !!date?.from &&
      !!date?.to,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const runningBalanceData = useMemo(() => {
    if (!brokerBalance) return []
    let currentTotal = 0
    let currentTotalVal = 0
    // API returns newest first (desc)
    const reversed = [...brokerBalance.data].reverse()

    const withBalance = reversed.map((item) => {
      currentTotal += item.netLot
      currentTotalVal += item.netVal
      return {
        ...item,
        runningBalance: currentTotal,
        runningBalanceVal: currentTotalVal,
      }
    })
    // Charts need oldest first (asc), so we keep it reversed
    return withBalance // Oldest to newest
  }, [brokerBalance])

  if (!brokerCode) return null

  return (
    <div className="space-y-2">
      {isError && (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-running-balance-single" className="text-xs">
              Show Running Balance
            </Label>
            <Switch
              id="show-running-balance-single"
              checked={showRunningBalance}
              onCheckedChange={setShowRunningBalance}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <div className="flex flex-wrap gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Net Lot:</span>
              <span
                className={cn(
                  "font-mono font-medium",
                  (brokerBalance?.resume.netLot || 0) < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                )}
              >
                {formatNumber(brokerBalance?.resume.netLot || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Net Value:</span>
              <span
                className={cn(
                  "font-mono font-medium",
                  (brokerBalance?.resume.netVal || 0) < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                )}
              >
                {formatNumber(brokerBalance?.resume.netVal || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Avg Price:</span>
              <span className="font-mono font-medium">
                {formatNumberWithDecimal(
                  brokerBalance?.resume.avgNetPrice || 0
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1">
          <div className="col-span-1">
            {showRunningBalance ? (
              <div>
                <div className="h-[150px]">
                  <BrokerInventoryChart
                    data={runningBalanceData}
                    dataKey="runningBalance"
                    valueKey="runningBalanceVal"
                    label="Inventory"
                    title=""
                    className="h-full"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="h-[150px]">
                  <BrokerInventoryChart
                    data={runningBalanceData}
                    dataKey="netLot"
                    valueKey="netVal"
                    label="Net Lot"
                    title=""
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
