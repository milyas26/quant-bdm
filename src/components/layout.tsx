import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet, useLocation } from "react-router-dom"

export default function Layout() {
  const location = useLocation()

  // Get the last segment of the path and format it
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const currentPage =
    pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Dashboard"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
