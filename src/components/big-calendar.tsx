import { useMemo, useState } from "react"
import { format, subDays, getDay, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import { cn, formatNumber, getBrokerColor } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBrokerSummaryByDateRange,
  fetchAndSaveBrokerSummary,
} from "@/lib/api"
import type { BrokerSummary, BrokerBuy, BrokerSell } from "@/lib/api"
import type { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BrokerSummaryHoverCard } from "@/components/broker-summary-hover-card"
import { Button } from "./ui/button"

interface BigCalendarProps {
  className?: string
  selectedTicker: string
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export function BigCalendar({ className, selectedTicker }: BigCalendarProps) {
  const queryClient = useQueryClient()
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 60), // Default to approx 2 months
    to: new Date(),
  })
  const [valueType, setValueType] = useState<"Net" | "Gross">("Net")

  const { data: brokerSummaryData, isLoading } = useQuery({
    queryKey: [
      "broker-summary-range",
      selectedTicker,
      date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
      valueType,
    ],
    queryFn: () =>
      getBrokerSummaryByDateRange(
        selectedTicker,
        date?.from ? format(date.from, "yyyy-MM-dd") : "",
        date?.to ? format(date.to, "yyyy-MM-dd") : "",
        valueType
      ),
    enabled: !!selectedTicker && !!date?.from && !!date?.to,
  })

  const fetchMutation = useMutation({
    mutationFn: () =>
      fetchAndSaveBrokerSummary({
        symbol: selectedTicker,
        from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
        to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broker-summary-range"] })
    },
  })

  const dailyData = useMemo(() => {
    if (!brokerSummaryData?.data) return {}

    const summaries = Array.isArray(brokerSummaryData.data)
      ? brokerSummaryData.data
      : [brokerSummaryData.data]
    const result: Record<string, { buys: BrokerBuy[]; sells: BrokerSell[] }> =
      {}

    summaries.forEach((summary: BrokerSummary) => {
      const { brokersBuy, brokersSell } = summary

      if (brokersBuy) {
        brokersBuy.forEach((buy: BrokerBuy) => {
          const date = new Date(buy.netbsDate).toISOString().split("T")[0]
          if (!result[date]) result[date] = { buys: [], sells: [] }
          result[date].buys.push(buy)
        })
      }

      if (brokersSell) {
        brokersSell.forEach((sell: BrokerSell) => {
          const date = new Date(sell.netbsDate).toISOString().split("T")[0]
          if (!result[date]) result[date] = { buys: [], sells: [] }
          result[date].sells.push(sell)
        })
      }
    })

    return result
  }, [brokerSummaryData])

  const days = useMemo(() => {
    if (!date?.from || !date?.to) return []

    const endDate = date.to
    const startDate = date.from
    const result = []

    // Calculate total days in range
    const totalDays = differenceInDays(endDate, startDate) + 1

    // Iterate from end date backwards to start date
    for (let i = 0; i < totalDays; i++) {
      const currentDate = subDays(endDate, i)
      const dayOfWeek = getDay(currentDate)

      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      const dateStr = format(currentDate, "yyyy-MM-dd")
      const dayData = dailyData[dateStr]

      // Calculate top buyers and sellers
      let topBuyers: BrokerBuy[] = []
      let topSellers: BrokerSell[] = []

      if (dayData) {
        if (dayData.buys.length > 0) {
          topBuyers = [...dayData.buys]
            .sort((a, b) => parseFloat(b.bval) - parseFloat(a.bval))
            .slice(0, 5)
        }
        if (dayData.sells.length > 0) {
          topSellers = [...dayData.sells]
            .sort((a, b) => parseFloat(b.sval) - parseFloat(a.sval))
            .slice(0, 5)
        }
      }

      result.push({
        date: currentDate,
        dateStr,
        dayName: dayNames[dayOfWeek],
        dayNumber: format(currentDate, "d"),
        isToday: i === 0 && differenceInDays(new Date(), currentDate) === 0, // Check if actual today
        month: format(currentDate, "MMM", { locale: id }),
        data: dayData,
        topBuyers,
        topSellers,
      })
    }

    return result // Return in chronological order (newest first)
  }, [dailyData, date])

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-baseline-last justify-between">
        <div>
          <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            Broker Summary {selectedTicker}
          </h3>
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Select
              value={valueType}
              onValueChange={(val) => setValueType(val as "Net" | "Gross")}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Net">Net</SelectItem>
                <SelectItem value="Gross">Gross</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="text-sm text-blue-500">Loading data...</div>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => fetchMutation.mutate()}
            disabled={fetchMutation.isPending || !date?.from || !date?.to}
          >
            {fetchMutation.isPending ? "Fetching..." : "Fetch Broker Summary"}
          </Button>
        </div>
      </div>

      <div className="max-h-[80vh] overflow-auto rounded-lg border">
        <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 md:grid-cols-6">
          {days.map((day, index) => (
            <BrokerSummaryHoverCard key={index} data={day.data}>
              <Card
                className={cn(
                  "h-32 min-h-32 cursor-pointer rounded-md p-2 transition-all duration-200 hover:shadow-md",
                  "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
                  day.isToday
                    ? "shadow-lg ring-2 ring-blue-500 dark:ring-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="relative flex h-full flex-col">
                  {/* Date positioned in top right corner */}
                  <div className="absolute top-0 right-0 flex items-baseline gap-1 text-right">
                    <div
                      className={cn(
                        "text-[10px]",
                        day.isToday
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {day.dayName},
                    </div>
                    <div
                      className={cn(
                        "text-xs leading-none font-medium",
                        day.isToday
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-100"
                      )}
                    >
                      {day.dayNumber}
                    </div>
                    <div className="text-[10px] leading-none text-gray-400 dark:text-gray-500">
                      {day.month}
                    </div>
                  </div>

                  {/* Main content area */}
                  <div className="mt-6 flex-1 space-y-1 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Buy Side */}
                      <div className="space-y-0.5">
                        {day.topBuyers.length > 0 ? (
                          day.topBuyers.map((buy, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span
                                className={cn(
                                  "text-[10px] font-bold",
                                  getBrokerColor(buy.type)
                                )}
                              >
                                {buy.netbsBrokerCode}
                              </span>
                              <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                {formatNumber(parseFloat(buy.bval))}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[9px] text-gray-300">-</div>
                        )}
                      </div>
                      {/* Sell Side */}
                      <div className="space-y-0.5">
                        {day.topSellers.length > 0 ? (
                          day.topSellers.map((sell, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span
                                className={cn(
                                  "text-[10px] font-bold",
                                  getBrokerColor(sell.type)
                                )}
                              >
                                {sell.netbsBrokerCode}
                              </span>
                              <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                {formatNumber(parseFloat(sell.sval))}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[9px] text-gray-300">-</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </BrokerSummaryHoverCard>
          ))}
        </div>
      </div>
    </div>
  )
}
