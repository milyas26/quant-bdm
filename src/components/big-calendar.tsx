import { useMemo, useState } from "react"
import { format, subDays, getDay, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import { cn, getBrokerColor, formatNumber } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { getBrokerSummaryByDateRange } from "@/lib/api"
import type { BrokerSummary, BrokerBuy, BrokerSell } from "@/lib/api"
import type { DateRange } from "react-day-picker"
import { BrokerSummaryPopover } from "@/components/broker-summary-popover"

interface BigCalendarProps {
  className?: string
  selectedTicker: string
  date: DateRange | undefined
  valueType: "Net" | "Gross"
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export function BigCalendar({
  className,
  selectedTicker,
  date,
  valueType,
}: BigCalendarProps) {
  const [highlightedBroker, setHighlightedBroker] = useState<string | null>(
    null
  )

  const handleBrokerClick = (e: React.MouseEvent, code: string) => {
    e.stopPropagation()
    setHighlightedBroker((prev) => (prev === code ? null : code))
  }

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
      {isLoading && (
        <div className="mb-2 text-sm text-blue-500">Loading data...</div>
      )}

      <div className="max-h-[80vh] overflow-auto rounded-lg border">
        <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 md:grid-cols-6">
          {days.map((day, index) => (
            <BrokerSummaryPopover key={index} data={day.data}>
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
                                  "cursor-pointer text-[10px] font-bold",
                                  getBrokerColor(buy.type),
                                  highlightedBroker === buy.netbsBrokerCode &&
                                    "rounded bg-yellow-200 p-1 dark:bg-yellow-900"
                                )}
                                onClick={(e) =>
                                  handleBrokerClick(e, buy.netbsBrokerCode)
                                }
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
                                  "cursor-pointer text-[10px] font-bold",
                                  getBrokerColor(sell.type),
                                  highlightedBroker === sell.netbsBrokerCode &&
                                    "rounded bg-yellow-200 p-1 dark:bg-yellow-900"
                                )}
                                onClick={(e) =>
                                  handleBrokerClick(e, sell.netbsBrokerCode)
                                }
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
            </BrokerSummaryPopover>
          ))}
        </div>
      </div>
    </div>
  )
}
