import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getTickers } from "@/lib/apis/ticker/ticker-api"
import type { Ticker } from "@/lib/apis/ticker/interface"
import { useDebounce } from "@/hooks/use-debounce"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatNumber = (num: number) => {
  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B"
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M"
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + "K"
  }
  return num.toString()
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [data, setData] = React.useState<Ticker[]>([])
  const [loading, setLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState("")
  const { ref, inView } = useInView()

  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setData([])
      setPage(1)
      setHasMore(true)
      setSelected("")
      return
    }
  }, [open])

  // Reset data when query changes
  React.useEffect(() => {
    if (open) {
      setData([])
      setPage(1)
      setHasMore(true)
      setSelected("")
    }
  }, [debouncedQuery, open])

  // Fetch data
  React.useEffect(() => {
    const fetchData = async () => {
      if (!open) return
      if (!hasMore && page > 1) return

      setLoading(true)
      try {
        const response = await getTickers({
          search: debouncedQuery,
          limit: 10,
          page: page,
        })

        if (page === 1) {
          setData(response.data)
          if (response.data.length > 0) {
            setSelected(response.data[0].symbol)
          }
        } else {
          setData((prev) => [...prev, ...response.data])
        }

        setHasMore(response.data.length === 10)
      } catch (error) {
        console.error("Failed to fetch tickers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [debouncedQuery, page, open])

  // Load more when scrolling to bottom
  React.useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1)
    }
  }, [inView, hasMore, loading])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      commandProps={{
        value: selected,
        onValueChange: setSelected,
      }}
    >
      <CommandInput
        placeholder="Search ticker symbol or name..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : "No results found."}
        </CommandEmpty>
        {data.length > 0 && (
          <CommandGroup heading="Stocks">
            {data.map((ticker) => (
              <CommandItem
                key={ticker.symbol}
                value={ticker.symbol}
                onSelect={() => {
                  runCommand(() => navigate(`/stock/${ticker.symbol}`))
                }}
                className="flex items-center gap-4 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-muted">
                  {ticker.logo ? (
                    <img
                      src={ticker.logo}
                      alt={ticker.symbol}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {ticker.symbol.substring(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{ticker.symbol}</span>
                    {ticker.isBreakout && (
                      <span title="Breakout" className="text-xs">
                        ⚡
                      </span>
                    )}
                    {ticker.sector && (
                      <Badge variant="outline" className="text-[10px] py-0 h-5">
                        {ticker.sector}
                      </Badge>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {ticker.name}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 text-right text-xs">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">
                      {ticker.price?.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        ticker.changePercentage > 0
                          ? "text-green-600"
                          : ticker.changePercentage < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {ticker.changePercentage > 0 ? "+" : ""}
                      {ticker.changePercentage?.toFixed(2)}%
                    </span>
                  </div>

                  <div className="hidden flex-col items-end sm:flex">
                    <span className="font-medium">
                      {formatNumber(ticker.volume || 0)}
                    </span>
                    {ticker.isVolumeSpike && (
                      <span className="text-[10px] font-bold text-orange-500">
                        🔥 Spike
                      </span>
                    )}
                  </div>

                  <div className="hidden flex-col items-end sm:flex">
                    <span
                      className={cn(
                        "font-medium",
                        (ticker.netBrokerFlow || 0) > 0
                          ? "text-green-600"
                          : (ticker.netBrokerFlow || 0) < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {(ticker.netBrokerFlow || 0) > 0 ? "+" : ""}
                      {formatNumber(ticker.netBrokerFlow || 0)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Net Flow
                    </span>
                  </div>

                  <div className="hidden flex-col items-end sm:flex">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 py-0 text-[10px]",
                        ticker.bandarStatus === "Accumulation" &&
                          "bg-green-100 text-green-800 border-green-200",
                        ticker.bandarStatus === "Distribution" &&
                          "bg-red-100 text-red-800 border-red-200",
                        ticker.bandarStatus === "Neutral" &&
                          "bg-gray-100 text-gray-800 border-gray-200"
                      )}
                    >
                      {ticker.bandarStatus || "Neutral"}
                    </Badge>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        (ticker.smartMoneyScore || 0) >= 70
                          ? "text-green-600"
                          : (ticker.smartMoneyScore || 0) <= 30
                            ? "text-red-600"
                            : "text-yellow-600"
                      )}
                    >
                      Score: {ticker.smartMoneyScore || 0}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
            {hasMore && (
              <div
                ref={ref}
                className="py-2 text-center text-xs text-muted-foreground"
              >
                {loading ? "Loading more..." : "Load more"}
              </div>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
