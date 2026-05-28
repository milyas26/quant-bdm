import { ArrowDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const phases = [
  {
    label: "Accumulation",
    color: "bg-indigo-500",
    textColor: "text-indigo-500",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/5",
    description: "Bandar atau institusi mulai membeli saham secara bertahap.",
    ciri: [
      "Harga bergerak sideways",
      "Volume mulai meningkat perlahan",
      "Broker tertentu muncul sebagai net buyer",
      "Belum ada perhatian publik",
    ],
  },
  {
    label: "Volume Expansion",
    color: "bg-blue-400/10 text-blue-400",
    textColor: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/5",
    description: "Likuiditas mulai masuk secara signifikan sebelum breakout.",
    ciri: [
      "Volume mulai melebihi rata-rata",
      "Smart money score naik",
      "Spread harga mulai membesar",
      "Tekanan beli terlihat di broker flow",
    ],
  },
  {
    label: "Breakout",
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/5",
    description: "Harga menembus level resistance penting dengan konfirmasi volume.",
    ciri: [
      "Breakout candle kuat",
      "Volume spike signifikan",
      "Momentum meningkat tajam",
      "Breakout = YES di screener",
    ],
  },
  {
    label: "Trend Expansion",
    color: "bg-amber-400/20 text-amber-400",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-amber-400/5",
    description: "Setelah breakout, harga bergerak naik dengan cepat.",
    ciri: [
      "Higher highs secara konsisten",
      "Volume tetap tinggi",
      "Trader momentum mulai masuk",
      "Berita positif sering muncul di fase ini",
    ],
  },
  {
    label: "Distribution",
    color: "bg-destructive",
    textColor: "text-negative",
    borderColor: "border-destructive/30",
    bgColor: "bg-destructive/5",
    description: "Bandar mulai melepas posisi saat harga naik atau mendatar.",
    ciri: [
      "Broker yang sebelumnya beli mulai jual",
      "Kenaikan harga mulai melambat",
      "Volume spike tapi harga tidak naik",
      "Sinyal exit mulai muncul",
    ],
  },
]

export default function GuideRunnerLifecycle() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">Page 1</Badge>
          <h2 className="text-xl font-bold">Understanding Runner Lifecycle</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Runner saham bukan terjadi secara tiba-tiba. Ada siklus yang bisa dipelajari dan diidentifikasi lebih awal.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Siklus Runner</CardTitle>
          <CardDescription>Lima fase yang biasanya dilalui sebuah runner saham.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-col items-center gap-1">
            {phases.map((phase, i) => (
              <div key={phase.label} className="flex w-full flex-col items-center">
                <div className={`flex w-full max-w-md items-center justify-center rounded-sm border px-4 py-2 text-sm font-semibold ${phase.borderColor} ${phase.bgColor} ${phase.textColor}`}>
                  {phase.label}
                </div>
                {i < phases.length - 1 && (
                  <ArrowDown className="my-1 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {phases.map((phase) => (
          <Card key={phase.label} className={`border ${phase.borderColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${phase.color}`} />
                <CardTitle className={`text-base ${phase.textColor}`}>{phase.label}</CardTitle>
              </div>
              <CardDescription>{phase.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Ciri-ciri</div>
              <ul className="space-y-1.5">
                {phase.ciri.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${phase.color}`} />
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-sm border bg-indigo-500/5 p-4 text-sm">
        <div className="font-semibold text-foreground mb-1">Key Insight</div>
        <p className="text-muted-foreground leading-relaxed">
          Runner <span className="font-medium text-foreground">tidak dimulai saat breakout</span>. Runner dimulai saat accumulation. Breakout hanya merupakan <span className="font-medium text-foreground">trigger publik</span> dari move yang sudah dimulai sebelumnya.
        </p>
      </div>
    </div>
  )
}
