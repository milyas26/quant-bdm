import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import {
  fetchAndSaveBrokerSummary,
  fetchAndSaveTickerInfo,
  getTickerDetail,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { format, startOfMonth, subMonths } from "date-fns"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useNavigate } from "react-router-dom"
import { BrokerBalance } from "@/components/broker-balance"
import { ArrowLeftIcon, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
                <h1 className="text-2xl font-bold">
                  {tickerInfo?.name || selectedTicker}
                </h1>
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
                  fetchMutation.isPending || fetchTickerInfoMutation.isPending
                }
              >
                {fetchMutation.isPending || fetchTickerInfoMutation.isPending
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
            Inventory{" "}
            <span className="ml-1 text-sm font-bold text-green-600">
              {brokerCode}
            </span>
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
          <BigCalendar
            selectedTicker={selectedTicker}
            date={date}
            valueType={valueType}
            onBrokerClick={handleBrokerClick}
            highlightedBroker={brokerCode}
          />
        </TabsContent>
        <TabsContent value="inventory" className="mt-2">
          <BrokerBalance
            selectedTicker={selectedTicker}
            date={date}
            brokerCode={brokerCode}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
