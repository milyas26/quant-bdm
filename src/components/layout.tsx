/* eslint-disable react-hooks/set-state-in-effect */
import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { CommandMenu } from "@/components/command-menu"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, Info } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const navItems = [
  { title: "Screener", url: "/" },
  { title: "History", url: "/history" },
  { title: "Brokers", url: "/brokers" },
  { title: "Guide", url: "/guide" },
]

import { AddTickerDialog } from "@/components/add-ticker-dialog"
import { RunnerCalculator } from "@/components/runner-calculator"

function SettingsMenu() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <div className="px-2 pb-1">
          <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Pages</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/extra-info">
            <Info className="mr-2 h-4 w-4" />
            Extra Info
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
              <RunnerCalculator />
              <SettingsMenu />
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
