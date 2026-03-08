"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false)
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    date
  )

  React.useEffect(() => {
    setInternalDate(date)
  }, [date, open])

  const onCancel = () => {
    setOpen(false)
    setInternalDate(date)
  }

  const onApply = () => {
    setDate(internalDate)
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "font-normaln w-[260px] justify-start text-left text-xs",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={internalDate?.from}
            selected={internalDate}
            onSelect={(range, selectedDay) => {
              if (internalDate?.from && internalDate?.to) {
                setInternalDate({ from: selectedDay, to: undefined })
                return
              }
              setInternalDate(range)
            }}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
          />
          <div className="flex items-center justify-end gap-2 border-t p-3">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Batal
            </Button>
            <Button size="sm" onClick={onApply}>
              Simpan
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
