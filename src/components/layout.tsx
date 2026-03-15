/* eslint-disable react-hooks/set-state-in-effect */
import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { CommandMenu } from "@/components/command-menu"

const navItems = [
  { title: "Stocks", url: "/stock" },
  { title: "Watchlist", url: "/watchlist" },
  { title: "Extra Info", url: "/extra-info" },
  { title: "Screener Analysis", url: "/screener-analysis" },
]

import { AddTickerDialog } from "@/components/add-ticker-dialog"

export default function Layout() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(() => {
    if (location.pathname.startsWith("/stock/")) {
      const ticker = location.pathname.split("/")[2]
      return ticker ? ticker.toUpperCase() : ""
    }
    return ""
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !open &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  useEffect(() => {
    const currentTicker = location.pathname.startsWith("/stock/")
      ? location.pathname.split("/")[2]?.toUpperCase() || ""
      : ""

    setInputValue(currentTicker)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CommandMenu open={open} onOpenChange={setOpen} />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-mono text-2xl font-bold italic sm:inline-block">
              katanyainibagusbuatscreeningsaham
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex cursor-pointer items-center gap-0 font-mono">
              {navItems.map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  className={cn(
                    "cursor-pointer border-l px-4 py-4 text-sm font-medium transition-colors hover:bg-muted/80"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <div className="relative w-[150px]">
                <Input
                  key={location.pathname}
                  readOnly
                  value={inputValue}
                  onClick={() => setOpen(true)}
                  className="h-8 w-full cursor-pointer text-center font-bold"
                  placeholder="Search... (/)"
                />
              </div>
              <AddTickerDialog />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
