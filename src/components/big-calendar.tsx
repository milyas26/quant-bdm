import { useMemo } from "react"
import { format, subDays, getDay } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface BigCalendarProps {
  className?: string,
  selectedTicker: string,
}

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export function BigCalendar({ className, selectedTicker }: BigCalendarProps) {
  const days = useMemo(() => {
    const today = new Date()
    const result = []
    let daysCount = 0
    
    // Start from today and go backwards, collecting only weekdays
    for (let i = 0; i < 120; i++) { // Check up to 120 days to ensure we get ~90 weekdays
      const date = subDays(today, i)
      const dayOfWeek = getDay(date)
      
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue
      
      result.push({
        date,
        dayName: dayNames[dayOfWeek],
        dayNumber: format(date, "d"),
        isToday: i === 0,
        month: format(date, "MMM", { locale: id })
      })
      
      daysCount++
      // Stop after collecting approximately 3 months of weekdays (~90 days)
      if (daysCount >= 90) break
    }
    
    return result // Return in chronological order (newest first)
  }, [])

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Broker Summary {selectedTicker} 3 Bulan Terakhir (Hari Kerja)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {format(days[days.length - 1]?.date || subDays(new Date(), 90), "d MMM yyyy")} - {format(days[0]?.date || new Date(), "d MMM yyyy")}
        </p>
      </div>
      
      <div className="overflow-auto max-h-[80vh] border rounded-lg">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2">
          {days.map((day, index) => (
            <Card
              key={index}
              className={cn(
                "p-2 transition-all duration-200 hover:shadow-md cursor-pointer h-32 min-h-32 rounded-md",
                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                day.isToday 
                  ? "ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <div className="relative h-full">
                {/* Date positioned in top right corner */}
                <div className="absolute top-2 right-2 text-right flex items-baseline gap-1">
                  <div className={cn(
                    "text-xs",
                    day.isToday 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {day.dayName},
                  </div>
                  <div className={cn(
                    "text-sm font-medium leading-none",
                    day.isToday 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-900 dark:text-gray-100"
                  )}>
                    {day.dayNumber}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 leading-none">
                    {day.month}
                  </div>
                </div>
                
                {/* Main content area - you can add other content here later */}
                <div className="pt-16">
                  {/* Placeholder for future content */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}