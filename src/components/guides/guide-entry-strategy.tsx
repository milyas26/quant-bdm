import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const entries = [
  {
    badge: "1",
    badgeColor: "bg-indigo-600",
    title: "Early Entry",
    subtitle: "Before Breakout — Accumulation Phase",
    description: "Digunakan ketika saham masih dalam fase accumulation dan belum ada breakout. Cocok untuk trader dengan toleransi waktu tinggi.",
    ciri: [
      "Broker accumulation terdeteksi",
      "Volume mulai naik perlahan",
      "Harga sideways di area support / base",
    ],
    entry: "Support / base area",
    pros: [
      "Risk kecil karena entry di bawah",
      "Reward terbesar jika runner terjadi",
      "Harga paling murah",
    ],
    cons: ["Bisa sideways dalam waktu lama", "Belum ada konfirmasi breakout"],
    highlight: null,
  },
  {
    badge: "2",
    badgeColor: "bg-emerald-600",
    title: "Breakout Entry",
    subtitle: "Highest Probability — Recommended",
    description: "Entry paling konsisten dan merupakan sweet spot antara probability tinggi dan risk/reward yang baik.",
    ciri: [
      "Breakout = YES di screener",
      "Volume spike terkonfirmasi",
      "Broker masih net buy",
    ],
    entry: "Breakout candle atau pullback kecil setelah breakout",
    pros: [
      "Probabilitas tertinggi",
      "Momentum sudah terkonfirmasi",
      "Timing lebih presisi",
    ],
    cons: ["Entry price lebih tinggi dari early entry"],
    highlight: "Ini adalah sweet spot antara probability dan risk/reward.",
  },
  {
    badge: "3",
    badgeColor: "bg-blue-400/10 text-blue-400",
    title: "Momentum Entry",
    subtitle: "Trend Continuation — After Trend Started",
    description: "Digunakan setelah trend sudah berjalan. Memanfaatkan pullback atau konsolidasi sebagai titik entry.",
    ciri: [
      "Trend sudah berjalan (higher highs)",
      "Volume continuation masih kuat",
      "Pullback ke area support baru",
    ],
    entry: "First pullback atau konsolidasi singkat",
    pros: ["Probability tinggi karena trend sudah terkonfirmasi"],
    cons: [
      "Risk/reward lebih kecil",
      "Entry price paling mahal",
      "Bisa masuk terlambat jika runner sudah jauh",
    ],
    highlight: null,
  },
]

export default function GuideEntryStrategy() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">Page 3</Badge>
          <h2 className="text-xl font-bold">Entry Strategy</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ada tiga cara entry menggunakan screener, masing-masing sesuai dengan fase pasar yang berbeda. Pilih berdasarkan profil risiko dan fase saham yang kamu analisis.
        </p>
      </div>

      <div className="space-y-6">
        {entries.map(({ badge, badgeColor, title, subtitle, description, ciri, entry, pros, cons, highlight }) => (
          <Card key={title}>
            <CardHeader className="border-b">
              <div className="flex items-start gap-3">
                <Badge className={`${badgeColor} text-white mt-0.5 shrink-0`}>{badge}</Badge>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-0.5 font-medium">{subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ciri-ciri</div>
                  <ul className="space-y-1.5">
                    {ciri.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Kelebihan</div>
                  <ul className="space-y-1.5">
                    {pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Kekurangan</div>
                  <ul className="space-y-1.5">
                    {cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-sm border bg-muted/30 p-3 text-sm">
                <span className="font-medium text-foreground">Entry Point: </span>
                <span className="text-muted-foreground">{entry}</span>
              </div>

              {highlight && (
                <div className="rounded-sm border bg-emerald-500/5 border-emerald-500/30 p-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {highlight}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-sm border bg-indigo-500/5 p-4 text-sm">
        <div className="font-semibold text-foreground mb-1">Tips Memilih Entry</div>
        <p className="text-muted-foreground leading-relaxed">
          Gunakan <span className="font-medium text-foreground">Breakout Entry</span> sebagai default. Gunakan Early Entry jika kamu sudah mengidentifikasi accumulation lebih awal. Gunakan Momentum Entry hanya jika trend sudah sangat kuat dan volume masih tinggi.
        </p>
      </div>
    </div>
  )
}
