import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addTicker } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddTickerDialog() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [newTickerSymbol, setNewTickerSymbol] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (isInput) return

      // Hotkey "n" to open add ticker dialog
      if (e.key === "n") {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const { mutate: handleAddTicker, isPending: isAddingTicker } = useMutation({
    mutationFn: addTicker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickers"] })
      toast.success("Ticker added successfully")
      setIsOpen(false)
      setNewTickerSymbol("")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add ticker")
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Ticker</DialogTitle>
          <DialogDescription>
            Enter the ticker symbol to add to your watchlist. Max 4 characters.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticker" className="text-right">
              Ticker
            </Label>
            <Input
              id="ticker"
              value={newTickerSymbol}
              onChange={(e) => setNewTickerSymbol(e.target.value.toUpperCase())}
              maxLength={4}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newTickerSymbol.length > 0 &&
                  !isAddingTicker
                ) {
                  handleAddTicker(newTickerSymbol)
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => handleAddTicker(newTickerSymbol)}
            disabled={
              !newTickerSymbol ||
              newTickerSymbol.length === 0 ||
              isAddingTicker
            }
          >
            {isAddingTicker ? "Adding..." : "Add Ticker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
