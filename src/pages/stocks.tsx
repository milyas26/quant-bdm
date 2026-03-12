import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  getScreener,
  deleteTicker,
  toggleTickerInWatchlist,
  refreshAllTickers,
} from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Trash2,
  MoreHorizontal,
  Star,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { GetTickersParams } from "@/lib/apis/ticker/interface"
import { toast } from "sonner"

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

export default function StocksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [tickerToDelete, setTickerToDelete] = useState<string | null>(null)
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const navigate = useNavigate()

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (isInput) return
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const { mutate: handleToggleWatchlist, isPending: isTogglingWatchlist } =
    useMutation({
      mutationFn: toggleTickerInWatchlist,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tickers"] })
      },
    })

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")

  const minPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice")!)
    : undefined
  const maxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!)
    : undefined

  const sortBy = searchParams.get("sortBy")
  const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | undefined

  // Price inputs state
  const [minPriceInput, setMinPriceInput] = useState(
    searchParams.get("minPrice") || ""
  )
  const [maxPriceInput, setMaxPriceInput] = useState(
    searchParams.get("maxPrice") || ""
  )

  const [pageInput, setPageInput] = useState(searchParams.get("page") || "1")

  useEffect(() => {
    setPageInput(page.toString())
  }, [page])

  const updateParams = (updates: Partial<GetTickersParams>) => {
    const newParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }
    })

    setSearchParams(newParams)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      updateParams({
        sortBy: column,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      })
    } else {
      updateParams({
        sortBy: column,
        sortOrder: "desc",
      })
    }
  }

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateParams({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch])

  const handlePriceUpdate = () => {
    updateParams({
      minPrice: minPriceInput ? parseInt(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? parseInt(maxPriceInput) : undefined,
      page: 1,
    })
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "tickers",
      page,
      limit,
      debouncedSearch,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getScreener({
        page,
        limit,
        search: debouncedSearch,
        minPrice,
        maxPrice,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allSymbols = data?.data.map((t) => t.symbol) || []
      setSelectedTickers((prev) => {
        const newSelection = new Set([...prev, ...allSymbols])
        return Array.from(newSelection)
      })
    } else {
      const pageSymbols = data?.data.map((t) => t.symbol) || []
      setSelectedTickers((prev) => prev.filter((s) => !pageSymbols.includes(s)))
    }
  }

  const handleSelectRow = (symbol: string, checked: boolean) => {
    if (checked) {
      setSelectedTickers((prev) => [...prev, symbol])
    } else {
      setSelectedTickers((prev) => prev.filter((s) => s !== symbol))
    }
  }

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteTicker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickers"] })
      setTickerToDelete(null)
    },
  })

  const { mutate: handleBulkDelete, isPending: isBulkDeleting } = useMutation({
    mutationFn: async (symbols: string[]) => {
      await Promise.all(symbols.map((symbol) => deleteTicker(symbol)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickers"] })
      setSelectedTickers([])
      setIsBulkDeleteConfirmOpen(false)
    },
  })

  const { mutate: handleRefreshAllTickers, isPending: isRefreshing } =
    useMutation({
      mutationFn: refreshAllTickers,
      onSuccess: () => {
        toast.success("Refreshing all tickers data in background started.")
      },
      onError: (error) => {
        toast.error(`Failed to start refreshing: ${(error as Error).message}`)
      },
    })

  return (
    <div className="space-y-4">
      <AlertDialog
        open={!!tickerToDelete}
        onOpenChange={(open) => !open && setTickerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ticker
              <span className="font-bold"> {tickerToDelete}</span> and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tickerToDelete && handleDelete(tickerToDelete)}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold">{selectedTickers.length}</span>{" "}
              selected tickers and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkDelete(selectedTickers)}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isBulkDeleting ? "Deleting..." : "Delete Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-card/20">
        <CardContent className="space-y-4">
          <div className="flex flex-col flex-wrap gap-2 md:flex-row md:items-end">
            <div className="w-full min-w-[200px] space-y-2 md:w-auto md:flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Search symbol or name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full space-y-2 md:w-32">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={handlePriceUpdate}
                onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
              />
            </div>

            <div className="w-full space-y-2 md:w-32">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={handlePriceUpdate}
                onKeyDown={(e) => e.key === "Enter" && handlePriceUpdate()}
              />
            </div>

            {selectedTickers.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> ({selectedTickers.length})
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => handleRefreshAllTickers()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  data?.data &&
                  data.data.length > 0 &&
                  data.data.every((t) => selectedTickers.includes(t.symbol))
                }
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("symbol")}
            >
              <div className="flex items-center gap-1">
                Ticker
                {sortBy === "symbol" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("price")}
            >
              <div className="flex items-center gap-1">
                Price
                {sortBy === "price" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("volume")}
            >
              <div className="flex items-center gap-1">
                Volume
                {sortBy === "volume" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("netBrokerFlow")}
            >
              <div className="flex items-center gap-1">
                Broker Net
                {sortBy === "netBrokerFlow" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("accumulationDistribution1D")}
            >
              <div className="flex items-center gap-1">
                Acc/Dist (%)
                {sortBy === "accumulationDistribution1D" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("bandarStatus")}
            >
              <div className="flex items-center gap-1">
                Bandar Status
                {sortBy === "bandarStatus" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("smartMoneyScore")}
            >
              <div className="flex items-center gap-1">
                Score
                {sortBy === "smartMoneyScore" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("momentum")}
            >
              <div className="flex items-center gap-1">
                Momentum
                {sortBy === "momentum" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("sector")}
            >
              <div className="flex items-center gap-1">
                Sector
                {sortBy === "sector" ? (
                  sortOrder === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={13} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={13} className="h-24 text-center text-red-500">
                Error: {(error as Error).message}
              </TableCell>
            </TableRow>
          ) : data?.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((ticker) => (
              <TableRow
                key={ticker.symbol}
                className="cursor-pointer"
                onClick={() => navigate(`/stock/${ticker.symbol}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedTickers.includes(ticker.symbol)}
                    onCheckedChange={(checked) => {
                      handleSelectRow(ticker.symbol, !!checked)
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleWatchlist(ticker.symbol)
                      }}
                      disabled={isTogglingWatchlist}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          ticker.isOnWatchlist
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                    <div className="flex items-center gap-2">
                      {ticker.logo && (
                        <img
                          src={ticker.logo}
                          alt={ticker.symbol}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-sm font-bold">
                          {ticker.symbol}
                          {ticker.isBreakout && (
                            <span title="Breakout">⚡</span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ticker.name || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {ticker.price.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        ticker.changePercentage > 0
                          ? "text-green-600"
                          : ticker.changePercentage < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      )}
                    >
                      {ticker.changePercentage > 0 ? "+" : ""}
                      {ticker.changePercentage.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {formatNumber(ticker.volume)}
                    </span>
                    {ticker.isVolumeSpike && (
                      <span className="text-xs font-bold text-orange-500">
                        🔥 Spike
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-medium",
                      ticker.netBrokerFlow > 0
                        ? "text-green-600"
                        : ticker.netBrokerFlow < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    {ticker.netBrokerFlow > 0 ? "+" : ""}
                    {formatNumber(ticker.netBrokerFlow)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-xs">
                    <div className="flex gap-1">
                      <span className="w-5 text-muted-foreground">1D:</span>
                      <span
                        className={cn(
                          "font-medium",
                          ticker.accumulationDistribution.d1 > 0
                            ? "text-green-600"
                            : ticker.accumulationDistribution.d1 < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {ticker.accumulationDistribution.d1 > 0 ? "+" : ""}
                        {ticker.accumulationDistribution.d1.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-5 text-muted-foreground">1W:</span>
                      <span
                        className={cn(
                          "font-medium",
                          ticker.accumulationDistribution.w1 > 0
                            ? "text-green-600"
                            : ticker.accumulationDistribution.w1 < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {ticker.accumulationDistribution.w1 > 0 ? "+" : ""}
                        {ticker.accumulationDistribution.w1.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-5 text-muted-foreground">1M:</span>
                      <span
                        className={cn(
                          "font-medium",
                          ticker.accumulationDistribution.m1 > 0
                            ? "text-green-600"
                            : ticker.accumulationDistribution.m1 < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {ticker.accumulationDistribution.m1 > 0 ? "+" : ""}
                        {ticker.accumulationDistribution.m1.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      ticker.bandarStatus === "Accumulation" &&
                        "bg-green-100 text-green-800 hover:bg-green-100",
                      ticker.bandarStatus === "Distribution" &&
                        "bg-red-100 text-red-800 hover:bg-red-100",
                      ticker.bandarStatus === "Neutral" &&
                        "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    )}
                  >
                    {ticker.bandarStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-bold",
                      ticker.smartMoneyScore >= 70
                        ? "text-green-600"
                        : ticker.smartMoneyScore <= 30
                          ? "text-red-600"
                          : "text-yellow-600"
                    )}
                  >
                    {ticker.smartMoneyScore}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      ticker.momentum === "Uptrend" && "text-green-600",
                      ticker.momentum === "Downtrend" && "text-red-600"
                    )}
                  >
                    {ticker.momentum}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticker.sector ? (
                    <Badge variant="default">{ticker.sector}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setTickerToDelete(ticker.symbol)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data?.data.length || 0} of {data?.meta.total || 0} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateParams({ page: 1 })}
            disabled={page <= 1 || isLoading}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="mx-2 flex items-center gap-2">
            <span className="text-sm font-medium">Page</span>
            <Input
              className="h-8 w-16 px-1 text-center"
              value={pageInput}
              type="number"
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const p = parseInt(pageInput)
                if (!isNaN(p) && p > 0) updateParams({ page: p })
                else setPageInput(page.toString())
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = parseInt(pageInput)
                  if (!isNaN(p) && p > 0) updateParams({ page: p })
                }
              }}
            />
            <span className="text-sm font-medium">
              of {data?.meta.totalPages || 1}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={!data || page >= data.meta.totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateParams({ page: data?.meta.totalPages || 1 })}
            disabled={!data || page >= data.meta.totalPages || isLoading}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
