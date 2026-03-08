import { Link, Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Stocks", url: "/stock" },
  { title: "Watchlist", url: "/watchlist" },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-mono text-2xl font-bold italic sm:inline-block">
              Quant. BDM
            </span>
          </Link>
          <nav className="flex items-center gap-0 font-mono">
            {navItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className={cn("cursor-pointer border-l bg-[#F5F5F0] px-6 py-4")}
              >
                {item.title}
              </Link>
            ))}
          </nav>
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
