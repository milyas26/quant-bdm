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
import { cn, getBrokerCodeClass } from "@/lib/utils"
import { StatusBadge } from "@/components/indicators"
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
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group mx-1 flex cursor-pointer items-center justify-between rounded-sm px-2 py-2 transition-colors hover:bg-accent/50",
        isActive && "bg-accent text-accent-foreground",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </div>
        {isEditing ? (
          <Input
            className="h-6 flex-1 rounded-sm px-1 text-xs"
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
              "truncate font-mono text-xs font-medium",
              isActive && "font-semibold"
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
        <Badge
          variant="secondary"
          className="h-4 rounded-sm px-1 font-mono text-[10px]"
        >
          {watchlist._count.tickers}
        </Badge>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
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

  useEffect(() => {
    if (watchlists) {
      setLocalWatchlists(watchlists)
      if (activeWatchlistId === null && watchlists.length > 0)
        setActiveWatchlistId(watchlists[0].id)
    }
  }, [watchlists])

  const { mutate: handleCreateWatchlist, isPending: isCreating } = useMutation({
    mutationFn: createWatchlist,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      setActiveWatchlistId(created.id)
      setNewWatchlistName("")
      setShowNewInput(false)
      toast.success(`"${created.name}" created`)
    },
    onError: () => toast.error("Failed to create"),
  })

  const { mutate: handleDeleteWatchlist } = useMutation({
    mutationFn: deleteWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      if (deleteWatchlistTarget?.id === activeWatchlistId)
        setActiveWatchlistId(null)
      toast.success("Deleted")
      setDeleteWatchlistTarget(null)
    },
    onError: () => toast.error("Failed to delete"),
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
      toast.success("Ticker removed")
      setDeleteTickerTarget(null)
    },
    onError: () => toast.error("Failed to remove"),
  })

  const { mutate: handleRenameWatchlist } = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      renameWatchlist(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] })
      toast.success("Renamed")
    },
    onError: () => toast.error("Failed to rename"),
  })

  const { mutate: handleReorder } = useMutation({
    mutationFn: reorderWatchlists,
    onError: () => {
      if (watchlists) setLocalWatchlists(watchlists)
      toast.error("Failed to reorder")
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
    <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-border bg-card md:h-[calc(100vh-7rem)] md:flex-row">
      <div className="flex max-h-60 w-full shrink-0 flex-col border-b border-border md:max-h-none md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-xs font-semibold">Watchlists</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowNewInput((v) => !v)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {showNewInput && (
          <div className="border-b border-border px-2 py-1.5">
            <div className="flex gap-1">
              <Input
                className="h-7 flex-1 rounded-sm text-xs"
                placeholder="Name..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newWatchlistName.trim())
                    handleCreateWatchlist({ name: newWatchlistName.trim() })
                  if (e.key === "Escape") {
                    setShowNewInput(false)
                    setNewWatchlistName("")
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                className="h-7 rounded-sm px-2 text-[11px]"
                onClick={() =>
                  newWatchlistName.trim() &&
                  handleCreateWatchlist({ name: newWatchlistName.trim() })
                }
                disabled={!newWatchlistName.trim() || isCreating}
              >
                Add
              </Button>
            </div>
          </div>
        )}
        <div className="scrollbar-thin flex-1 overflow-y-auto py-1">
          {isLoading ? (
            <div className="space-y-1 px-2 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-sm" />
              ))}
            </div>
          ) : localWatchlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BookmarkX className="mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground">
                No watchlists
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
                      )
                        handleRenameWatchlist({
                          id: watchlist.id,
                          name: editingName.trim(),
                        })
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

      <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden md:min-h-0">
        {!activeWatchlist ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <ListFilter className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground">
              Select a watchlist
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <div>
                <h2 className="text-sm font-semibold">
                  {activeWatchlist.name}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {activeWatchlist._count.tickers} tickers
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-sm text-xs text-destructive hover:text-destructive"
                onClick={() =>
                  setDeleteWatchlistTarget({
                    id: activeWatchlist.id,
                    name: activeWatchlist.name,
                  })
                }
              >
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
            </div>

            <div className="scrollbar-thin flex-1 overflow-y-auto">
              {isLoadingTickers ? (
                <div className="space-y-1 p-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (watchlistTickersData?.tickers.length ?? 0) === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <BookmarkX className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground">
                    Empty watchlist
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky-col">
                        Ticker
                      </TableHead>
                      <TableHead>
                        Price
                      </TableHead>
                      <TableHead>
                        Volume
                      </TableHead>
                      <TableHead>
                        Net Flow
                      </TableHead>
                      <TableHead>
                        Status
                      </TableHead>
                      <TableHead>
                        Mom
                      </TableHead>
                      <TableHead>
                        Brokers
                      </TableHead>
                      <TableHead>
                        Sector
                      </TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlistTickersData?.tickers.map((ticker: any) => {
                      const s = ticker.screeners[0]
                      return (
                        <TableRow
                          key={ticker.symbol}
                          className="cursor-pointer border-border hover:bg-accent/50"
                          onClick={() => navigate(`/stock/${ticker.symbol}`)}
                        >
                          <TableCell className="sticky-col">
                            <div className="flex items-center gap-2">
                              {ticker.logo ? (
                                <img
                                  src={ticker.logo}
                                  alt={ticker.symbol}
                                  className="hidden h-6 w-6 rounded-full border border-border object-cover sm:block"
                                />
                              ) : (
                                <div className="hidden h-6 w-6 items-center justify-center rounded-full bg-muted font-mono text-[11px] sm:flex">
                                  {ticker.symbol?.[0]}
                                </div>
                              )}
                              <div>
                                <span className="flex items-center gap-1 font-mono text-[12px] font-bold">
                                  {ticker.symbol}
                                  {s?.isBreakout && (
                                    <Badge
                                      variant="outline"
                                      className="text-positive bg-positive h-4 rounded-sm border-emerald-400/20 px-1 font-mono text-[10px]"
                                    >
                                      BO
                                    </Badge>
                                  )}
                                </span>
                                <span
                                  className="block max-w-28 truncate sm:max-w-40 text-[11px] text-muted-foreground"
                                  title={ticker.name || undefined}
                                >
                                  {ticker.name || "-"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <div>
                                <span className="font-mono text-[12px] font-medium">
                                  {fmtPrice(Number(s.price))}
                                </span>
                                <span
                                  className={cn(
                                    "ml-1.5 font-mono text-[11px]",
                                    Number(s.changePercentage) > 0
                                      ? "text-positive"
                                      : Number(s.changePercentage) < 0
                                        ? "text-negative"
                                        : "text-muted-foreground"
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
                              <div>
                                <span className="font-mono text-[11px]">
                                  {fmtCurrency(Number(s.volume)).replace(
                                    "+",
                                    ""
                                  )}
                                </span>
                                {s.isVolumeSpike && (
                                  <span className="text-warning bg-warning ml-1 rounded-sm px-1 py-px font-mono text-[10px]">
                                    Spike
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
                                  "font-mono text-[11px] font-medium",
                                  Number(s.netBrokerFlow) > 0
                                    ? "text-positive"
                                    : Number(s.netBrokerFlow) < 0
                                      ? "text-negative"
                                      : "text-muted-foreground"
                                )}
                              >
                                {fmtCurrency(Number(s.netBrokerFlow))}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {s ? <StatusBadge status={s.bandarStatus} /> : "-"}
                          </TableCell>
                          <TableCell>
                            {s ? (
                              <span
                                className={cn(
                                  "font-mono text-[11px]",
                                  s.momentum === "Uptrend" && "text-positive",
                                  s.momentum === "Downtrend" && "text-negative"
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
                              <div className="flex gap-1 whitespace-nowrap">
                                {s.brokersBuy?.map((b: any, idx: number) => (
                                  <span
                                    key={b.netbsBrokerCode + "-" + idx}
                                    className={cn(
                                      "rounded-sm bg-muted/50 px-1 py-0.5 font-mono text-[10px]",
                                      getBrokerCodeClass(b.netbsBrokerCode)
                                    )}
                                  >
                                    {b.netbsBrokerCode}
                                  </span>
                                ))}
                                {s.brokersSell?.map((b: any, idx: number) => (
                                  <span
                                    key={b.netbsBrokerCode + "-sell-" + idx}
                                    className={cn(
                                      "rounded-sm bg-muted/50 px-1 py-0.5 font-mono text-[10px]",
                                      getBrokerCodeClass(b.netbsBrokerCode)
                                    )}
                                  >
                                    {b.netbsBrokerCode}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {ticker.sector ? (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {ticker.sector}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:text-destructive"
                              onClick={() =>
                                setDeleteTickerTarget({
                                  watchlistId: activeWatchlist.id,
                                  symbol: ticker.symbol,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
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

      <AlertDialog
        open={!!deleteWatchlistTarget}
        onOpenChange={(v) => !v && setDeleteWatchlistTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteWatchlistTarget?.name}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-sm bg-destructive hover:bg-destructive/90"
              onClick={() =>
                deleteWatchlistTarget &&
                handleDeleteWatchlist(deleteWatchlistTarget.id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTickerTarget}
        onOpenChange={(v) => !v && setDeleteTickerTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Ticker?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTickerTarget?.symbol}</strong> will be removed from
              this watchlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-sm bg-destructive hover:bg-destructive/90"
              onClick={() =>
                deleteTickerTarget &&
                handleDeleteTicker({
                  watchlistId: deleteTickerTarget.watchlistId,
                  symbol: deleteTickerTarget.symbol,
                })
              }
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
