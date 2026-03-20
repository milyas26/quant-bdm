import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getWatchlists,
  addTickerToWatchlist,
  deleteTickerFromWatchlist,
  createWatchlist,
  getWatchlistIdsByTicker,
} from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, BookmarkCheck } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddToWatchlistDialogProps {
  symbol: string | null
  onClose: () => void
}

export function AddToWatchlistDialog({ symbol, onClose }: AddToWatchlistDialogProps) {
  const queryClient = useQueryClient()
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [showNewInput, setShowNewInput] = useState(false)

  const { data: watchlists, isLoading } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
    enabled: !!symbol,
  })

  const { data: activeWatchlistIds = [] } = useQuery({
    queryKey: ["watchlists-by-ticker", symbol],
    queryFn: () => getWatchlistIdsByTicker(symbol!),
    enabled: !!symbol,
  })

  const { mutate: addTicker, isPending: isAdding } = useMutation({
    mutationFn: ({ watchlistId, sym }: { watchlistId: number; sym: string }) =>
      addTickerToWatchlist(watchlistId, sym),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      queryClient.invalidateQueries({ queryKey: ["watchlists-by-ticker", symbol] })
      queryClient.invalidateQueries({ queryKey: ["tickers"] })
      queryClient.invalidateQueries({ queryKey: ["watchlist-tickers"] })
    },
    onError: () => toast.error("Gagal menambahkan ke watchlist"),
  })

  const { mutate: removeTicker, isPending: isRemoving } = useMutation({
    mutationFn: ({ watchlistId, sym }: { watchlistId: number; sym: string }) =>
      deleteTickerFromWatchlist(watchlistId, sym),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      queryClient.invalidateQueries({ queryKey: ["watchlists-by-ticker", symbol] })
      queryClient.invalidateQueries({ queryKey: ["tickers"] })
      queryClient.invalidateQueries({ queryKey: ["watchlist-tickers"] })
    },
    onError: () => toast.error("Gagal menghapus dari watchlist"),
  })

  const { mutate: handleCreateWatchlist, isPending: isCreating } = useMutation({
    mutationFn: createWatchlist,
    onSuccess: (newWatchlist) => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      if (symbol) {
        addTicker({ watchlistId: newWatchlist.id, sym: symbol })
        toast.success(`"${symbol}" ditambahkan ke "${newWatchlist.name}"`)
      }
      setNewWatchlistName("")
      setShowNewInput(false)
    },
    onError: () => toast.error("Gagal membuat watchlist"),
  })

  const handleToggle = (watchlistId: number, isInWatchlist: boolean) => {
    if (!symbol) return
    if (isInWatchlist) {
      removeTicker({ watchlistId, sym: symbol })
    } else {
      addTicker({ watchlistId, sym: symbol })
    }
  }

  const handleCreateAndAdd = () => {
    if (!newWatchlistName.trim()) return
    handleCreateWatchlist({ name: newWatchlistName.trim() })
  }

  const isMutating = isAdding || isRemoving

  return (
    <Dialog open={!!symbol} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4" />
            Tambah ke Watchlist
          </DialogTitle>
          {symbol && (
            <p className="text-sm font-semibold text-muted-foreground">{symbol}</p>
          )}
        </DialogHeader>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))
          ) : watchlists?.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Belum ada watchlist.
            </p>
          ) : (
            watchlists?.map((watchlist) => {
              const isInWatchlist = activeWatchlistIds.includes(watchlist.id)
              return (
                <div
                  key={watchlist.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted",
                    isMutating && "pointer-events-none opacity-60"
                  )}
                  onClick={() => handleToggle(watchlist.id, isInWatchlist)}
                >
                  <Checkbox
                    checked={isInWatchlist}
                    onCheckedChange={() => handleToggle(watchlist.id, isInWatchlist)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="flex-1 text-sm font-medium">{watchlist.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {watchlist._count.tickers} tickers
                  </span>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t pt-3">
          {showNewInput ? (
            <div className="flex gap-2">
              <Input
                className="h-8 flex-1 text-sm"
                placeholder="Nama watchlist..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCreateAndAdd}
                disabled={!newWatchlistName.trim() || isCreating}
              >
                Buat
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewInput(false)
                  setNewWatchlistName("")
                }}
              >
                Batal
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setShowNewInput(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat watchlist baru
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
