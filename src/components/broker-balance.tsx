import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { getBrokerBalance } from "@/lib/api"
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
  const {
    data: brokerBalance,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "broker-balance",
      selectedTicker,
      brokerCode,
      date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    ],
    queryFn: () =>
      getBrokerBalance(
        selectedTicker,
        brokerCode,
        date?.from ? format(date.from, "yyyy-MM-dd") : "",
        date?.to ? format(date.to, "yyyy-MM-dd") : ""
      ),
    enabled: !!selectedTicker && !!brokerCode && !!date?.from && !!date?.to,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const runningBalanceData = useMemo(() => {
    if (!brokerBalance) return []
    let currentTotal = 0
    const reversed = [...brokerBalance].reverse()
    const withBalance = reversed.map((item) => {
      currentTotal += item.netLot
      return { ...item, runningBalance: currentTotal }
    })
    return withBalance
  }, [brokerBalance])

  return (
    <div className="space-y-4">
      {isError && (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      )}

      {brokerBalance && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead className="text-right">Buy (Lot)</TableHead>
                <TableHead className="text-right">Buy (Value)</TableHead>
                <TableHead className="text-right">Sell (Lot)</TableHead>
                <TableHead className="text-right">Sell (Value)</TableHead>
                <TableHead className="text-right">
                  Curr. Balance (Lot)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runningBalanceData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {format(new Date(item.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {brokerCode || "-"}
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
                    {formatNumber(item.runningBalance)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">
                </TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">
                </TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">
                  {formatNumber(
                    brokerBalance.reduce((acc, curr) => acc + curr.netLot, 0)
                  )}
                </TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400">
                  {formatNumber(
                    brokerBalance.reduce((acc, curr) => acc + curr.netVal, 0)
                  )}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {formatNumber(
                    brokerBalance.reduce((acc, curr) => acc + curr.netLot, 0)
                  )}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {formatNumber(
                    brokerBalance.reduce((acc, curr) => acc + curr.netVal, 0)
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    brokerBalance.reduce((acc, curr) => acc + curr.netLot, 0) >
                      0
                      ? "text-green-600 dark:text-green-400"
                      : brokerBalance.reduce(
                            (acc, curr) => acc + curr.netLot,
                            0
                          ) < 0
                        ? "text-red-600 dark:text-red-400"
                        : ""
                  )}
                >
                  {formatNumber(
                    brokerBalance.reduce((acc, curr) => acc + curr.netLot, 0)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
