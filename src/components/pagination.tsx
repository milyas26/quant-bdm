import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface PaginationProps {
  page: number
  totalPages: number
  limit: number
  totalItems: number
  currentItems: number
  limitOptions?: number[]
  showItems?: boolean
  isLoading?: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({
  page,
  totalPages,
  limit,
  totalItems,
  currentItems,
  limitOptions = [10, 15, 25, 50, 100],
  showItems = true,
  isLoading = false,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const [pageInput, setPageInput] = useState(page.toString())

  useEffect(() => setPageInput(page.toString()), [page])

  const handlePageInputBlur = () => {
    const p = parseInt(pageInput)
    if (!isNaN(p) && p > 0) onPageChange(p)
    else setPageInput(page.toString())
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const p = parseInt(pageInput)
      if (!isNaN(p) && p > 0) onPageChange(p)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        {showItems && (
          <span>
            {currentItems} of {totalItems}
          </span>
        )}
        <Select
          value={String(limit)}
          onValueChange={(val) => onLimitChange(Number(val))}
        >
          <SelectTrigger className="h-7 w-14 rounded-sm border-border text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-sm font-mono text-[11px]"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="h-3 w-3" /> Prev
        </Button>
        <Input
          className="h-7 w-14 rounded-sm text-center font-mono text-[11px]"
          value={pageInput}
          type="number"
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={handlePageInputBlur}
          onKeyDown={handlePageInputKeyDown}
        />
        <span className="font-mono text-[11px] text-muted-foreground">
          / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-sm font-mono text-[11px]"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
        >
          Next <ChevronRight className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isLoading}
        >
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
