import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", url: "/" },
  { title: "Stocks", url: "/stock" },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Quant BDM
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === item.url ||
                      (item.url !== "/" &&
                        location.pathname.startsWith(item.url))
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
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
