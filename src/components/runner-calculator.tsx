import { useMemo, useState, useEffect } from "react"
import { Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type ScoreKey =
  | "breakout"
  | "volume"
  | "broker"
  | "smartMoney"
  | "liquidity"
  | "momentum"

type ScoreOption = { label: string; value: number }

const options: Record<ScoreKey, ScoreOption[]> = {
  breakout: [
    { label: "No breakout", value: 0 },
    { label: "Weak breakout", value: 10 },
    { label: "Clear resistance breakout", value: 25 },
  ],
  volume: [
    { label: "Volume < average", value: 0 },
    { label: "1.5x average", value: 10 },
    { label: "2x average", value: 15 },
    { label: "3x or more", value: 20 },
  ],
  broker: [
    { label: "No notable broker", value: 0 },
    { label: "Minor accumulation", value: 8 },
    { label: "Institutional buying", value: 15 },
    { label: "Institution accumulating multiple days", value: 20 },
  ],
  smartMoney: [
    { label: "<40", value: 3 },
    { label: "40–50", value: 8 },
    { label: "50–70", value: 15 },
    { label: ">80", value: 6 },
  ],
  liquidity: [
    { label: "<100k volume", value: 2 },
    { label: "100k–300k", value: 5 },
    { label: "300k–1M", value: 8 },
    { label: ">1M", value: 10 },
  ],
  momentum: [
    { label: "Below MA", value: 0 },
    { label: "Above MA20", value: 5 },
    { label: "Above MA20 and MA50", value: 8 },
    { label: "Strong trend", value: 10 },
  ],
}

function getScoreInfo(score: number) {
  if (score < 40) {
    return {
      label: "Low probability",
      badgeClassName: "bg-red-500 text-white",
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-red-500",
      guidance:
        "Avoid chasing. Focus on building a watchlist and wait for breakout + volume confirmation.",
    }
  }
  if (score < 60) {
    return {
      label: "Moderate setup",
      badgeClassName: "bg-orange-500 text-white",
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-orange-500",
      guidance:
        "Consider a small starter position only if risk is defined; prefer waiting for a cleaner breakout.",
    }
  }
  if (score < 75) {
    return {
      label: "Strong candidate",
      badgeClassName: "bg-yellow-500 text-white",
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
      guidance:
        "Plan an entry on breakout/pullback with a tight stop. Scale in if volume confirms.",
    }
  }
  if (score < 85) {
    return {
      label: "High probability runner",
      badgeClassName: "bg-green-600 text-white",
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-green-600",
      guidance:
        "Primary breakout entry is favored. Manage risk aggressively and consider partial profit-taking.",
    }
  }
  return {
    label: "Explosive setup",
    badgeClassName: "bg-emerald-600 text-white",
    progressClassName: "[&_[data-slot=progress-indicator]]:bg-emerald-600",
    guidance:
      "Rare setup. Consider scaling, trail stops, and partial profits. Stay alert for distribution.",
  }
}

const defaultValues: Record<ScoreKey, number> = {
  breakout: 0,
  volume: 0,
  broker: 0,
  smartMoney: 0,
  liquidity: 0,
  momentum: 0,
}

export function RunnerCalculator() {
  const [open, setOpen] = useState(false)
  const [calcValues, setCalcValues] =
    useState<Record<ScoreKey, number>>(defaultValues)

  const totalScore = useMemo(
    () => Object.values(calcValues).reduce((a, b) => a + b, 0),
    [calcValues]
  )

  const scoreInfo = useMemo(() => getScoreInfo(totalScore), [totalScore])

  const handleSelect = (category: ScoreKey, value: string) => {
    setCalcValues((prev) => ({ ...prev, [category]: Number(value) }))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "c" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Calculator className="h-3.5 w-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-indigo-500" />
            Interactive Calculator
          </SheetTitle>
          <SheetDescription>
            Select inputs to compute the Runner Probability Score.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Runner Score
                </div>
                <div className="mt-1 text-4xl font-black">{totalScore}</div>
              </div>
              <Badge className={scoreInfo.badgeClassName}>
                {scoreInfo.label}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <Progress
                value={totalScore}
                className={scoreInfo.progressClassName}
              />
              <div className="text-xs text-muted-foreground">0–100 scale</div>
            </div>
            <div className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">
                Suggested approach
              </div>
              <p className="mt-1">{scoreInfo.guidance}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {(
              [
                ["breakout", "Breakout strength"],
                ["volume", "Volume multiplier"],
                ["broker", "Broker accumulation"],
                ["smartMoney", "Smart money score"],
                ["liquidity", "Average daily volume"],
                ["momentum", "Momentum condition"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="grid gap-2">
                <Label htmlFor={`calc-${key}`}>{label}</Label>
                <Select
                  value={String(calcValues[key])}
                  onValueChange={(v) => handleSelect(key, v)}
                >
                  <SelectTrigger id={`calc-${key}`} className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {options[key].map((opt) => (
                      <SelectItem key={opt.label} value={String(opt.value)}>
                        {opt.label} ({opt.value} pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setCalcValues(defaultValues)}
          >
            Reset Calculator
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
