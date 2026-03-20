import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  getWatchlists,
  createWatchlist,
  deleteWatchlist,
  deleteTickerFromWatchlist,
  reorderWatchlists,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  BookmarkX,
  ListFilter,
  GripVertical,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Watchlist } from "@/lib/api"

// Sortable watchlist item component
function SortableWatchlistItem({
  watchlist,
  isActive,
  onSelect,
  onDelete,
}: {
  watchlist: Watchlist
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: watchlist.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-md mx-1 px-2 py-2.5 transition-colors hover:bg-muted",
        isActive && "bg-primary/10 text-primary hover:bg-primary/10",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <span className={cn("truncate text-sm font-medium", isActive && "text-primary")}>
          {watchlist.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
          {watchlist.tickers.length}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

export default function WatchlistPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeWatchlistId, setActiveWatchlistId] = useState<number | null>(null)
  const [localWatchlists, setLocalWatchlists] = useState<Watchlist[]>([])
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [showNewInput, setShowNewInput] = useState(false)
  const [deleteWatchlistTarget, setDeleteWatchlistTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleteTickerTarget, setDeleteTickerTarget] = useState<{ watchlistId: number; symbol: string } | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const { data: watchlists, isLoading } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
  })

  // Sync local state from server
  useEffect(() => {
    if (watchlists) {
      setLocalWatchlists(watchlists)
      if (activeWatchlistId === null && watchlists.length > 0) {
        setActiveWatchlistId(watchlists[0].id)
      }
    }
  }, [watchlists])

  const { mutate: handleCreateWatchlist, isPending: isCreating } = useMutation({
    mutationFn: createWatchlist,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      setActiveWatchlistId(created.id)
      setNewWatchlistName("")
      setShowNewInput(false)
      toast.success(`Watchlist "${created.name}" berhasil dibuat`)
    },
    onError: () => toast.error("Gagal membuat watchlist"),
  })

  const { mutate: handleDeleteWatchlist, isPending: isDeletingWatchlist } = useMutation({
    mutationFn: deleteWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      if (deleteWatchlistTarget?.id === activeWatchlistId) {
        setActiveWatchlistId(null)
      }
      toast.success("Watchlist berhasil dihapus")
      setDeleteWatchlistTarget(null)
    },
    onError: () => toast.error("Gagal menghapus watchlist"),
  })

  const { mutate: handleDeleteTicker } = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: number; symbol: string }) =>
      deleteTickerFromWatchlist(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      toast.success("Ticker berhasil dihapus dari watchlist")
      setDeleteTickerTarget(null)
    },
    onError: () => toast.error("Gagal menghapus ticker"),
  })

  const { mutate: handleReorder } = useMutation({
    mutationFn: reorderWatchlists,
    onError: () => {
      // Revert on error
      if (watchlists) setLocalWatchlists(watchlists)
      toast.error("Gagal menyimpan urutan watchlist")
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLocalWatchlists((prev) => {
      const oldIndex = prev.findIndex((w) => w.id === active.id)
      const newIndex = prev.findIndex((w) => w.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      handleReorder(reordered.map((w) => w.id))
      return reordered
    })
  }

  const activeWatchlist = localWatchlists.find((w) => w.id === activeWatchlistId)

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0 overflow-hidden rounded-lg border bg-card">
      {/* Left sidebar - Watchlist list */}
      <div className="flex w-64 shrink-0 flex-col border-r">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Watchlists</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowNewInput((v) => !v)}
            title="Buat watchlist baru"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showNewInput && (
          <div className="border-b px-3 py-2">
            <div className="flex gap-1.5">
              <Input
                className="h-7 flex-1 text-xs"
                placeholder="Nama watchlist..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newWatchlistName.trim()) {
                    handleCreateWatchlist({ name: newWatchlistName.trim() })
                  }
                  if (e.key === "Escape") {
                    setShowNewInput(false)
                    setNewWatchlistName("")
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  newWatchlistName.trim() &&
                  handleCreateWatchlist({ name: newWatchlistName.trim() })
                }
                disabled={!newWatchlistName.trim() || isCreating}
              >
                Buat
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-1">
          {isLoading ? (
            <div className="space-y-1 px-2 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : localWatchlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <BookmarkX className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Belum ada watchlist</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={localWatchlists.map((w) => w.id)} strategy={verticalListSortingStrategy}>
                {localWatchlists.map((watchlist) => (
                  <SortableWatchlistItem
                    key={watchlist.id}
                    watchlist={watchlist}
                    isActive={watchlist.id === activeWatchlistId}
                    onSelect={() => setActiveWatchlistId(watchlist.id)}
                    onDelete={() => setDeleteWatchlistTarget({ id: watchlist.id, name: watchlist.name })}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Right panel - Tickers */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeWatchlist ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <ListFilter className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pilih watchlist untuk melihat tickers
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Atau buat watchlist baru menggunakan tombol + di sebelah kiri
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div>
                <h2 className="text-base font-semibold">{activeWatchlist.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {activeWatchlist.tickers.length} tickers
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={() =>
                  setDeleteWatchlistTarget({
                    id: activeWatchlist.id,
                    name: activeWatchlist.name,
                  })
                }
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Hapus Watchlist
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeWatchlist.tickers.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <BookmarkX className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Watchlist ini masih kosong
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Tambahkan ticker dari halaman Stocks
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Sektor</TableHead>
                      <TableHead>Sub Sektor</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeWatchlist.tickers.map((ticker) => (
                      <TableRow
                        key={ticker.symbol}
                        className="cursor-pointer"
                        onClick={() => navigate(`/stock/${ticker.symbol}`)}
                      >
                        <TableCell className="font-bold">{ticker.symbol}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticker.name || "-"}
                        </TableCell>
                        <TableCell>
                          {ticker.sector ? (
                            <Badge variant="default">{ticker.sector}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ticker.subSector ? (
                            <Badge variant="secondary">{ticker.subSector}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={() =>
                              setDeleteTickerTarget({
                                watchlistId: activeWatchlist.id,
                                symbol: ticker.symbol,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Watchlist Confirmation */}
      <AlertDialog
        open={!!deleteWatchlistTarget}
        onOpenChange={(v) => !v && setDeleteWatchlistTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Watchlist <strong>"{deleteWatchlistTarget?.name}"</strong> akan dihapus secara
              permanen. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteWatchlistTarget && handleDeleteWatchlist(deleteWatchlistTarget.id)
              }
              disabled={isDeletingWatchlist}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Ticker Confirmation */}
      <AlertDialog
        open={!!deleteTickerTarget}
        onOpenChange={(v) => !v && setDeleteTickerTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ticker?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTickerTarget?.symbol}</strong> akan dihapus dari watchlist ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTickerTarget &&
                handleDeleteTicker({
                  watchlistId: deleteTickerTarget.watchlistId,
                  symbol: deleteTickerTarget.symbol,
                })
              }
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
