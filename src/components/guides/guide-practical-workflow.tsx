import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Scan dengan Filter Utama",
    description: "Mulai dengan filter paling dasar untuk mempersempit daftar saham.",
    actions: [
      { label: "Breakout = YES", note: "Filter saham yang sudah menembus resistance" },
    ],
    tip: "Ini akan menghasilkan daftar awal saham yang masuk ke fase baru.",
  },
  {
    step: 2,
    title: "Periksa Indikator Pendukung",
    description: "Validasi sinyal breakout dengan indikator tambahan.",
    actions: [
      { label: "Volume Spike", note: "Pastikan ada konfirmasi volume" },
      { label: "Smart Money 50–70", note: "Cari zona akumulasi aktif" },
      { label: "Broker Accumulation", note: "Cek kehadiran broker institutional" },
    ],
    tip: "Semakin banyak indikator yang align, semakin kuat setup-nya.",
  },
  {
    step: 3,
    title: "Hitung Runner Score",
    description: "Gunakan scoring model untuk mengkuantifikasi potensi saham.",
    actions: [
      { label: "Score ≥70", note: "Masukkan ke watchlist" },
      { label: "Score ≥80", note: "Jadikan trade candidate" },
    ],
    tip: "Score membantu kamu memprioritaskan saham mana yang layak dianalisis lebih dalam.",
  },
  {
    step: 4,
    title: "Tentukan Entry",
    description: "Pilih metode entry yang sesuai dengan fase saham.",
    actions: [
      { label: "Breakout candle", note: "Entry paling umum dan konsisten" },
      { label: "Pullback kecil setelah breakout", note: "Entry lebih baik dengan risk lebih kecil" },
    ],
    tip: "Jangan terburu-buru. Tunggu setup yang jelas sebelum masuk.",
  },
  {
    step: 5,
    title: "Kelola Posisi Aktif",
    description: "Monitor dan kelola trade yang sudah masuk.",
    actions: [
      { label: "Partial profit di +30%", note: "Jual 50% untuk mengamankan keuntungan" },
      { label: "Monitor broker flow", note: "Pantau apakah broker masih net buy" },
      { label: "Exit saat distribution", note: "Keluar ketika sinyal distribusi muncul" },
    ],
    tip: "Biarkan runner berlari. Jual sebagian dulu, hold sisanya untuk potensi lebih besar.",
  },
]

export default function GuidePracticalWorkflow() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">Page 6</Badge>
          <h2 className="text-xl font-bold">Practical Workflow</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cara menggunakan screener sehari-hari secara efektif. Ikuti langkah-langkah ini setiap sesi analisis.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map(({ step, title, description, actions, tip }) => (
          <Card key={step}>
            <CardHeader className="border-b">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 text-sm font-black text-indigo-500">
                  {step}
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-0.5">{description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                {actions.map(({ label, note }) => (
                  <div key={label} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">{label}</span>
                      {note && <span className="text-muted-foreground"> — {note}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-sm border bg-indigo-500/5 px-3 py-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-indigo-500">Tip:</span> {tip}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="border-b border-emerald-500/20">
          <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">Key Takeaway</CardTitle>
          <CardDescription>Hal paling penting dari seluruh sistem ini.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="rounded-sm border border-emerald-500/20 bg-background p-4 font-mono text-sm text-center">
            <div className="text-muted-foreground">Runner tidak dimulai saat <span className="line-through">breakout</span></div>
            <div className="mt-1 font-bold text-foreground text-base">Runner dimulai saat <span className="text-emerald-500">Accumulation</span></div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Breakout hanya merupakan <span className="font-medium text-foreground">trigger publik</span> dari move yang sudah dimulai sebelumnya. Tugas screener ini adalah membantu kamu menemukan accumulation tersebut <span className="font-medium text-foreground">lebih awal dari publik</span>.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-sm border bg-muted/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">Temukan</div>
              <div className="font-semibold text-foreground mt-0.5">Accumulation</div>
            </div>
            <div className="rounded-sm border bg-muted/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">Konfirmasi</div>
              <div className="font-semibold text-foreground mt-0.5">Breakout</div>
            </div>
            <div className="rounded-sm border bg-muted/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">Ride</div>
              <div className="font-semibold text-foreground mt-0.5">Runner</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
