import { useState, useEffect } from "react"
import { Building2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Brokers from "@/pages/brokers"

export function BrokersSheet() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on "b" or "B" when not focused on an input
      if (
        e.key.toLowerCase() === "b" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Brokers (B)">
          <Building2 className="h-3.5 w-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto px-0 pb-0 gap-0">
        <SheetHeader className="sticky top-0 z-10 bg-background px-4 pt-6 pb-4 border-b shadow-sm">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Daftar Broker
          </SheetTitle>
          <SheetDescription>
            Cari dan lihat daftar kode broker yang terdaftar.
          </SheetDescription>
          <div className="relative w-full pt-2">
            <Search className="absolute left-2.5 top-[calc(50%+4px)] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode atau nama broker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </SheetHeader>
        <div className="px-4 pb-6 pt-4">
          <Brokers search={search} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
