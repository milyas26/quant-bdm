import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from "@tanstack/react-query"
import {
  fetchAndSaveBrokerSummary,
  fetchAndSaveTickerInfo,
  getTickerDetail,
  fetchAndSaveHistoricalData,
  getHistoricalScreenerData,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { format, startOfMonth, subMonths } from "date-fns"
import { BrokerSummaryDashboard } from "@/components/broker-summary-dashboard"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BrokerInventory } from "@/components/broker-inventory"
import { HistoricalScreener } from "@/components/historical-screener"

import { cn } from "@/lib/utils"

export default function StockDetail() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { ticker } = useParams()
  const selectedTicker = ticker?.toUpperCase() || ""
  const [brokerCode, setBrokerCode] = useState("")

  const { data: tickerInfo, refetch: refetchTickerInfo } = useQuery({
    queryKey: ["ticker-detail", selectedTicker],
    queryFn: () => getTickerDetail(selectedTicker),
    enabled: !!selectedTicker,
  })

  const {
    data: historicalScreenerData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["historical-screener", selectedTicker],
    queryFn: ({ pageParam = 1 }) =>
      getHistoricalScreenerData(selectedTicker, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!selectedTicker,
  })

  const flattenedHistoricalData = useMemo(() => {
    return historicalScreenerData?.pages.flatMap((page) => page.data) || []
  }, [historicalScreenerData])

  const handleBrokerClick = (code: string) => {
    setBrokerCode(code)
  }

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: new Date(),
  })
  const [valueType, setValueType] = useState<"Net" | "Gross">("Net")

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

  const fetchTickerInfoMutation = useMutation({
    mutationFn: () => fetchAndSaveTickerInfo(selectedTicker!),
    onSuccess: () => {
      refetchTickerInfo()
    },
  })

  const fetchHistoricalDataMutation = useMutation({
    mutationFn: () =>
      fetchAndSaveHistoricalData({
        symbol: selectedTicker!,
      }),
    onSuccess: () => {
      // You might want to invalidate queries here if you display historical data
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Button
              onClick={() => navigate("/stock")}
              variant="ghost"
              className="cursor-pointer"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-4">
              {tickerInfo?.logo && (
                <img
                  src={tickerInfo.logo}
                  alt={selectedTicker}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    {tickerInfo?.name || selectedTicker}
                  </h1>
                  {tickerInfo?.latestHistoricalData && (
                    <div className="flex items-center gap-2 border-l border-gray-300 px-2">
                      <span className="text-xl font-bold">
                        {parseInt(
                          tickerInfo.latestHistoricalData.close
                        ).toLocaleString()}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          parseFloat(
                            tickerInfo.latestHistoricalData.change_percentage
                          ) > 0
                            ? "text-green-600"
                            : parseFloat(
                                  tickerInfo.latestHistoricalData
                                    .change_percentage
                                ) < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        )}
                      >
                        {parseFloat(
                          tickerInfo.latestHistoricalData.change_percentage
                        ) > 0
                          ? "+"
                          : ""}
                        {parseFloat(
                          tickerInfo.latestHistoricalData.change_percentage
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {tickerInfo?.sector && (
                    <Badge variant="default">{tickerInfo.sector}</Badge>
                  )}
                  {tickerInfo?.subSector && (
                    <Badge variant="secondary">{tickerInfo.subSector}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                disabled={
                  fetchMutation.isPending ||
                  fetchTickerInfoMutation.isPending ||
                  fetchHistoricalDataMutation.isPending
                }
              >
                {fetchMutation.isPending ||
                fetchTickerInfoMutation.isPending ||
                fetchHistoricalDataMutation.isPending
                  ? "Fetching..."
                  : "Fetch Data"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => fetchMutation.mutate()}
                disabled={!date?.from || !date?.to}
              >
                Broker Summary
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fetchTickerInfoMutation.mutate()}
              >
                Ticker Info
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fetchHistoricalDataMutation.mutate()}
              >
                Historical Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {fetchMutation.isError && (
            <div className="text-right text-xs text-red-500">
              {(fetchMutation.error as any)?.response?.data?.error ||
                (fetchMutation.error as Error).message}
            </div>
          )}
          {fetchTickerInfoMutation.isError && (
            <div className="text-right text-xs text-red-500">
              {(fetchTickerInfoMutation.error as any)?.response?.data?.error ||
                (fetchTickerInfoMutation.error as Error).message}
            </div>
          )}
          {fetchHistoricalDataMutation.isError && (
            <div className="text-right text-xs text-red-500">
              {(fetchHistoricalDataMutation.error as any)?.response?.data
                ?.error || (fetchHistoricalDataMutation.error as Error).message}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="broker-summary" className="w-full">
        <TabsList className="bg-transparent">
          <TabsTrigger
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="broker-summary"
          >
            Broker Summary
          </TabsTrigger>
          <TabsTrigger
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="inventory"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="historical-screener"
          >
            Historical Screener
          </TabsTrigger>
        </TabsList>
        <TabsContent value="broker-summary" className="mt-2">
          <div className="mb-4 flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Select
              value={valueType}
              onValueChange={(val) => setValueType(val as "Net" | "Gross")}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="Net">Net</SelectItem>
                <SelectItem value="Gross">Gross</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <BrokerSummaryDashboard
            selectedTicker={selectedTicker}
            date={date}
            valueType={valueType}
            onBrokerClick={handleBrokerClick}
            highlightedBroker={brokerCode}
          />
        </TabsContent>
        <TabsContent value="inventory" className="mt-2">
          <BrokerInventory selectedTicker={selectedTicker} />
        </TabsContent>
        <TabsContent value="historical-screener" className="mt-2">
          <HistoricalScreener
            data={flattenedHistoricalData}
            fetchNextPage={fetchNextPage}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
