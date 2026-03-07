import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getWatchlists,
  toggleTickerInWatchlist,
  fetchAndSaveBrokerSummary,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { format, subDays } from "date-fns"
import { BigCalendar } from "@/components/big-calendar"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function WatchlistPage() {
  const queryClient = useQueryClient()
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 60),
    to: new Date(),
  })
  const [valueType, setValueType] = useState<"Net" | "Gross">("Net")

  const {
    data: watchlists,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
  })

  const { mutate: handleToggleWatchlist, isPending: isTogglingWatchlist } =
    useMutation({
      mutationFn: (symbol: string) => toggleTickerInWatchlist(symbol),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      },
    })

  const fetchMutation = useMutation({
    mutationFn: () =>
      fetchAndSaveBrokerSummary({
        symbol: selectedTicker!,
        from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
        to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broker-summary-range"] })
    },
  })

  if (isLoading) {
    return <div className="p-4">Loading watchlists...</div>
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">Error: {(error as Error).message}</div>
    )
  }

  if (!watchlists || watchlists.length === 0) {
    return (
      <div className="p-4">
        <h2 className="mb-4 text-2xl font-bold">Watchlist</h2>
        <p>
          No watchlists found. Add tickers to your watchlist from the Stocks
          page.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {watchlists.map((watchlist) => (
        <Card key={watchlist.id} className="h-screen">
          <CardHeader>
            <CardTitle>{watchlist.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                {watchlist.tickers.length === 0 ? (
                  <p className="text-muted-foreground">
                    No tickers in this watchlist.
                  </p>
                ) : (
                  <ul className="grid gap-1">
                    {watchlist.tickers.map((ticker) => (
                      <li
                        key={ticker.symbol}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-2 rounded-md border p-2 transition-colors",
                          selectedTicker === ticker.symbol
                            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                        onClick={() => setSelectedTicker(ticker.symbol)}
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleWatchlist(ticker.symbol)
                            }}
                            disabled={isTogglingWatchlist}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4 fill-yellow-400 text-yellow-400"
                              )}
                            />
                          </Button>
                          <span
                            className={cn(
                              "font-medium",
                              selectedTicker === ticker.symbol &&
                                "text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {ticker.symbol}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-span-11 pl-2">
                {selectedTicker ? (
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                          Broker Summary {selectedTicker}
                        </h3>
                        <div className="flex items-center gap-2">
                          <DatePickerWithRange date={date} setDate={setDate} />
                          <Select
                            value={valueType}
                            onValueChange={(val) =>
                              setValueType(val as "Net" | "Gross")
                            }
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
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => fetchMutation.mutate()}
                          disabled={
                            fetchMutation.isPending || !date?.from || !date?.to
                          }
                        >
                          {fetchMutation.isPending
                            ? "Fetching..."
                            : "Fetch Broker Summary"}
                        </Button>
                      </div>
                    </div>
                    <BigCalendar
                      selectedTicker={selectedTicker}
                      date={date}
                      valueType={valueType}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Pilih symbol untuk melihat detail
                  </p>
                )}
                <p className="mt-4 text-muted-foreground">
                  Last updated: {new Date(watchlist.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
