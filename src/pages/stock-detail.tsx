import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAndSaveBrokerSummary } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useNavigate } from "react-router-dom"
import TradingViewWidget from "@/components/tradingview-widget"
import { BrokerBalance } from "@/components/broker-balance"

export default function StockDetail() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { ticker } = useParams()
  const selectedTicker = ticker?.toUpperCase() || ""
  const [inputValue, setInputValue] = useState(selectedTicker)
  const [brokerCode, setBrokerCode] = useState("")

  const handleBrokerClick = (code: string) => {
    setBrokerCode(code)
  }
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(selectedTicker)
  }, [selectedTicker])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 120),
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

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              DETAIL
            </span>
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/stock/${inputValue}`)
                  }
                }}
                className="h-8 w-40 px-2 text-lg font-bold"
                placeholder="Ticker"
              />
              <p className="absolute top-1/2 right-1 -translate-y-1/2 rounded-sm bg-slate-100 px-2 py-0.5 text-sm font-bold text-gray-500 dark:bg-slate-700">
                /
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Select
              value={valueType}
              onValueChange={(val) => setValueType(val as "Net" | "Gross")}
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
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => fetchMutation.mutate()}
            disabled={fetchMutation.isPending || !date?.from || !date?.to}
          >
            {fetchMutation.isPending ? "Fetching..." : "Fetch Broker Summary"}
          </Button>
          {fetchMutation.isError && (
            <div className="text-right text-xs text-red-500">
              {(fetchMutation.error as any)?.response?.data?.error ||
                (fetchMutation.error as Error).message}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="broker-summary">Broker Summary</TabsTrigger>
          <TabsTrigger value="broker-balance">Broker Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-2">
          <TradingViewWidget symbol={selectedTicker} />
        </TabsContent>
        <TabsContent value="broker-summary" className="mt-2">
          <BigCalendar
            selectedTicker={selectedTicker}
            date={date}
            valueType={valueType}
            onBrokerClick={handleBrokerClick}
            highlightedBroker={brokerCode}
          />
        </TabsContent>
        <TabsContent value="broker-balance" className="mt-2">
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
