import * as React from "react"
import { format, getDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
  className?: string
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const formatDateRange = () => {
    if (!dateRange.from) return "Pilih tanggal"
    if (!dateRange.to) return format(dateRange.from, "dd MMM yyyy")
    return `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
  }

  const isWeekend = (date: Date) => {
    const day = getDay(date)
    return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[350px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={(range) => {
              if (range) {
                onDateRangeChange(range)
                if (range.from && range.to) {
                  setOpen(false)
                }
              }
            }}
            numberOfMonths={2}
            disabled={(date) => isWeekend(date)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}