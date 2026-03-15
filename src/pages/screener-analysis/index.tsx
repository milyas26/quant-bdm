import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { format } from "date-fns"
import { getScreenerAnalysis } from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

export default function ScreenerAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")

  const [symbolInput, setSymbolInput] = useState(
    searchParams.get("symbol") || ""
  )

  const debouncedSymbol = useDebounce(symbolInput, 500)

  const signalType = searchParams.get("signalType") || "ALL"
  const [pageInput, setPageInput] = useState(page.toString())

  const updateParams = (
    updates: Record<string, string | number | undefined>
  ) => {
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

  useEffect(() => {
    setPageInput(page.toString())
  }, [page])

  useEffect(() => {
    if (debouncedSymbol !== (searchParams.get("symbol") || "")) {
      updateParams({ symbol: debouncedSymbol, page: 1 })
    }
  }, [debouncedSymbol])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["screenerAnalysis", page, limit, debouncedSymbol, signalType],
    queryFn: () =>
      getScreenerAnalysis({
        page,
        limit,
        symbol: debouncedSymbol || undefined,
        signalType: signalType === "ALL" ? undefined : signalType,
      }),
  })

  const getSignalInfo = (row: any) => {
    if (signalType === "bandarStatus") return { type: "Bandar Status", value: row.screener.bandarStatus };
    if (signalType === "isBreakout") return { type: "Breakout", value: row.screener.isBreakout ? "Yes" : "No" };
    if (signalType === "isVolumeSpike") return { type: "Volume Spike", value: row.screener.isVolumeSpike ? "Yes" : "No" };
    if (signalType === "smartMoneyScore") return { type: "Smart Money", value: row.screener.smartMoneyScore };
    
    // Default fallback if ALL
    const signals = [];
    if (row.screener.bandarStatus !== "Neutral") signals.push(`${row.screener.bandarStatus}`);
    if (row.screener.isBreakout) signals.push("Breakout");
    if (row.screener.isVolumeSpike) signals.push("Vol Spike");
    if (Number(row.screener.smartMoneyScore) >= 70) signals.push(`Score ${row.screener.smartMoneyScore}`);
    
    return { 
      type: "Signals", 
      value: signals.length > 0 ? signals.join(", ") : "None" 
    };
  };

  const formatPercent = (val: any) => {
    if (val === null || val === undefined) return "-";
    const num = Number(val);
    if (isNaN(num)) return "-";
    return `${(num * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Screener Signal Performance Analysis</h1>
      </div>

      <Card className="bg-card/20">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-end">
            <div className="w-full space-y-2 md:w-48">
              <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Symbol
              </label>
              <Input
                placeholder="e.g. BBCA"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              />
            </div>
            <div className="w-full space-y-2 md:w-48">
              <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Signal Type
              </label>
              <Select
                value={signalType}
                onValueChange={(val) =>
                  updateParams({ signalType: val, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Signals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Signals</SelectItem>
                  <SelectItem value="bandarStatus">Bandar Status</SelectItem>
                  <SelectItem value="isBreakout">Breakout</SelectItem>
                  <SelectItem value="isVolumeSpike">Volume Spike</SelectItem>
                  <SelectItem value="smartMoneyScore">Smart Money Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">1D</TableHead>
              <TableHead className="text-right">3D</TableHead>
              <TableHead className="text-right">5D</TableHead>
              <TableHead className="text-right">10D</TableHead>
              <TableHead className="text-right">20D</TableHead>
              <TableHead className="text-right">Peak Ret</TableHead>
              <TableHead className="text-right">Days To Peak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center">
                  Loading analysis data...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center text-red-500"
                >
                  Error: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center text-muted-foreground"
                >
                  No analysis data found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {format(new Date(row.signalDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-bold">{row.symbol}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background">
                      {getSignalInfo(row).type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        getSignalInfo(row).value === "Accumulation" ||
                          getSignalInfo(row).value === "Yes" ||
                          String(getSignalInfo(row).value).includes("Score")
                          ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                          : getSignalInfo(row).value === "Distribution"
                            ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {getSignalInfo(row).value}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(row.signalPrice).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      Number(row.return1D) > 0
                        ? "text-green-600"
                        : Number(row.return1D) < 0
                          ? "text-red-600"
                          : ""
                    )}
                  >
                    {formatPercent(row.return1D)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      Number(row.return3D) > 0
                        ? "text-green-600"
                        : Number(row.return3D) < 0
                          ? "text-red-600"
                          : ""
                    )}
                  >
                    {formatPercent(row.return3D)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      Number(row.return5D) > 0
                        ? "text-green-600"
                        : Number(row.return5D) < 0
                          ? "text-red-600"
                          : ""
                    )}
                  >
                    {formatPercent(row.return5D)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      Number(row.return10D) > 0
                        ? "text-green-600"
                        : Number(row.return10D) < 0
                          ? "text-red-600"
                          : ""
                    )}
                  >
                    {formatPercent(row.return10D)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      Number(row.return20D) > 0
                        ? "text-green-600"
                        : Number(row.return20D) < 0
                          ? "text-red-600"
                          : ""
                    )}
                  >
                    {formatPercent(row.return20D)}
                  </TableCell>
                  <TableCell className={cn("text-right font-bold", Number(row.peakReturn) > 0 ? 'text-green-600' : Number(row.peakReturn) < 0 ? 'text-red-600' : '')}>
                    {formatPercent(row.peakReturn)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.daysToPeak ?? "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
