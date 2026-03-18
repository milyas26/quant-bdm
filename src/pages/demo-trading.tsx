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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { RefreshCw, Camera, Activity, History } from "lucide-react"
import {
  SummaryCards,
  TradesTable,
  HistorySummary,
} from "@/components/demo-trading"

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      toast.success("Trade closed successfully")
      queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to close trade")
    },
    onSettled: () => setClosingId(null),
  })

  const { mutate: handleSnapshot, isPending: isSnapshotting } = useMutation({
    mutationFn: captureSnapshots,
    onSuccess: () => toast.success("Price snapshots captured"),
    onError: () => toast.error("Failed to capture snapshots"),
  })

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Demo Trading</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Simulate &amp; track trades from screener signals — no real money.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSnapshotting}
            onClick={() => handleSnapshot()}
          >
            {isSnapshotting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            Capture Snapshots
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
            }
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <Separator />

      {/* Summary */}
      <SummaryCards trades={activeTrades} loading={loadingActive} />

      {/* Tabs */}
      <Tabs defaultValue="active" className="gap-4">
        <TabsList className="h-9">
          <TabsTrigger value="active" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Active Trades
            {!loadingActive && activeTrades.length > 0 && (
              <Badge className="ml-0.5 h-4 min-w-4 border-emerald-500/30 bg-emerald-500/20 px-1 text-[10px] text-emerald-500">
                {activeTrades.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            History
            {!loadingHistory && historyTrades.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 min-w-4 px-1 text-[10px]"
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
