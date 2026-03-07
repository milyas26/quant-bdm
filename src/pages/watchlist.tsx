import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getWatchlists, toggleTickerInWatchlist } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { cn, formatIDR } from "@/lib/utils"
import { useState } from "react"
import { format } from "date-fns"
import { BigCalendar } from "@/components/big-calendar"

export default function WatchlistPage() {
  const queryClient = useQueryClient()
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  format(new Date(), "yyyy-MM-dd")

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
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                {watchlist.tickers.length === 0 ? (
                  <p className="text-muted-foreground">
                    No tickers in this watchlist.
                  </p>
                ) : (
                  <ul className="grid gap-2">
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
                            className="h-6 w-6"
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
                        <span className="font-medium">
                          {formatIDR(ticker.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-span-10 h-screen border-l pl-4">
                {selectedTicker ? (
                  <div className="space-y-4">
                    <BigCalendar selectedTicker={selectedTicker} />
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
