/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useState } from "react"
import {
  BookOpen,
  Activity,
  BarChart2,
  Target,
  LogOut,
  Zap,
  ListChecks,
  Radar,
} from "lucide-react"
import { cn } from "@/lib/utils"

import GuideOverview from "@/components/guides/guide-overview"
import GuideRunnerLifecycle from "@/components/guides/guide-runner-lifecycle"
import GuideReadingScreener from "@/components/guides/guide-reading-screener"
import GuideEntryStrategy from "@/components/guides/guide-entry-strategy"
import GuideExitStrategy from "@/components/guides/guide-exit-strategy"
import GuideRunnerScore from "@/components/guides/guide-runner-score"
import GuidePracticalWorkflow from "@/components/guides/guide-practical-workflow"
import GuideRemora from "@/components/guides/guide-remora"

const pages = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Overview",
    icon: BookOpen,
    component: GuideOverview,
  },
  {
    id: "lifecycle",
    label: "Runner Lifecycle",
    shortLabel: "Lifecycle",
    icon: Activity,
    component: GuideRunnerLifecycle,
  },
  {
    id: "reading",
    label: "Reading the Screener",
    shortLabel: "Reading",
    icon: BarChart2,
    component: GuideReadingScreener,
  },
  {
    id: "entry",
    label: "Entry Strategy",
    shortLabel: "Entry",
    icon: Target,
    component: GuideEntryStrategy,
  },
  {
    id: "exit",
    label: "Exit Strategy",
    shortLabel: "Exit",
    icon: LogOut,
    component: GuideExitStrategy,
  },
  {
    id: "score",
    label: "Runner Score",
    shortLabel: "Score",
    icon: Zap,
    component: GuideRunnerScore,
  },
  {
    id: "workflow",
    label: "Practical Workflow",
    shortLabel: "Workflow",
    icon: ListChecks,
    component: GuidePracticalWorkflow,
  },
  {
    id: "remora",
    label: "Remora Indicators",
    shortLabel: "Remora",
    icon: Radar,
    component: GuideRemora,
  },
]

export default function Guides() {
  const [activePage, setActivePage] = useState("overview")
  const active = pages.find((p) => p.id === activePage)!
  const ActiveComponent = active.component

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8 space-y-1.5 text-center">
          <h1 className="text-xl font-extrabold md:text-2xl">
            📘 Screener User Guide
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Panduan lengkap cara menggunakan screener untuk mendeteksi potensi
            runner saham lebih awal.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Sidebar */}
          <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:w-52 lg:flex-col lg:flex-nowrap lg:self-start lg:overflow-y-auto">
            {pages.map(({ id, label, shortLabel, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activePage === id
                    ? "bg-slate-800 font-medium text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">{label}</span>
                <span className="lg:hidden">{shortLabel}</span>
              </button>
            ))}
          </nav>

          {/* Page content */}
          <div className="min-w-0 flex-1">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
