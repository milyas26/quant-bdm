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

const indicators = [
  {
    number: "1",
    title: "Breakout Signal",
    description: "Menunjukkan bahwa harga telah menembus level resistance penting.",
    detail: "Breakout adalah trigger utama runner. Ketika breakout terkonfirmasi bersama volume, probabilitas kelanjutan naik meningkat signifikan.",
    content: (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="font-semibold text-emerald-500 text-sm mb-1">YES</div>
          <div className="text-xs text-muted-foreground">Saham sedang memulai trend baru. Potensi runner aktif.</div>
        </div>
        <div className="rounded-lg border border-muted p-3">
          <div className="font-semibold text-muted-foreground text-sm mb-1">NO</div>
          <div className="text-xs text-muted-foreground">Saham masih dalam fase base / accumulation.</div>
        </div>
      </div>
    ),
  },
  {
    number: "2",
    title: "Volume Spike",
    description: "Mengukur apakah terjadi lonjakan volume dibanding rata-rata.",
    detail: "Breakout tanpa volume biasanya lebih sering gagal. Volume spike mengkonfirmasi bahwa ada partisipasi nyata dari pelaku pasar.",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          Volume spike = likuiditas masuk ke saham
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          Breakout tanpa volume = sinyal lemah, sering false breakout
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
          Ideal: volume 2–3x di atas rata-rata saat breakout
        </div>
      </div>
    ),
  },
  {
    number: "3",
    title: "Smart Money Score",
    description: "Indikator komposit yang mencoba mendeteksi aktivitas uang besar.",
    detail: "Score ini menggabungkan beberapa signal untuk mengukur intensitas akumulasi oleh smart money. Zona ideal runner biasanya di 50–70.",
    content: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Score</TableHead>
            <TableHead>Meaning</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell><Badge variant="outline">&lt;40</Badge></TableCell>
            <TableCell className="text-muted-foreground text-sm">Belum ada minat besar</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Badge variant="outline">40–60</Badge></TableCell>
            <TableCell className="text-muted-foreground text-sm">Akumulasi mulai terjadi</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Badge className="bg-emerald-600 text-white">50–70</Badge></TableCell>
            <TableCell className="text-muted-foreground text-sm font-medium">Zona runner potensial ✓</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Badge className="bg-orange-500 text-white">&gt;80</Badge></TableCell>
            <TableCell className="text-muted-foreground text-sm">Sering sudah terlambat</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
  {
    number: "4",
    title: "Broker Flow",
    description: "Memperlihatkan siapa yang aktif membeli saham.",
    detail: "Beberapa broker secara historis sering muncul sebelum runner terjadi. Kehadiran mereka di Top Buy biasanya menandakan institutional participation.",
    content: (
      <div className="space-y-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Broker yang sering muncul sebelum runner</div>
        <div className="flex flex-wrap gap-2">
          {["CC", "AK", "ZP", "BK", "CP"].map((b) => (
            <Badge key={b} className="bg-indigo-600 text-white font-mono">{b}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Jika broker tersebut muncul di <span className="font-medium text-foreground">Top Buy</span>, biasanya menandakan institutional participation yang lebih serius.
        </p>
      </div>
    ),
  },
  {
    number: "5",
    title: "Accumulation / Distribution",
    description: "Menunjukkan apakah saham sedang dikumpulkan atau dijual.",
    detail: "Runner biasanya muncul saat fase late accumulation atau saat baru masuk ke early distribution setelah breakout.",
    content: (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="font-semibold text-emerald-500 text-sm mb-1">Accumulation</div>
          <div className="text-xs text-muted-foreground">Sedang dikumpulkan. Potensi runner ke depan.</div>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
          <div className="font-semibold text-orange-500 text-sm mb-1">Distribution</div>
          <div className="text-xs text-muted-foreground">Sedang dijual. Hati-hati, bisa akhir dari runner.</div>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="font-semibold text-muted-foreground text-sm mb-1">Neutral</div>
          <div className="text-xs text-muted-foreground">Tidak ada dominasi. Tunggu konfirmasi.</div>
        </div>
      </div>
    ),
  },
]

export default function GuideReadingScreener() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">Page 2</Badge>
          <h2 className="text-xl font-bold">Reading the Screener</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Setiap saham yang muncul di screener memiliki beberapa indikator penting. Pelajari cara membacanya secara tepat.
        </p>
      </div>

      <div className="space-y-6">
        {indicators.map(({ number, title, description, detail, content }) => (
          <Card key={number}>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {number}
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-0.5">{description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
              {content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
