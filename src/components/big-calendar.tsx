import { useMemo, useState } from "react"
import { format, subDays, getDay, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import { cn, formatIDR } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { getBrokerSummary3Months } from "@/lib/api"
import type { BrokerSummary, BrokerBuy, BrokerSell } from "@/lib/api"
import type { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/date-range-picker"

interface BigCalendarProps {
  className?: string
  selectedTicker: string
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export function BigCalendar({ className, selectedTicker }: BigCalendarProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 60), // Default to approx 2 months
    to: new Date(),
  })

  const { data: brokerSummaryData, isLoading } = useQuery({
    queryKey: [
      "broker-summary-range",
      selectedTicker,
      date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    ],
    queryFn: () =>
      getBrokerSummary3Months(
        selectedTicker,
        date?.from ? format(date.from, "yyyy-MM-dd") : "",
        date?.to ? format(date.to, "yyyy-MM-dd") : ""
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

      // Calculate top buyer and seller
      let topBuyer = null
      let topSeller = null

      if (dayData) {
        if (dayData.buys.length > 0) {
          topBuyer = dayData.buys.reduce((prev, current) =>
            parseFloat(current.bval) > parseFloat(prev.bval) ? current : prev
          )
        }
        if (dayData.sells.length > 0) {
          topSeller = dayData.sells.reduce((prev, current) =>
            parseFloat(current.sval) > parseFloat(prev.sval) ? current : prev
          )
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
        topBuyer,
        topSeller,
      })
    }

    return result // Return in chronological order (newest first)
  }, [dailyData, date])

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            Broker Summary {selectedTicker}
          </h3>
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
        </div>
        {isLoading && (
          <div className="text-sm text-blue-500">Loading data...</div>
        )}
      </div>

      <div className="max-h-[80vh] overflow-auto rounded-lg border">
        <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 md:grid-cols-6">
          {days.map((day, index) => (
            <Card
              key={index}
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
                  {day.topBuyer ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">
                        {day.topBuyer.netbsBrokerCode}
                      </span>
                      <span className="text-[10px] text-gray-600 dark:text-gray-400">
                        {formatIDR(parseFloat(day.topBuyer.bval))}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-300">-</div>
                  )}

                  {day.topSeller ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-600">
                        {day.topSeller.netbsBrokerCode}
                      </span>
                      <span className="text-[10px] text-gray-600 dark:text-gray-400">
                        {formatIDR(parseFloat(day.topSeller.sval))}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-300">-</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
