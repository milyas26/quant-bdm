import { cn, formatNumber, getBandarBgColor, getBrokerColor } from "@/lib/utils"
import type { BrokerBuy, BrokerSell } from "@/lib/api"

export interface DayData {
  date: Date
  dateStr: string
  dayName: string
  dayNumber: string
  isToday: boolean
  month: string
  data?: { buys: BrokerBuy[]; sells: BrokerSell[] }
  topBuyers: BrokerBuy[]
  topSellers: BrokerSell[]
  bandarStatus: string
}

interface DailyBrokerSummaryGridProps {
  days: DayData[]
  selectedDateData?: { buys: BrokerBuy[]; sells: BrokerSell[] }
  highlightedBroker?: string | null
  onDateClick: (data: { buys: BrokerBuy[]; sells: BrokerSell[] }) => void
  onBrokerClick: (e: React.MouseEvent, code: string) => void
}

export function DailyBrokerSummaryGrid({
  days,
  selectedDateData,
  highlightedBroker,
  onDateClick,
  onBrokerClick,
}: DailyBrokerSummaryGridProps) {
  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum"]

  // Sort days chronologically (newest to oldest)
  const sortedDays = [...days].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  // Calculate empty cells needed at start (for the newest day, which is first in list)
  const firstDay = sortedDays[0]
  const emptyStartCells = firstDay ? (firstDay.date.getDay() === 0 ? 0 : 5 - firstDay.date.getDay()) : 0 // Adjust for Friday end
  
  // Calculate empty cells needed at end (for the oldest day, which is last in list)
  const lastDay = sortedDays[sortedDays.length - 1]
  const emptyEndCells = lastDay ? (lastDay.date.getDay() === 0 ? 6 : lastDay.date.getDay() - 1) : 0 // Adjust for Monday start

  return (
    <div className="space-y-0">
      <div className="grid grid-cols-5 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r border-border py-2 text-center text-sm font-medium text-muted-foreground last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-5 border-t border-l border-border"
        style={{ direction: "rtl" }}
      >
        {Array.from({ length: emptyStartCells }).map((_, i) => (
          <div
            key={`empty-start-${i}`}
            className="h-32 min-h-32 border-b border-l border-border bg-muted/20"
          />
        ))}
        {sortedDays.map((day, index) => {
          return (
            <div
              key={index}
              className={cn(
                "relative h-32 min-h-32 cursor-pointer border-b border-l border-border px-4 py-2 text-left transition-all duration-200",
                "bg-card hover:bg-accent/50",
                day.isToday && "bg-accent/20",
                selectedDateData &&
                  selectedDateData === day.data &&
                  "z-10 ring-2 ring-slate-500 ring-inset dark:ring-slate-400"
              )}
              style={{ direction: "ltr" }}
              onClick={() => {
                if (day.data) onDateClick(day.data)
              }}
            >
              {/* Bandar Status Indicator */}
              <div
                className={cn(
                  "absolute right-0.5 bottom-0.5 left-0.5 h-1.5",
                  getBandarBgColor(day.bandarStatus)
                )}
              />
              <div className="relative flex h-full flex-col">
                {/* Date positioned in top right corner */}
                <div className="absolute top-0 right-0 flex items-baseline gap-1 text-right">
                  <div
                    className={cn(
                      "text-xs leading-none font-medium",
                      day.isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-foreground"
                    )}
                  >
                    {day.dayNumber}
                  </div>
                  <div className="text-[10px] leading-none text-muted-foreground">
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
                                onBrokerClick(e, buy.netbsBrokerCode)
                              }
                            >
                              {buy.netbsBrokerCode}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {formatNumber(parseFloat(buy.bval))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[9px] text-muted-foreground/50">
                          -
                        </div>
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
                                onBrokerClick(e, sell.netbsBrokerCode)
                              }
                            >
                              {sell.netbsBrokerCode}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {formatNumber(parseFloat(sell.sval))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[9px] text-muted-foreground/50">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {Array.from({ length: emptyEndCells }).map((_, i) => (
          <div
            key={`empty-end-${i}`}
            className="h-32 min-h-32 border-b border-l border-border bg-muted/20"
          />
        ))}
      </div>
    </div>
  )
}
