import { useQuery } from "@tanstack/react-query"
import { getTransactionPattern } from "@/lib/apis/broker-summary/broker-summary-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface WhaleDetectionProps {
  symbol: string
  from?: string
  to?: string
}

export function WhaleDetection({ symbol, from, to }: WhaleDetectionProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transaction-pattern", symbol, from, to],
    queryFn: () => getTransactionPattern(symbol, from, to),
    enabled: !!symbol,
  })

  if (isLoading) {
    return (
      <div className="flex h-50 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-50 w-full items-center justify-center text-muted-foreground">
        Failed to load whale detection data
      </div>
    )
  }

  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(1)}B`
    if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`
    if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(0)}K`
    return val.toFixed(0)
  }

  const categoryColor: Record<string, string> = {
    "Institutional Foreign": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Institutional Local": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "Market Maker": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Smart Money": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Retail Major": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Retail Minor": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Retail: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Whale Detection (Door 2 - Entry Aggressiveness)
          </CardTitle>
          <Badge variant="outline">{data.totalBrokers} brokers</Badge>
        </div>
        {data.whales.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Top whales: {data.whales.map((w) => w.code).join(", ")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="max-h-100 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Net Val</TableHead>
                <TableHead className="text-right">Avg Buy Size</TableHead>
                <TableHead className="text-right">Buy Freq</TableHead>
                <TableHead className="text-right">Net Lot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.slice(0, 20).map((broker) => (
                <TableRow key={broker.code}>
                  <TableCell className="font-mono font-semibold">
                    {broker.code}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        categoryColor[broker.category] || categoryColor.Other
                      )}
                    >
                      {broker.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono",
                      broker.netVal > 0 ? "text-green-600" : broker.netVal < 0 ? "text-red-600" : ""
                    )}
                  >
                    {formatValue(broker.netVal)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatValue(broker.avgBuySize)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {broker.buyFreq.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono",
                      broker.netLot > 0 ? "text-green-600" : broker.netLot < 0 ? "text-red-600" : ""
                    )}
                  >
                    {broker.netLot.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
