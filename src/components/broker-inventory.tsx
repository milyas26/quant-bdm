import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBrokerInventory } from "@/lib/api"
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatNumber, formatNumberWithDecimal } from "@/lib/utils"
import { BrokerInventoryChart } from "./broker-inventory-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BrokerInventoryProps {
  selectedTicker: string
}

type Period = "1 month" | "3 month" | "6 month"

const TYPE_MAP = {
  ASING: {
    lot: "netALot",
    val: "netAVal",
    avg: "avgNetAPrice",
    label: "Asing",
  },
  RITEL: {
    lot: "netRLot",
    val: "netRVal",
    avg: "avgNetRPrice",
    label: "Ritel",
  },
  LOKAL: {
    lot: "netLLot",
    val: "netLVal",
    avg: "avgNetLPrice",
    label: "Lokal",
  },
  PEMERINTAH: {
    lot: "netPLot",
    val: "netPVal",
    avg: "avgNetPPrice",
    label: "Pemerintah",
  },
  SMART_MONEY: {
    lot: "netSMLot",
    val: "netSMVal",
    avg: "avgNetSMPrice",
    label: "Smart Money",
  },
  DUMB_MONEY: {
    lot: "netDMLot",
    val: "netDMVal",
    avg: "avgNetDMPrice",
    label: "Dumb Money",
  },
} as const

export function BrokerInventory({ selectedTicker }: BrokerInventoryProps) {
  const [period, setPeriod] = useState<Period>("1 month")
  const [activeTab, setActiveTab] = useState<keyof typeof TYPE_MAP>("ASING")

  const {
    data: brokerInventory,
    isError,
    error,
  } = useQuery({
    queryKey: ["broker-inventory", selectedTicker, period],
    queryFn: () => getBrokerInventory(selectedTicker, period),
    enabled: !!selectedTicker,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const currentTypeData = useMemo(() => {
    if (!brokerInventory) return []

    const keys = TYPE_MAP[activeTab]
    let currentTotalLot = 0
    let currentTotalVal = 0

    // Data is from API is ascending (Oldest to Newest)
    const withRunningBalance = brokerInventory.data.map((item: any) => {
      const netLot = item[keys.lot]
      const netVal = item[keys.val]
      
      currentTotalLot += netLot
      currentTotalVal += netVal
      
      return {
        ...item,
        netLot, // For Inventory Chart
        netVal,
        runningBalance: currentTotalLot, // For Balance Position Chart
        runningBalanceVal: currentTotalVal,
      }
    })

    return withRunningBalance
  }, [brokerInventory, activeTab])

  const resumeData = useMemo(() => {
    if (!brokerInventory) return null
    const keys = TYPE_MAP[activeTab]
    return {
      netLot: brokerInventory.resume[keys.lot],
      netVal: brokerInventory.resume[keys.val],
      avgNetPrice: brokerInventory.resume[keys.avg],
    }
  }, [brokerInventory, activeTab])

  return (
    <div className="space-y-4">
      {isError && (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Broker Inventory Analysis</h2>
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1 month">1 Month</SelectItem>
            <SelectItem value="3 month">3 Months</SelectItem>
            <SelectItem value="6 month">6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        defaultValue="ASING"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as keyof typeof TYPE_MAP)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {Object.entries(TYPE_MAP).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <div>
                <p className="mb-2 text-left font-semibold">
                  Inventory (Accumulation/Distribution) - {TYPE_MAP[activeTab].label}
                </p>
                <BrokerInventoryChart
                  data={currentTypeData}
                  dataKey="netLot"
                  valueKey="netVal"
                  label="Net Lot"
                  title=""
                />
              </div>
              <div>
                <p className="mb-2 text-left font-semibold">
                  Balance Position (Running Balance) - {TYPE_MAP[activeTab].label}
                </p>
                <BrokerInventoryChart
                  data={currentTypeData}
                  dataKey="runningBalance"
                  valueKey="runningBalanceVal"
                  label="Inventory"
                  title=""
                />
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-5">
              <div className="rounded-md border p-4">
                 <h3 className="mb-4 font-semibold text-lg">Summary ({period})</h3>
                 <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Metric</TableCell>
                      <TableCell className="text-right">Value</TableCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    <TableRow>
                      <TableCell>Total Net Lot</TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          (resumeData?.netLot || 0) < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        )}
                      >
                        {formatNumber(resumeData?.netLot || 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Net Value</TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          (resumeData?.netVal || 0) < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        )}
                      >
                        {formatNumber(resumeData?.netVal || 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Avg Net Price</TableCell>
                      <TableCell className="text-right">
                        {formatNumberWithDecimal(resumeData?.avgNetPrice || 0)}
                      </TableCell>
                    </TableRow>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
