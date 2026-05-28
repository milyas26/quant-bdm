import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getActiveTrades,
  getTradeHistory,
  closeTrade,
  captureSnapshots,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { RefreshCw, Camera, Activity, History } from "lucide-react"
import {
  SummaryCards,
  TradesTable,
  HistorySummary,
} from "@/components/demo-trading"

export default function DemoTradingPage() {
  const queryClient = useQueryClient()
  const [closingId, setClosingId] = useState<number | null>(null)

  const { data: activeTrades = [], isLoading: loadingActive } = useQuery({
    queryKey: ["demo-trades", "active"],
    queryFn: getActiveTrades,
    refetchInterval: 60_000,
  })

  const { data: historyTrades = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["demo-trades", "history"],
    queryFn: getTradeHistory,
  })

  const { mutate: handleClose, isPending: isClosing } = useMutation({
    mutationFn: closeTrade,
    onMutate: (id) => setClosingId(id),
    onSuccess: () => {
      toast.success("Trade closed")
      queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error ?? "Failed to close trade"),
    onSettled: () => setClosingId(null),
  })

  const { mutate: handleSnapshot, isPending: isSnapshotting } = useMutation({
    mutationFn: captureSnapshots,
    onSuccess: () => toast.success("Snapshots captured"),
    onError: () => toast.error("Failed to capture snapshots"),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold tracking-tight">
            Portfolio
          </h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Demo trading. No real money involved.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-sm font-mono text-[11px]"
            disabled={isSnapshotting}
            onClick={() => handleSnapshot()}
          >
            {isSnapshotting ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-sm font-mono text-[11px]"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
            }
          >
            <RefreshCw className="mr-1 h-3 w-3" /> Refresh
          </Button>
        </div>
      </div>

      <SummaryCards trades={activeTrades} loading={loadingActive} />

      <Tabs defaultValue="active">
        <TabsList className="h-8 rounded-sm">
          <TabsTrigger
            value="active"
            className="h-7 gap-1.5 rounded-sm font-mono text-[11px]"
          >
            <Activity className="h-3 w-3" /> Active
            {!loadingActive && activeTrades.length > 0 && (
              <Badge className="text-positive bg-positive h-4 min-w-4 rounded-sm border-emerald-400/20 px-1 text-[10px]">
                {activeTrades.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="h-7 gap-1.5 rounded-sm font-mono text-[11px]"
          >
            <History className="h-3 w-3" /> History
            {!loadingHistory && historyTrades.length > 0 && (
              <Badge
                variant="secondary"
                className="h-4 min-w-4 rounded-sm px-1 text-[10px]"
              >
                {historyTrades.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <TradesTable
            trades={activeTrades}
            showCloseButton
            onClose={(id) => handleClose(id)}
            isClosing={isClosing}
            closingId={closingId}
            loading={loadingActive}
          />
        </TabsContent>
        <TabsContent value="history">
          {!loadingHistory && historyTrades.length > 0 && (
            <HistorySummary trades={historyTrades} />
          )}
          <TradesTable
            trades={historyTrades}
            showCloseButton={false}
            loading={loadingHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
