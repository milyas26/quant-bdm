import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [{ title: "Stocks", url: "/stock" }]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block">Quant BDM</span>
          </Link>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                  location.pathname === item.url ||
                    (item.url !== "/" && location.pathname.startsWith(item.url))
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground"
                )}
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
