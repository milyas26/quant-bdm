import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useInView } from "react-intersection-observer"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface HistoricalScreenerProps {
  data: any[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

export function HistoricalScreener({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: HistoricalScreenerProps) {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No historical screener data available
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-9"></div>
      <div className="col-span-3 flex max-h-[calc(100vh-200px)] flex-col gap-0.5 overflow-y-auto pr-2">
        {data.map((item: any, index: number) => (
          <div
            key={`${item.date}-${index}`}
            ref={index === data.length - 1 ? ref : undefined}
            className="flex flex-col gap-1 rounded-md border p-2 hover:bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">
                {format(new Date(item.date), "dd MMM yyyy")}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-4 px-1 text-[9px] font-normal",
                    item.momentum === "Uptrend" &&
                      "border-green-200 bg-green-50 text-green-700",
                    item.momentum === "Downtrend" &&
                      "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {item.momentum}
                </Badge>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    item.smartMoneyScore >= 70
                      ? "text-green-600"
                      : item.smartMoneyScore <= 30
                        ? "text-red-600"
                        : "text-yellow-600"
                  )}
                >
                  Score: {item.smartMoneyScore.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {item.price.toLocaleString()}
                  </span>
                  <span
                    className={cn(
                      item.changePercentage > 0
                        ? "text-green-600"
                        : item.changePercentage < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    )}
                  >
                    ({item.changePercentage > 0 ? "+" : ""}
                    {item.changePercentage.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Vol</span>
                <div className="flex items-center gap-1">
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(item.volume)}
                  </span>
                  {item.isVolumeSpike && (
                    <span className="font-bold text-orange-500">🔥</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Net</span>
                <span
                  className={cn(
                    "font-medium",
                    item.netBrokerFlow > 0
                      ? "text-green-600"
                      : item.netBrokerFlow < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  )}
                >
                  {item.netBrokerFlow > 0 ? "+" : ""}
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(item.netBrokerFlow)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={cn(
                    "h-3.5 px-1 text-[9px] font-normal",
                    item.bandarStatus === "Accumulation" &&
                      "bg-green-100 text-green-800 hover:bg-green-100",
                    item.bandarStatus === "Distribution" &&
                      "bg-red-100 text-red-800 hover:bg-red-100",
                    item.bandarStatus === "Neutral" &&
                      "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  )}
                >
                  {item.bandarStatus === "Accumulation"
                    ? "Acc"
                    : item.bandarStatus === "Distribution"
                      ? "Dist"
                      : item.bandarStatus}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-1 text-[9px]">
              <span className="text-muted-foreground">Acc/Dist:</span>
              <div className="flex gap-1.5">
                <span
                  className={cn(
                    item.accumulationDistribution.d1 > 0
                      ? "text-green-600"
                      : item.accumulationDistribution.d1 < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  )}
                >
                  D1: {item.accumulationDistribution.d1.toFixed(1)}%
                </span>
                <span
                  className={cn(
                    item.accumulationDistribution.w1 > 0
                      ? "text-green-600"
                      : item.accumulationDistribution.w1 < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  )}
                >
                  W1: {item.accumulationDistribution.w1.toFixed(1)}%
                </span>
                <span
                  className={cn(
                    item.accumulationDistribution.m1 > 0
                      ? "text-green-600"
                      : item.accumulationDistribution.m1 < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  )}
                >
                  M1: {item.accumulationDistribution.m1.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
