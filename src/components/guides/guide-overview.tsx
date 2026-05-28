import { BarChart2, TrendingUp, Users, Zap, Layers, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function GuideOverview() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Screener ini dirancang untuk <span className="font-medium text-foreground">mendeteksi saham dengan potensi runner (kenaikan besar)</span> menggunakan kombinasi beberapa sinyal pasar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: TrendingUp, label: "Breakout harga", color: "text-indigo-500" },
          { icon: BarChart2, label: "Volume expansion", color: "text-emerald-500" },
          { icon: Users, label: "Broker accumulation", color: "text-blue-400" },
          { icon: Zap, label: "Smart money activity", color: "text-yellow-500" },
          { icon: Layers, label: "Liquidity strength", color: "text-purple-500" },
          { icon: Activity, label: "Momentum", color: "text-rose-500" },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-sm border bg-muted/20 px-4 py-3 text-sm font-medium"
          >
            <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            {label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Tujuan Screener</CardTitle>
          <CardDescription>
            Alih-alih melihat satu indikator, sistem ini menggunakan scoring model dan pola market behavior.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Statistik dari dataset menunjukkan bahwa tidak semua breakout menjadi runner besar. Namun screener ini dirancang untuk <span className="font-medium text-foreground">meningkatkan probabilitas menemukan runner tersebut lebih awal</span>.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-sm border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-black text-indigo-500">~10%</div>
              <div className="mt-1 text-xs text-muted-foreground">breakout menjadi multibagger (≥100%)</div>
            </div>
            <div className="rounded-sm border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-black text-emerald-500">~3%</div>
              <div className="mt-1 text-xs text-muted-foreground">breakout menjadi 3x</div>
            </div>
            <div className="rounded-sm border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-black text-foreground">1 : 10</div>
              <div className="mt-1 text-xs text-muted-foreground">10 breakout → ~1 runner besar</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Apa yang akan kamu pelajari?</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <ol className="space-y-3">
            {[
              { page: "Page 1", title: "Understanding Runner Lifecycle", desc: "Pelajari siklus lengkap runner saham dari accumulation hingga distribution." },
              { page: "Page 2", title: "Reading the Screener", desc: "Cara membaca setiap indikator yang tersedia di screener." },
              { page: "Page 3", title: "Entry Strategy", desc: "Tiga metode entry berdasarkan fase pasar." },
              { page: "Page 4", title: "Exit Strategy", desc: "Kapan dan bagaimana cara keluar dari posisi." },
              { page: "Page 5", title: "Runner Probability Score", desc: "Memahami sistem scoring 0–100 untuk menilai potensi saham." },
              { page: "Page 6", title: "Practical Workflow", desc: "Langkah-langkah menggunakan screener sehari-hari." },
            ].map(({ page, title, desc }) => (
              <li key={page} className="flex gap-3 text-sm">
                <Badge variant="secondary" className="mt-0.5 shrink-0 font-mono text-xs">{page}</Badge>
                <div>
                  <span className="font-medium text-foreground">{title}</span>
                  <span className="text-muted-foreground"> — {desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
