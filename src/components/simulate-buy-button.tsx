import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { simulateBuy } from "@/lib/api"
import type { ScreenerTicker } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, TrendingUp, Zap, BarChart2, Activity } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SimulateBuyButtonProps {
  ticker: ScreenerTicker
  quantity?: number
}

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

const fmtVolume = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return String(n)
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-medium">{value}</span>
  </div>
)

export function SimulateBuyButton({
  ticker,
  quantity = 100,
}: SimulateBuyButtonProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => simulateBuy({ screenerId: ticker.screenerId, quantity }),
    onSuccess: (trade) => {
      toast.success(`Simulated BUY ${ticker.symbol} @ ${fmtPrice(trade.entryPrice)}`, {
        description: `Qty: ${quantity} lot — Trade #${trade.id} is now open.`,
      })
      queryClient.invalidateQueries({ queryKey: ["demo-trades"] })
      setOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? `Failed to simulate buy for ${ticker.symbol}`)
    },
  })

  const estimatedCost = ticker.price * quantity * 100

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 cursor-pointer text-xs text-green-500 border-green-500/40 hover:bg-green-500/10 hover:text-green-400 rounded-xs"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <ShoppingCart className="h-3 w-3 mr-1" />
        Buy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-500" />
              Konfirmasi Simulate Buy
            </DialogTitle>
          </DialogHeader>

          {/* Ticker identity */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3">
            {ticker.logo ? (
              <img
                src={ticker.logo}
                alt={ticker.symbol}
                className="h-10 w-10 rounded-md object-contain bg-background border"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-sm font-bold">
                {ticker.symbol.slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight">{ticker.symbol}</p>
              {ticker.name && (
                <p className="text-xs text-muted-foreground truncate">{ticker.name}</p>
              )}
              {ticker.sector && (
                <Badge variant="secondary" className="mt-1 text-xs">{ticker.sector}</Badge>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-base">{fmtPrice(ticker.price)}</p>
              <p className={cn("text-xs font-medium", ticker.changePercentage >= 0 ? "text-green-500" : "text-red-500")}>
                {ticker.changePercentage >= 0 ? "+" : ""}
                {ticker.changePercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Signal flags */}
          <div className="flex flex-wrap gap-1.5 px-1">
            {ticker.isBreakout && (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/40 gap-1">
                <Zap className="h-3 w-3" /> Breakout
              </Badge>
            )}
            {ticker.isVolumeSpike && (
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/40 gap-1">
                <BarChart2 className="h-3 w-3" /> Volume Spike
              </Badge>
            )}
            <Badge variant="outline" className="text-xs gap-1">
              <Activity className="h-3 w-3" />
              {ticker.bandarStatus}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Momentum: {ticker.momentum}
            </Badge>
          </div>

          <Separator />

          {/* Detail scores */}
          <div className="px-1">
            <InfoRow
              label="Smart Money Score"
              value={
                <span className={cn(ticker.smartMoneyScore >= 70 ? "text-green-500" : ticker.smartMoneyScore >= 40 ? "text-yellow-500" : "text-red-500")}>
                  {ticker.smartMoneyScore.toFixed(1)}
                </span>
              }
            />
            <InfoRow label="Liquidity Score" value={ticker.liquidityScore} />
            <InfoRow
              label="Net Broker Flow"
              value={
                <span className={cn(ticker.netBrokerFlow >= 0 ? "text-green-500" : "text-red-500")}>
                  {ticker.netBrokerFlow >= 0 ? "+" : ""}{fmtVolume(ticker.netBrokerFlow)}
                </span>
              }
            />
            <InfoRow label="Volume" value={fmtVolume(ticker.volume)} />
            <InfoRow
              label="Acc/Dist 1D"
              value={
                <span className={cn(ticker.accumulationDistribution.d1 >= 0 ? "text-green-500" : "text-red-500")}>
                  {ticker.accumulationDistribution.d1 >= 0 ? "+" : ""}
                  {fmtVolume(ticker.accumulationDistribution.d1)}
                </span>
              }
            />
            <InfoRow
              label="Acc/Dist 1W"
              value={
                <span className={cn(ticker.accumulationDistribution.w1 >= 0 ? "text-green-500" : "text-red-500")}>
                  {ticker.accumulationDistribution.w1 >= 0 ? "+" : ""}
                  {fmtVolume(ticker.accumulationDistribution.w1)}
                </span>
              }
            />
          </div>

          <Separator />

          {/* Order summary */}
          <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1.5">
            <InfoRow label="Entry Price (estimasi)" value={<span className="font-semibold">{fmtPrice(ticker.price)}</span>} />
            <InfoRow label="Quantity" value={`${quantity} lot (${(quantity * 100).toLocaleString("id-ID")} lembar)`} />
            <InfoRow
              label="Estimasi Nilai Transaksi"
              value={<span className="font-semibold text-green-500">Rp {fmtPrice(estimatedCost)}</span>}
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Ini adalah simulasi. Tidak ada uang nyata yang digunakan.
          </p>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Batal
              </Button>
            </DialogClose>
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isPending}
              onClick={() => mutate()}
            >
              {isPending ? (
                "Memproses…"
              ) : (
                <>
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  Konfirmasi Buy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
