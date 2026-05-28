import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const components = [
  {
    name: "Breakout Strength",
    max: 25,
    scores: [
      { label: "No breakout", value: 0 },
      { label: "Weak breakout", value: 10 },
      { label: "Clear resistance breakout", value: 25 },
    ],
  },
  {
    name: "Volume Expansion",
    max: 20,
    scores: [
      { label: "Volume < average", value: 0 },
      { label: "1.5× average", value: 10 },
      { label: "2× average", value: 15 },
      { label: "3× or more", value: 20 },
    ],
  },
  {
    name: "Broker Accumulation",
    max: 20,
    scores: [
      { label: "No notable broker", value: 0 },
      { label: "Minor accumulation", value: 8 },
      { label: "Institutional buying", value: 15 },
      { label: "Institution accumulating multiple days", value: 20 },
    ],
  },
  {
    name: "Smart Money Score",
    max: 15,
    scores: [
      { label: "<40", value: 3 },
      { label: "40–50", value: 8 },
      { label: "50–70", value: 15 },
      { label: ">80", value: 6 },
    ],
  },
  {
    name: "Liquidity Quality",
    max: 10,
    scores: [
      { label: "<100k volume", value: 2 },
      { label: "100k–300k", value: 5 },
      { label: "300k–1M", value: 8 },
      { label: ">1M", value: 10 },
    ],
  },
  {
    name: "Momentum Confirmation",
    max: 10,
    scores: [
      { label: "Below MA", value: 0 },
      { label: "Above MA20", value: 5 },
      { label: "Above MA20 and MA50", value: 8 },
      { label: "Strong trend", value: 10 },
    ],
  },
]

const interpretations = [
  { range: "0–40", label: "Low probability", color: "bg-destructive", textColor: "text-negative", rule: null },
  { range: "40–60", label: "Moderate setup", color: "bg-amber-400/20 text-amber-400", textColor: "text-warning", rule: null },
  { range: "60–75", label: "Strong candidate", color: "bg-amber-400/20 text-amber-400", textColor: "text-yellow-500", rule: null },
  { range: "75–85", label: "High probability runner", color: "bg-emerald-600", textColor: "text-positive", rule: "Watchlist" },
  { range: "85+", label: "Explosive setup", color: "bg-emerald-600", textColor: "text-emerald-600", rule: "Trade candidate" },
]

export default function GuideRunnerScore() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">Page 5</Badge>
          <h2 className="text-xl font-bold">Runner Probability Score</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sistem menggunakan <span className="font-medium text-foreground">Runner Score (0–100)</span> untuk menilai potensi sebuah saham menjadi runner. Semakin tinggi score, semakin kuat setupnya.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Formula Runner Score</CardTitle>
          <CardDescription>Total maksimal = 100 poin dari 6 komponen.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-sm border bg-muted/30 p-4 font-mono text-sm leading-relaxed text-muted-foreground">
            Runner Score =<br />
            &nbsp;&nbsp;Breakout Strength (max 25)<br />
            &nbsp;+ Volume Expansion (max 20)<br />
            &nbsp;+ Broker Accumulation (max 20)<br />
            &nbsp;+ Smart Money (max 15)<br />
            &nbsp;+ Liquidity (max 10)<br />
            &nbsp;+ Momentum (max 10)
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {components.map(({ name, max, scores }) => (
          <Card key={name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{name}</CardTitle>
                <Badge variant="secondary" className="font-medium">Max {max}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {scores.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Score Interpretation</CardTitle>
          <CardDescription>Pemetaan score ke action yang perlu diambil.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Score</TableHead>
                <TableHead>Makna</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interpretations.map(({ range, label, color, rule }) => (
                <TableRow key={range}>
                  <TableCell>
                    <Badge className={`${color} text-white`}>{range}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{label}</TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {rule ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-sm border bg-muted/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">Minimum Watchlist</div>
              <div className="text-3xl font-black text-foreground mt-1">≥70</div>
            </div>
            <div className="rounded-sm border bg-emerald-500/5 border-emerald-500/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">Trade Candidate</div>
              <div className="text-3xl font-black text-emerald-500 mt-1">≥80</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Contoh Perhitungan</CardTitle>
          <CardDescription>
            Breakout confirmed, volume 2.5×, broker accumulating, smart money 62, avg volume 700k, price above MA20.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              {[
                { label: "Breakout (clear resistance)", score: 25 },
                { label: "Volume (2.5× average)", score: 18 },
                { label: "Broker (accumulating)", score: 18 },
                { label: "Smart Money (score 62)", score: 15 },
                { label: "Liquidity (700k avg)", score: 8 },
                { label: "Momentum (above MA20)", score: 8 },
              ].map(({ label, score }) => (
                <div key={label} className="flex items-center justify-between border-b py-2 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold tabular-nums">{score}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center rounded-sm border bg-muted/30 p-6">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Final Runner Score</div>
              <div className="mt-2 text-6xl font-black">92</div>
              <Badge className="mt-3 bg-emerald-600 text-white">Explosive Setup</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
