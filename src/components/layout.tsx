import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CommandMenu } from "@/components/command-menu"
import { AddTickerDialog } from "@/components/add-ticker-dialog"
import { RunnerCalculator } from "@/components/runner-calculator"
import { BrokersSheet } from "@/components/brokers-sheet"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  Search,
  History,
  Bookmark,
  TrendingUp,
  Briefcase,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react"

const navItems = [
  { title: "Screener", url: "/", icon: LayoutDashboard },
  { title: "History", url: "/history", icon: History },
  { title: "Watchlist", url: "/watchlist", icon: Bookmark },
  { title: "Streak", url: "/broker-accumulation", icon: TrendingUp },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase },
  { title: "Guide", url: "/guide", icon: BookOpen },
]

export default function Layout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCollapsed((prev) => !prev)
      }

      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue.trim()) {
      navigate(`/stock/${searchValue.trim().toUpperCase()}`)
      setSearchValue("")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <CommandMenu open={open} onOpenChange={setOpen} />

      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        <div className={cn(
          "flex h-12 items-center border-b border-border shrink-0",
          collapsed ? "justify-center px-2" : "px-4"
        )}>
          {!collapsed && (
            <span className="font-mono text-sm font-bold tracking-tight text-foreground truncate">
              quant<span className="text-[#c8a951]">/bdm</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 ml-auto shrink-0 text-muted-foreground hover:text-foreground", collapsed && "ml-0")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className={cn("px-2 py-2 border-b border-border", collapsed && "hidden")}>
          <div className="relative">
            <Search className="absolute top-2 left-2 h-3 w-3 text-muted-foreground" />
            <Input
              className="h-7 pl-6 pr-2 text-[11px] bg-transparent border-border font-mono placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-muted-foreground"
              placeholder="/stock"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-1.5">
          {navItems.map(({ title, url, icon: Icon }) => (
            <NavLink
              key={url}
              to={url}
              end={url === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                  collapsed ? "justify-center px-0" : "",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{title}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={cn(
          "border-t border-border p-2 flex items-center gap-1",
          collapsed ? "flex-col" : ""
        )}>
          <AddTickerDialog collapsed={collapsed} />
          <BrokersSheet collapsed={collapsed} />
          <RunnerCalculator collapsed={collapsed} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              BDM Screener
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => { logout(); navigate("/login", { replace: true }) }}
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
            <Input
              readOnly
              onClick={() => setOpen(true)}
              className="h-6 w-40 cursor-pointer text-[11px] text-center font-mono bg-transparent border-border text-muted-foreground hover:border-muted-foreground/50 placeholder:text-muted-foreground/30"
              placeholder="Cmd+K"
            />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
