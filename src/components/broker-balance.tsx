import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { getBrokerBalance, getBrokers } from "@/lib/api"
import type { DateRange } from "react-day-picker"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatNumber, formatNumberWithDecimal } from "@/lib/utils"
import { BrokerInventoryChart } from "./broker-inventory-chart"
import { BrokerMultiSelect, type BrokerOption } from "./broker-multi-select"

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
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>(
    brokerCode ? [brokerCode] : []
  )

  // Fetch all brokers for the select options
  const { data: brokers = {} } = useQuery({
    queryKey: ["brokers"],
    queryFn: getBrokers,
    staleTime: Infinity, // Broker list rarely changes
  })

  const brokerOptions = useMemo(() => {
    const options: Record<string, BrokerOption[]> = {}
    Object.entries(brokers).forEach(([type, brokerList]) => {
      options[type] = brokerList.map((b) => ({
        value: b.code,
        label: b.code,
        type: b.type,
        name: b.name,
      }))
    })
    return options
  }, [brokers])

  // If initial brokerCode changes, update selectedBrokers
  useMemo(() => {
    if (brokerCode && !selectedBrokers.includes(brokerCode)) {
      setSelectedBrokers((prev) => [...prev, brokerCode])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokerCode])

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
    return withBalance.reverse()
  }, [brokerBalance])

  return (
    <div className="space-y-4">
      {isError && (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      )}

      <div className="mb-2 max-w-[400px]">
        <BrokerMultiSelect
          options={brokerOptions}
          selected={selectedBrokers}
          onChange={setSelectedBrokers}
          placeholder="Select brokers..."
        />
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-5">
          <div className="max-h-[80vh] overflow-auto rounded-md border pr-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>

                  <TableCell colSpan={3} />
                  <TableCell className="text-right">
                    {formatNumberWithDecimal(
                      brokerBalance?.resume.avgNetPrice || 0
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "text-right",
                      (brokerBalance?.resume.netVal || 0) < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    )}
                  >
                    {formatNumber(brokerBalance?.resume.netVal || 0)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      (brokerBalance?.resume.netLot || 0) < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    )}
                  >
                    {formatNumber(brokerBalance?.resume.netLot || 0)}
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableHead>Date</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead className="text-right">Buy (Lot)</TableHead>
                  <TableHead className="text-right">Buy (Value)</TableHead>
                  <TableHead className="text-right">Sell (Lot)</TableHead>
                  <TableHead className="text-right">Sell (Value)</TableHead>
                  <TableHead className="text-right">Curr. (Lot)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runningBalanceData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs font-medium">
                      {format(new Date(item.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.avgNetPrice
                        ? formatNumberWithDecimal(item.avgNetPrice)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">
                      {item.netLot > 0 ? formatNumber(item.netLot) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">
                      {item.netLot > 0 ? formatNumber(item.netVal) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">
                      {item.netLot < 0 ? formatNumber(item.netLot) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">
                      {item.netLot < 0 ? formatNumber(item.netVal) : "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-bold",
                        item.runningBalance > 0
                          ? "text-green-600 dark:text-green-400"
                          : item.runningBalance < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                      )}
                    >
                      {formatNumber(parseFloat(item.runningBalance.toFixed(0)))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="col-span-7 space-y-4">
          <div>
            <p className="mb-2 text-left font-semibold">
              Inventory (Accumulation/Distribution)
            </p>
            <BrokerInventoryChart
              data={runningBalanceData}
              dataKey="netLot"
              valueKey="netVal"
              label="Net Lot"
              title=""
            />
          </div>
          <div>
            <p className="mb-2 text-left font-semibold">
              Balance Position (Running Balance)
            </p>
            <BrokerInventoryChart
              data={runningBalanceData}
              dataKey="runningBalance"
              valueKey="runningBalanceVal"
              label="Inventory"
              title=""
            />
          </div>
        </div>
      </div>
    </div>
  )
}
