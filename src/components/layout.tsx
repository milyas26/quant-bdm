/* eslint-disable react-hooks/set-state-in-effect */
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

const navItems = [
  { title: "Stocks", url: "/stock" },
  { title: "Watchlist", url: "/watchlist" },
  { title: "Extra Info", url: "/extra-info" },
]

import { AddTickerDialog } from "@/components/add-ticker-dialog"

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
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
        document.activeElement !== inputRef.current &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const currentTicker = location.pathname.startsWith("/stock/")
      ? location.pathname.split("/")[2]?.toUpperCase() || ""
      : ""

    setInputValue(currentTicker)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
                    "cursor-pointer border-l bg-muted px-6 py-4 text-sm font-medium transition-colors hover:bg-muted/80"
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
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue) {
                      navigate(`/stock/${inputValue}`)
                    }
                  }}
                  className="h-8 w-full"
                  placeholder="press / to focus here"
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
