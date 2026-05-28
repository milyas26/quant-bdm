import { useState } from "react"
import { cn } from "@/lib/utils"
import { BookOpen, Activity, BarChart2, Target, LogOut, Zap, ListChecks, Radar } from "lucide-react"
import GuideOverview from "@/components/guides/guide-overview"
import GuideRunnerLifecycle from "@/components/guides/guide-runner-lifecycle"
import GuideReadingScreener from "@/components/guides/guide-reading-screener"
import GuideEntryStrategy from "@/components/guides/guide-entry-strategy"
import GuideExitStrategy from "@/components/guides/guide-exit-strategy"
import GuideRunnerScore from "@/components/guides/guide-runner-score"
import GuidePracticalWorkflow from "@/components/guides/guide-practical-workflow"
import GuideRemora from "@/components/guides/guide-remora"

const pages = [
  { id: "overview", label: "Overview", icon: BookOpen, component: GuideOverview },
  { id: "lifecycle", label: "Runner Lifecycle", icon: Activity, component: GuideRunnerLifecycle },
  { id: "reading", label: "Reading the Screener", icon: BarChart2, component: GuideReadingScreener },
  { id: "entry", label: "Entry Strategy", icon: Target, component: GuideEntryStrategy },
  { id: "exit", label: "Exit Strategy", icon: LogOut, component: GuideExitStrategy },
  { id: "score", label: "Runner Score", icon: Zap, component: GuideRunnerScore },
  { id: "workflow", label: "Practical Workflow", icon: ListChecks, component: GuidePracticalWorkflow },
  { id: "remora", label: "Remora Indicators", icon: Radar, component: GuideRemora },
]

export default function Guides() {
  const [activePage, setActivePage] = useState("overview")
  const active = pages.find((p) => p.id === activePage)!
  const ActiveComponent = active.component

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-mono text-xl font-bold tracking-tight">User Guide</h1>
        <p className="text-[12px] text-muted-foreground">Panduan menggunakan screener untuk deteksi runner saham.</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:sticky lg:top-4 lg:w-48 lg:flex-col lg:self-start">
          {pages.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={cn(
                "flex items-center gap-2 rounded-sm px-3 py-1.5 text-left text-xs transition-colors font-mono",
                activePage === id
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
