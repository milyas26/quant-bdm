import { useMemo, useState } from "react"
import {
  AlertTriangle,
  BarChart2,
  Calculator,
  Info,
  LogOut,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

export default function Rules() {
  const [calcValues, setCalcValues] = useState<Record<ScoreKey, number>>({
    breakout: 0,
    volume: 0,
    broker: 0,
    smartMoney: 0,
    liquidity: 0,
    momentum: 0,
  })

  const totalScore = useMemo(
    () => Object.values(calcValues).reduce((a, b) => a + b, 0),
    [calcValues]
  )

  const scoreInfo = useMemo(() => getScoreInfo(totalScore), [totalScore])

  const handleSelect = (category: ScoreKey, value: string) => {
    setCalcValues((prev) => ({ ...prev, [category]: Number(value) }))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-10">
        <div className="space-y-2 text-center">
          <h1 className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl">
            Runner Detection System
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Large runners often appear when breakout, volume expansion, and broker
            accumulation align. This page computes a Runner Probability Score (0–100)
            to quantify the setup.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-500" />
                  <CardTitle>System Overview</CardTitle>
                </div>
                <CardDescription>
                  Runners usually happen when three forces align.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">
                      Breakout from resistance
                    </span>
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Volume expansion
                    </span>
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Institutional/broker accumulation
                    </span>
                  </li>
                </ul>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex h-28 items-end gap-1">
                    <div className="h-8 w-1/6 rounded-t-sm bg-indigo-300 dark:bg-indigo-900" />
                    <div className="h-7 w-1/6 rounded-t-sm bg-indigo-300 dark:bg-indigo-900" />
                    <div className="h-9 w-1/6 rounded-t-sm bg-indigo-300 dark:bg-indigo-900" />
                    <div className="h-16 w-1/6 rounded-t-sm bg-indigo-500 dark:bg-indigo-600" />
                    <div className="h-24 w-1/6 rounded-t-sm bg-emerald-500 dark:bg-emerald-600" />
                    <div className="h-28 w-1/6 rounded-t-sm bg-emerald-500 dark:bg-emerald-600" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Sideways base</span>
                    <span className="text-indigo-500">Breakout</span>
                    <span className="text-emerald-500">Runner phase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-500" />
                  <CardTitle>Entry Strategy</CardTitle>
                </div>
                <CardDescription>Three entry phases for runners.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-600 text-white">1</Badge>
                      <div className="font-medium">Early Entry</div>
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Accumulation phase
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      <li>Broker accumulation over multiple days</li>
                      <li>Price moving sideways</li>
                      <li>Volume slowly increasing</li>
                      <li>No breakout yet</li>
                    </ul>
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                      <div>
                        <span className="font-medium">Entry:</span> Buy near support
                        or base range
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        <span className="font-medium text-foreground">Risk:</span>
                        {" "}
                        Sideways movement may continue
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Reward:
                        </span>
                        {" "}
                        Best risk/reward potential
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-600 text-white">2</Badge>
                      <div className="font-medium">Breakout Entry</div>
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Highest probability
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      <li>Price breaks resistance</li>
                      <li>Volume spike</li>
                      <li>Brokers still net buyers</li>
                      <li>Smart money score rising</li>
                    </ul>
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                      <div>
                        <span className="font-medium">Entry:</span> Breakout candle
                        or small pullback after breakout
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white">3</Badge>
                      <div className="font-medium">Momentum Entry</div>
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Trend continuation
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      <li>Trend already started</li>
                      <li>Strong volume continuation</li>
                    </ul>
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                      <div>
                        <span className="font-medium">Entry:</span> First pullback
                        or short consolidation
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        <span className="font-medium text-foreground">Risk:</span>
                        {" "}
                        Higher entry price
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-indigo-500" />
                  <CardTitle>Exit Strategy</CardTitle>
                </div>
                <CardDescription>
                  Core exit signals to protect profits and avoid distribution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="font-medium">Partial Profit Taking</div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      <li>Sell 50% position at +30%</li>
                      <li>Hold remainder for runner potential</li>
                    </ul>
                    <div className="text-xs text-muted-foreground">
                      A small number of large winners usually pay for many small
                      trades.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Distribution Signal</div>
                    <div className="text-sm text-muted-foreground">Exit when:</div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      <li>Brokers switch from net buy to net sell</li>
                      <li>Volume spike but price stops rising</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Trend Failure</div>
                    <div className="text-sm text-muted-foreground">Exit if:</div>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      <li>Price closes below breakout level</li>
                      <li>Loss exceeds defined stop (5–8%)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-indigo-500" />
                  <CardTitle>Runner Probability Scoring Model</CardTitle>
                </div>
                <CardDescription>
                  Each factor adds points, producing a 0–100 score.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">1. Breakout Strength</div>
                      <Badge variant="secondary" className="font-medium">
                        Max 25
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex justify-between gap-3">
                        <span>No breakout</span>
                        <span className="text-foreground">0</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Weak breakout</span>
                        <span className="text-foreground">10</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Clear resistance breakout</span>
                        <span className="text-foreground">25</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">2. Volume Expansion</div>
                      <Badge variant="secondary" className="font-medium">
                        Max 20
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex justify-between gap-3">
                        <span>Volume &lt; average</span>
                        <span className="text-foreground">0</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>1.5x average</span>
                        <span className="text-foreground">10</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>2x average</span>
                        <span className="text-foreground">15</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>3x or more</span>
                        <span className="text-foreground">20</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">3. Broker Accumulation</div>
                      <Badge variant="secondary" className="font-medium">
                        Max 20
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex justify-between gap-3">
                        <span>No notable broker</span>
                        <span className="text-foreground">0</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Minor accumulation</span>
                        <span className="text-foreground">8</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Institutional buying</span>
                        <span className="text-foreground">15</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Institution accumulating multiple days</span>
                        <span className="text-foreground">20</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">4. Smart Money Score</div>
                      <Badge variant="secondary" className="font-medium">
                        Max 15
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex justify-between gap-3">
                        <span>&lt;40</span>
                        <span className="text-foreground">3</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>40–50</span>
                        <span className="text-foreground">8</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>50–70</span>
                        <span className="text-foreground">15</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>&gt;80</span>
                        <span className="text-foreground">6</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">5. Liquidity Quality</div>
                      <Badge variant="secondary" className="font-medium">
                        Max 10
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex justify-between gap-3">
                        <span>&lt;100k volume</span>
                        <span className="text-foreground">2</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>100k–300k</span>
                        <span className="text-foreground">5</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>300k–1M</span>
                        <span className="text-foreground">8</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>&gt;1M</span>
                        <span className="text-foreground">10</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">6. Momentum Confirmation</div>
                      <Badge variant="secondary" className="font-medium">
                        Max 10
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex justify-between gap-3">
                        <span>Below MA</span>
                        <span className="text-foreground">0</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Above MA20</span>
                        <span className="text-foreground">5</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Above MA20 and MA50</span>
                        <span className="text-foreground">8</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Strong trend</span>
                        <span className="text-foreground">10</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">Final score</div>
                  <p className="mt-1">
                    Runner Score = Breakout + Volume + Broker Flow + Smart Money +
                    Liquidity + Momentum
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-500" />
                  <CardTitle>Example Scenario</CardTitle>
                </div>
                <CardDescription>
                  Example: breakout confirmed, volume 2.5×, broker accumulating, smart
                  money 62, avg volume 700k, price above MA20.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between border-b py-2 text-sm">
                      <span>Breakout</span>
                      <span className="font-medium">25</span>
                    </div>
                    <div className="flex items-center justify-between border-b py-2 text-sm">
                      <span>Volume</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex items-center justify-between border-b py-2 text-sm">
                      <span>Broker</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex items-center justify-between border-b py-2 text-sm">
                      <span>Smart Money</span>
                      <span className="font-medium">15</span>
                    </div>
                    <div className="flex items-center justify-between border-b py-2 text-sm">
                      <span>Liquidity</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between border-b py-2 text-sm">
                      <span>Momentum</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-4 text-center">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Final runner score
                    </div>
                    <div className="mt-2 text-5xl font-black">92</div>
                    <Badge className="mt-2 bg-emerald-600 text-white">
                      Explosive setup
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border bg-indigo-500/5 p-3 text-sm text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p>
                    Setups above 80 are rare but often lead to explosive moves.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <CardTitle>Score Interpretation</CardTitle>
                </div>
                <CardDescription>
                  Mapping from score ranges to probability level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Range</TableHead>
                      <TableHead>Meaning</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-red-500 text-white">0–40</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Low probability
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-orange-500 text-white">40–60</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Moderate setup
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-yellow-500 text-white">60–75</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Strong candidate
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-green-600 text-white">75–85</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        High probability runner
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-emerald-600 text-white">85+</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Explosive setup
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="sticky top-8">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-500" />
                    <CardTitle>Interactive Calculator</CardTitle>
                  </div>
                  <CardDescription>
                    Select inputs to compute the Runner Probability Score.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                      <div className="text-xs text-muted-foreground">
                        0–100 scale
                      </div>
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
                        <Label htmlFor={key}>{label}</Label>
                        <Select
                          value={String(calcValues[key])}
                          onValueChange={(v) => handleSelect(key, v)}
                        >
                          <SelectTrigger id={key} className="w-full">
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
                    onClick={() =>
                      setCalcValues({
                        breakout: 0,
                        volume: 0,
                        broker: 0,
                        smartMoney: 0,
                        liquidity: 0,
                        momentum: 0,
                      })
                    }
                  >
                    Reset Calculator
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
