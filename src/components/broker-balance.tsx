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
    const reversed = [...brokerBalance.data].reverse()
    const withBalance = reversed.map((item) => {
      currentTotal += item.netLot
      return { ...item, runningBalance: currentTotal }
    })
    return withBalance
  }, [brokerBalance])

  console.log(
    "price",
    brokerBalance &&
      brokerBalance.data
        // .filter((item) => item.avgNetPrice > 0)
        .reduce((acc, curr) => acc + curr.avgNetPrice, 0)
  )

  console.log("length", brokerBalance && brokerBalance.data.length)

  return (
    <div className="space-y-4">
      {isError && (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      )}

      {brokerBalance && (
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5">
            <div className="max-h-[80vh] overflow-auto rounded-md border pr-4">
              <Table>
                <TableHeader>
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
                      <TableCell className="text-sm font-medium">
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
                        {formatNumber(item.runningBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>

                    <TableCell colSpan={3} />
                    <TableCell className="text-right">
                      {formatNumberWithDecimal(
                        brokerBalance.resume.avgNetPrice
                      )}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "text-right",
                        brokerBalance.resume.netVal < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      )}
                    >
                      {formatNumber(brokerBalance.resume.netVal)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        brokerBalance.resume.netLot < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      )}
                    >
                      {formatNumber(brokerBalance.resume.netLot)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
