import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  getWatchlists,
  createWatchlist,
  deleteWatchlist,
  renameWatchlist,
  deleteTickerFromWatchlist,
  reorderWatchlists,
  getWatchlistTickers,
} from "@/lib/api"
import { fmtPrice, fmtCurrency } from "@/lib/format"
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
import { getBrokerCodeClass } from "@/lib/utils"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  BookmarkX,
  ListFilter,
  GripVertical,
  Pencil,
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
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
}: {
  watchlist: Watchlist
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  isEditing: boolean
  editName: string
  onEditNameChange: (v: string) => void
  onStartEdit: () => void
  onFinishEdit: () => void
  onCancelEdit: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: watchlist.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group mx-1 flex cursor-pointer items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-muted",
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
        {isEditing ? (
          <Input
            className="h-6 flex-1 px-1 text-sm"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onFinishEdit()
              if (e.key === "Escape") onCancelEdit()
            }}
            onBlur={onFinishEdit}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "truncate text-sm font-medium",
              isActive && "text-primary"
            )}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
          >
            {watchlist.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
          {watchlist._count.tickers}
        </Badge>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
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

  const [activeWatchlistId, setActiveWatchlistId] = useState<number | null>(
    null
  )
  const [localWatchlists, setLocalWatchlists] = useState<Watchlist[]>([])
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [showNewInput, setShowNewInput] = useState(false)
  const [deleteWatchlistTarget, setDeleteWatchlistTarget] = useState<{
    id: number
    name: string
  } | null>(null)
  const [deleteTickerTarget, setDeleteTickerTarget] = useState<{
    watchlistId: number
    symbol: string
  } | null>(null)
  const [editingWatchlistId, setEditingWatchlistId] = useState<number | null>(
    null
  )
  const [editingName, setEditingName] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { data: watchlists, isLoading } = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlists,
  })

  const { data: watchlistTickersData, isLoading: isLoadingTickers } = useQuery({
    queryKey: ["watchlist-tickers", activeWatchlistId],
    queryFn: () => getWatchlistTickers(activeWatchlistId!),
    enabled: !!activeWatchlistId,
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

  const { mutate: handleDeleteWatchlist, isPending: isDeletingWatchlist } =
    useMutation({
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
    mutationFn: ({
      watchlistId,
      symbol,
    }: {
      watchlistId: number
      symbol: string
    }) => deleteTickerFromWatchlist(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      queryClient.invalidateQueries({
        queryKey: ["watchlist-tickers", activeWatchlistId],
      })
      toast.success("Ticker berhasil dihapus dari watchlist")
      setDeleteTickerTarget(null)
    },
    onError: () => toast.error("Gagal menghapus ticker"),
  })

  const { mutate: handleRenameWatchlist } = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      renameWatchlist(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      toast.success("Watchlist berhasil di-rename")
    },
    onError: () => toast.error("Gagal rename watchlist"),
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

  const activeWatchlist = localWatchlists.find(
    (w) => w.id === activeWatchlistId
  )

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
              <p className="text-xs text-muted-foreground">
                Belum ada watchlist
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localWatchlists.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                {localWatchlists.map((watchlist) => (
                  <SortableWatchlistItem
                    key={watchlist.id}
                    watchlist={watchlist}
                    isActive={watchlist.id === activeWatchlistId}
                    onSelect={() => setActiveWatchlistId(watchlist.id)}
                    onDelete={() =>
                      setDeleteWatchlistTarget({
                        id: watchlist.id,
                        name: watchlist.name,
                      })
                    }
                    isEditing={editingWatchlistId === watchlist.id}
                    editName={editingName}
                    onEditNameChange={setEditingName}
                    onStartEdit={() => {
                      setEditingWatchlistId(watchlist.id)
                      setEditingName(watchlist.name)
                    }}
                    onFinishEdit={() => {
                      if (
                        editingName.trim() &&
                        editingName.trim() !== watchlist.name
                      ) {
                        handleRenameWatchlist({
                          id: watchlist.id,
                          name: editingName.trim(),
                        })
                      }
                      setEditingWatchlistId(null)
                    }}
                    onCancelEdit={() => setEditingWatchlistId(null)}
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
              <p className="mt-1 text-xs text-muted-foreground/60">
                Atau buat watchlist baru menggunakan tombol + di sebelah kiri
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div>
                <h2 className="text-base font-semibold">
                  {activeWatchlist.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeWatchlist._count.tickers} tickers
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
              {isLoadingTickers ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (watchlistTickersData?.tickers.length ?? 0) === 0 ? (
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
                      <TableHead>Price</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Net Flow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Momentum</TableHead>
                      <TableHead>Top Brokers</TableHead>
                      <TableHead>Sektor</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlistTickersData?.tickers.map((ticker) => {
                      const s = ticker.screeners[0]
                      return (
                        <TableRow
                          key={ticker.symbol}
                          className="cursor-pointer"
                          onClick={() => navigate(`/stock/${ticker.symbol}`)}
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="flex items-center gap-2 font-bold">
                                {ticker.logo ? (
                                  <img
                                    src={ticker.logo}
                                    alt={ticker.symbol}
                                    className="h-8 w-8 rounded-full border object-cover"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/10 text-[11px] font-medium">
                                    {ticker.symbol?.[0] || "-"}
                                  </div>
                                )}
                                <div>
                                  <span className="flex items-center gap-1">
                                    {ticker.symbol}
                                    {s?.isBreakout && (
                                      <Badge
                                        variant="outline"
                                        className="h-4 border-orange-200 bg-orange-50 px-1 py-0 text-[10px] font-normal text-orange-600"
                                      >
                                        Breakout
                                      </Badge>
                                    )}
                                  </span>
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {ticker.name || "-"}
                                  </span>
                                </div>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {fmtPrice(Number(s.price))}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    Number(s.changePercentage) > 0
                                      ? "text-green-600"
                                      : Number(s.changePercentage) < 0
                                        ? "text-red-600"
                                        : "text-gray-500"
                                  )}
                                >
                                  {Number(s.changePercentage) > 0 ? "+" : ""}
                                  {Number(s.changePercentage).toFixed(2)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {fmtCurrency(Number(s.volume)).replace(
                                    "+",
                                    ""
                                  )}
                                </span>
                                {s.isVolumeSpike && (
                                  <span className="text-[10px] font-bold text-orange-500">
                                    🔥 Spike
                                  </span>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  Number(s.netBrokerFlow) > 0
                                    ? "text-green-600"
                                    : Number(s.netBrokerFlow) < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                )}
                              >
                                {fmtCurrency(Number(s.netBrokerFlow))}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "h-4 px-1 py-0 text-[10px] font-normal",
                                  s.bandarStatus === "Accumulation" &&
                                    "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
                                  s.bandarStatus === "Distribution" &&
                                    "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
                                  s.bandarStatus === "Neutral" &&
                                    "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50"
                                )}
                              >
                                {s.bandarStatus}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <span
                                className={cn(
                                  "font-bold",
                                  Number(s.smartMoneyScore) >= 70
                                    ? "text-green-600"
                                    : Number(s.smartMoneyScore) <= 30
                                      ? "text-red-600"
                                      : "text-yellow-600"
                                )}
                              >
                                {Number(s.smartMoneyScore)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <span
                                className={cn(
                                  "text-[11px] font-medium",
                                  s.momentum === "Uptrend" && "text-green-600",
                                  s.momentum === "Downtrend" && "text-red-600",
                                  s.momentum === "Sideways" && "text-gray-600"
                                )}
                              >
                                {s.momentum}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {s ? (
                              <div className="flex flex-col gap-1 text-[11px]">
                                <div className="flex max-w-[140px] flex-wrap items-center gap-1">
                                  {s.brokersBuy?.length > 0 ? (
                                    s.brokersBuy.map((b, idx) => (
                                      <span
                                        key={b.netbsBrokerCode + "-buy-" + idx}
                                        className={cn(
                                          "rounded px-1 py-0.5 font-medium whitespace-nowrap",
                                          getBrokerCodeClass(b.netbsBrokerCode)
                                        )}
                                      >
                                        {b.netbsBrokerCode}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </div>
                                <div className="flex max-w-[140px] flex-wrap items-center gap-1">
                                  {s.brokersSell?.length > 0 ? (
                                    s.brokersSell.map((b, idx) => (
                                      <span
                                        key={b.netbsBrokerCode + "-sell-" + idx}
                                        className={cn(
                                          "rounded px-1 py-0.5 font-medium whitespace-nowrap",
                                          getBrokerCodeClass(b.netbsBrokerCode)
                                        )}
                                      >
                                        {b.netbsBrokerCode}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {ticker.sector ? (
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {ticker.sector}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:text-destructive"
                              onClick={() =>
                                setDeleteTickerTarget({
                                  watchlistId: activeWatchlist!.id,
                                  symbol: ticker.symbol,
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
              Watchlist <strong>"{deleteWatchlistTarget?.name}"</strong> akan
              dihapus secara permanen. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={() =>
                deleteWatchlistTarget &&
                handleDeleteWatchlist(deleteWatchlistTarget.id)
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
              <strong>{deleteTickerTarget?.symbol}</strong> akan dihapus dari
              watchlist ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
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
