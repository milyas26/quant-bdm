import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export default function GuideExitStrategy() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">Page 4</Badge>
          <h2 className="text-xl font-bold">Exit Strategy</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Exit adalah bagian terpenting dari trading. Runner jarang langsung terlihat — kamu perlu strategi yang jelas untuk melindungi profit dan membatasi kerugian.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-emerald-500/30">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">Partial Profit Taking</CardTitle>
            </div>
            <CardDescription>Strategi untuk mengamankan profit sambil tetap riding runner.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jual 50% posisi saat</span>
                <Badge className="bg-emerald-600 text-white">+30%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hold 50% untuk</span>
                <span className="font-medium text-foreground">runner potential</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dalam trading, <span className="font-medium text-foreground">1 runner besar bisa menutup banyak trade kecil yang rugi</span>. Strategi partial profit memastikan kamu tidak exit terlalu awal dari runner.
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <CardTitle className="text-base text-orange-600 dark:text-orange-400">Distribution Signal</CardTitle>
            </div>
            <CardDescription>Sinyal bahwa smart money mulai melepas posisi.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Exit ketika:</div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Broker yang sebelumnya beli mulai switch ke net sell
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Volume spike tapi harga tidak naik (supply masuk)
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Akumulasi/Distribusi indikator berubah ke distribution
              </li>
            </ul>
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-2 text-xs text-orange-600 dark:text-orange-400">
              Ini tanda supply mulai masuk ke pasar
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <CardTitle className="text-base text-red-600 dark:text-red-400">Trend Failure</CardTitle>
            </div>
            <CardDescription>Stop loss untuk melindungi dari false breakout.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Exit jika:</div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                Harga kembali di bawah level breakout
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                Loss melebihi batas stop loss yang sudah ditentukan
              </li>
            </ul>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">Stop Loss Range</div>
              <div className="text-2xl font-black text-red-500 mt-1">5–8%</div>
              <div className="text-xs text-muted-foreground mt-0.5">dari harga entry</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Ringkasan Exit Decision Tree</CardTitle>
          <CardDescription>Gunakan panduan ini saat mempertimbangkan keluar dari posisi.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {[
              { condition: "Profit sudah +30%", action: "Jual 50% posisi (partial profit)", color: "text-emerald-500", border: "border-emerald-500/30", bg: "bg-emerald-500/5" },
              { condition: "Broker mulai net sell setelah sebelumnya accumulation", action: "Exit sebagian atau full posisi", color: "text-orange-500", border: "border-orange-500/30", bg: "bg-orange-500/5" },
              { condition: "Volume spike tapi harga tidak bergerak naik", action: "Waspada — siapkan exit", color: "text-yellow-500", border: "border-yellow-500/30", bg: "bg-yellow-500/5" },
              { condition: "Harga turun di bawah breakout level", action: "Exit segera — false breakout", color: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/5" },
              { condition: "Loss mencapai 5–8% dari entry", action: "Cut loss — lindungi modal", color: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/5" },
            ].map(({ condition, action, color, border, bg }) => (
              <div key={condition} className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border ${border} ${bg} gap-2 p-3`}>
                <div className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Jika:</span> {condition}</div>
                <div className={`text-sm font-medium ${color} shrink-0`}>→ {action}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-lg border bg-indigo-500/5 p-4 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        <p className="text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Ingat:</span> Tidak ada exit yang sempurna. Tujuannya adalah <span className="font-medium text-foreground">melindungi modal</span> saat salah, dan <span className="font-medium text-foreground">membiarkan profit berlari</span> saat benar.
        </p>
      </div>
    </div>
  )
}
