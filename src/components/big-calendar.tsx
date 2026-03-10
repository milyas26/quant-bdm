import { useMemo, useState, useEffect } from "react"
import { format, subDays, getDay, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import {
  calculateBandarStatus,
  cn,
  formatNumber,
  getBandarBgColor,
  getBrokerColor,
} from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { getBrokerSummaryByDateRange } from "@/lib/api"
import type { BrokerSummary, BrokerBuy, BrokerSell } from "@/lib/api"
import type { DateRange } from "react-day-picker"
import { BrokerSummaryContent } from "@/components/broker-summary-content"

interface BigCalendarProps {
  className?: string
  selectedTicker: string
  date: DateRange | undefined
  valueType: "Net" | "Gross"
  onBrokerClick?: (brokerCode: string) => void
  highlightedBroker?: string | null
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export function BigCalendar({
  className,
  selectedTicker,
  date,
  valueType,
  onBrokerClick,
  highlightedBroker: externalHighlightedBroker,
}: BigCalendarProps) {
  const [internalHighlightedBroker, setInternalHighlightedBroker] = useState<
    string | null
  >(null)

  const highlightedBroker =
    externalHighlightedBroker !== undefined
      ? externalHighlightedBroker
      : internalHighlightedBroker

  const handleBrokerClick = (e: React.MouseEvent, code: string) => {
    e.stopPropagation()
    const newBroker = highlightedBroker === code ? null : code
    if (externalHighlightedBroker === undefined) {
      setInternalHighlightedBroker(newBroker)
    }
    onBrokerClick?.(code)
  }

  const {
    data: brokerSummaryData,
    isLoading,
    isError,
    error,
  } = useQuery({
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
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
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

      // Check if date is today and time is before 18:00 WIB
      const now = new Date()
      const wibDateStr = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      })
      const wibHour = parseInt(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          hour12: false,
        })
      )

      if (dateStr === wibDateStr && wibHour < 18) {
        continue
      }

      const dayData = dailyData[dateStr]

      // Calculate top buyers and sellers
      let topBuyers: BrokerBuy[] = []
      let topSellers: BrokerSell[] = []
      let bandarStatus = "Neutral"

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

        const totalVol = dayData.buys.reduce(
          (acc, curr) => acc + parseFloat(curr.blot || "0"),
          0
        )
        bandarStatus = calculateBandarStatus(
          dayData.buys,
          dayData.sells,
          totalVol
        )
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
        bandarStatus,
      })
    }

    return result // Return in chronological order (newest first)
  }, [dailyData, date])

  const [selectedDateData, setSelectedDateData] = useState<
    { buys: BrokerBuy[]; sells: BrokerSell[] } | undefined
  >(undefined)

  const handleDateClick = (data: {
    buys: BrokerBuy[]
    sells: BrokerSell[]
  }) => {
    setSelectedDateData(data)
  }

  // Set default selected date to the latest available data when data is loaded
  useEffect(() => {
    if (days.length > 0) {
      // Find the first day with data (latest date)
      const latestDayWithData = days.find((day) => day.data)
      if (latestDayWithData) {
        setSelectedDateData(() => {
          // Always update to the new latest date when days/ticker changes
          return latestDayWithData.data
        })
      } else {
        setSelectedDateData(undefined)
      }
    } else {
      setSelectedDateData(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, selectedTicker])

  if (isError) {
    return (
      <div className={cn("w-full py-4 text-red-500", className)}>
        Error: {(error as Error).message}
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {isLoading && (
        <div className="mb-2 text-sm text-blue-500">Loading data...</div>
      )}

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-9 max-h-[80vh] overflow-auto">
          <div className="grid grid-cols-3 gap-2 p-1 sm:grid-cols-4 md:grid-cols-6">
            {days.map((day, index) => (
              <Card
                key={index}
                className={cn(
                  "relative h-32 min-h-32 cursor-pointer rounded-md p-2 transition-all duration-200 hover:shadow-md",
                  "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
                  day.isToday
                    ? "shadow-lg ring-2 ring-blue-500 dark:ring-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700",
                  selectedDateData &&
                    selectedDateData === day.data &&
                    "ring-2 ring-slate-500 dark:ring-slate-400"
                )}
                onClick={() => {
                  if (day.data) handleDateClick(day.data)
                }}
              >
                {/* Bandar Status Indicator */}
                <div
                  className={cn(
                    "absolute right-0 bottom-0 left-0 h-1.5 rounded-b-md",
                    getBandarBgColor(day.bandarStatus)
                  )}
                />
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
            ))}
          </div>
        </div>
        <div className="col-span-3 max-h-[80vh] overflow-auto rounded-lg bg-white p-4 pl-2 dark:bg-gray-900">
          <BrokerSummaryContent data={selectedDateData} />
        </div>
      </div>
    </div>
  )
}
