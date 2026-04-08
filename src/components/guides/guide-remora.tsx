import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function SectionTitle({ number, title, sub }: { number: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <div className="font-bold text-base leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function Bullet({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
      {children}
    </div>
  )
}

export default function GuideRemora() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Panduan Membaca Indikator Remora</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Remora adalah lapisan analisa lanjutan berbasis konsep{" "}
          <span className="font-medium text-foreground">Price-Volume Analysis (PVA)</span> dan{" "}
          <span className="font-medium text-foreground">Broker Transactional Analysis</span> dari kelas Hengki
          Adinata. Indikator ini membantu mendeteksi distribusi, wash trading, posisi retail vs smart money, dan pola
          repo secara otomatis.
        </p>
      </div>

      {/* Intro cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Kolom Remora",
            desc: "Di tabel Screener & Stocks, ringkasan Remora ditampilkan per saham",
            color: "text-indigo-400",
          },
          {
            label: "Panel Remora",
            desc: "Di halaman Stock Detail, ada panel PVA + 4 chart analisis mendalam",
            color: "text-emerald-400",
          },
          {
            label: "Basis Data",
            desc: "Dihitung otomatis dari data broker summary 20 hari terakhir",
            color: "text-yellow-400",
          },
        ].map(({ label, desc, color }) => (
          <div key={label} className="rounded-lg border bg-muted/20 p-4">
            <div className={`text-sm font-semibold ${color}`}>{label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: PVA Trend ── */}
      <div className="space-y-4">
        <SectionTitle number="1" title="PVA Trend" sub="Price-Volume Analysis — 4-Kuadran Wyckoff" />
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm">Apa itu PVA Trend?</CardTitle>
            <CardDescription>
              Korelasi harga dan volume selama 10 hari terakhir. Dasar teori Richard Wyckoff: volume mencerminkan
              transaksi yang sudah terjadi, bukan sekadar sinyal.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Interpretasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-emerald-600 text-white">UPTREND</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">Hari harga naik → volume ikut naik</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Trend naik sehat. Smart money masih support.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-red-600 text-white">DOWNTREND</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Hari harga turun → volume justru besar
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Distribusi aktif. Hindari buy.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline">SIDEWAYS</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">Harga stagnan, volume normal</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Akumulasi diam-diam atau base building.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge variant="secondary">MIXED</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">Korelasi tidak konsisten</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Sinyal tidak jelas, butuh konfirmasi lebih lanjut.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-indigo-400">PVA Score</span> — persentase hari dalam 10 hari terakhir
              yang volumenya selaras dengan arah harga. Score &gt;70% = konsisten kuat.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 2: Volume Anomaly ── */}
      <div className="space-y-4">
        <SectionTitle number="2" title="Volume Anomaly" sub="Deteksi lonjakan volume vs rata-rata 20 hari" />
        <Card>
          <CardContent className="pt-5 space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline">NONE</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">&lt;1.5× avg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Volume normal, tidak ada sinyal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-yellow-500 text-white">MILD</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">1.5–3× avg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Perhatikan — mungkin akumulasi awal atau awal runner
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-orange-500 text-white">STRONG</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">3–5× avg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Event besar — bisa breakout atau distribusi masif
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-red-600 text-white">EXTREME</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">&gt;5× avg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Waspada — sering menjadi puncak distribusi atau bandar keluar massal
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground pt-2">
              Volume Anomaly{" "}
              <span className="font-medium text-foreground">bukan sinyal beli/jual sendiri</span>. Selalu baca
              bersamaan dengan PVA Trend — STRONG + UPTREND sangat berbeda dengan STRONG + DOWNTREND.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 3: Correction Health ── */}
      <div className="space-y-4">
        <SectionTitle number="3" title="Correction Health" sub="Kualitas koreksi — apakah wajar atau distribusi?" />
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dihitung sebagai rasio: <code className="rounded bg-muted px-1 text-xs">avg_vol_hari_turun / avg_vol_hari_naik</code> selama 20 hari.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">&lt;0.8</div>
                <div className="text-xs text-muted-foreground mt-1">Koreksi sehat — volume kering saat turun</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">0.8–1.2</div>
                <div className="text-xs text-muted-foreground mt-1">Netral — perlu perhatian lebih</div>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-center">
                <div className="text-lg font-bold text-red-400">&gt;1.2</div>
                <div className="text-xs text-muted-foreground mt-1">Koreksi tidak sehat — potensi distribusi</div>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <Bullet color="bg-emerald-500">
                <span>
                  <span className="font-medium text-foreground">Sehat (&lt;0.8):</span> Saat saham turun, volume
                  kecil — artinya tidak ada yang mau jual banyak. Smart money masih pegang.
                </span>
              </Bullet>
              <Bullet color="bg-red-500">
                <span>
                  <span className="font-medium text-foreground">Tidak sehat (&gt;1.2):</span> Saat turun, volume
                  justru besar — distribusi atau kepanikan jual.
                </span>
              </Bullet>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 4: Wash Trading Risk ── */}
      <div className="space-y-4">
        <SectionTitle number="4" title="Wash Trading Risk" sub='Deteksi "tek-tok" — volume besar tapi net kecil' />
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Formula:{" "}
              <code className="rounded bg-muted px-1 text-xs">
                (totalVolume − |netVolume|) / totalVolume × 100
              </code>
              . Makin tinggi skor, makin banyak transaksi yang bolak-balik (beli sekaligus jual di broker yang sama atau
              koordinasi).
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Interpretasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-emerald-600 text-white">LOW</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">&lt;50</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Transaksi natural, ada akumulasi nyata
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-yellow-500 text-white">MEDIUM</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">50–70</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Periksa siapa yang dominan — mungkin market-maker aktif
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-red-600 text-white">HIGH</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">&gt;70</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Volume fiktif tinggi — jangan terkecoh volume besar
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-yellow-400">Contoh:</span> MINA punya volume 100 juta lot, tapi net akumulasi
              hanya 300 ribu lot → wash score sangat tinggi. Ini bukan akumulasi nyata.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 5: Distribution Risk ── */}
      <div className="space-y-4">
        <SectionTitle number="5" title="Distribution Risk" sub="Skor gabungan 0–100: seberapa bahaya fase ini?" />
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indikator komposit dari 5 faktor secara bersamaan. Makin tinggi skor, makin besar kemungkinan smart
              money sedang keluar dan retail sedang masuk (skenario berbahaya).
            </p>
            <div className="space-y-2">
              {[
                { label: "Smart Money net selling", bobot: "+30", desc: "SM menjual lebih banyak dari membeli" },
                { label: "Retail net buying", bobot: "+30", desc: "Retail masuk besar-besaran" },
                { label: "Volume Down Days tinggi", bobot: "+20", desc: "Banyak hari harga turun dengan volume besar" },
                { label: "Wash Trading Score tinggi", bobot: "+10", desc: "Transaksi banyak yang bolak-balik" },
                { label: "Correction Health tidak sehat", bobot: "+10", desc: "Volume besar saat koreksi" },
              ].map(({ label, bobot, desc }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                    {bobot}
                  </Badge>
                  <div>
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2">
                <div className="font-bold text-emerald-400">&lt;30</div>
                <div className="text-muted-foreground">Aman</div>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-2">
                <div className="font-bold text-yellow-400">30–60</div>
                <div className="text-muted-foreground">Waspada</div>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2">
                <div className="font-bold text-red-400">&gt;60</div>
                <div className="text-muted-foreground">Bahaya</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 6: Repo Pattern ── */}
      <div className="space-y-4">
        <SectionTitle number="6" title="Repo Pattern" sub='"Sisir bapak" — volume terlalu seragam' />
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deteksi pola volume yang terlalu rapi — seperti robot yang membelikan saham secara cicil dengan jumlah
              uniform. Dihitung dari{" "}
              <span className="font-medium text-foreground">Coefficient of Variation (CV) volume 20 hari</span>.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <div className="font-semibold text-red-400 text-sm mb-2">⚠ Repo Terdeteksi</div>
                <div className="space-y-1.5">
                  <Bullet color="bg-red-500">CV volume &lt; 0.3 (sangat seragam)</Bullet>
                  <Bullet color="bg-red-500">Harga naik pelan-pelan tanpa akselerasi</Bullet>
                  <Bullet color="bg-red-500">Volume seperti sisir — sama terus setiap hari</Bullet>
                </div>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="font-semibold text-emerald-400 text-sm mb-2">✅ Akumulasi Normal</div>
                <div className="space-y-1.5">
                  <Bullet color="bg-emerald-500">Volume bervariasi alami (CV &gt; 0.3)</Bullet>
                  <Bullet color="bg-emerald-500">Ada spike volume di hari-hari tertentu</Bullet>
                  <Bullet color="bg-emerald-500">Pola akumulasi terlihat dari broker aktif</Bullet>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-slate-500/30 bg-muted/20 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Catatan:</span> Repo pattern bukan selalu negatif —
              ada institusi yang memang cicil perlahan. Tapi harus dicek siapa yang melakukan dan apakah ada
              distribusi bersamaan.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 7: Retail Exhaustion (Floor Price Chart) ── */}
      <div className="space-y-4">
        <SectionTitle number="7" title="Retail Exhaustion & Floor Price" sub="Tracking posisi XC dan estimasi harga modal SM" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm">Retail Exhaustion Chart</CardTitle>
              <CardDescription className="text-xs">
                Melacak akumulasi net lot XC (retail indicator broker) dan % yang sudah keluar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <Bullet color="bg-indigo-500">
                  <span>
                    <span className="font-medium text-foreground">Garis kumulatif lot:</span> posisi total XC dari
                    awal periode
                  </span>
                </Bullet>
                <Bullet color="bg-orange-500">
                  <span>
                    <span className="font-medium text-foreground">Garis exhaustion %:</span> berapa persen dari peak
                    holding yang sudah terjual
                  </span>
                </Bullet>
                <Bullet color="bg-emerald-500">
                  <span>
                    <span className="font-medium text-foreground">Threshold 50%:</span> zona di mana saham
                    cenderung siap naik karena "bau retail" sudah berkurang
                  </span>
                </Bullet>
              </div>
              <div className="rounded-md border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-indigo-400">Konsep Hengki:</span> "XC makan 95.000 lot. Minimal
                harus keluar 50% dulu sebelum sahamnya naik."
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm">Floor Price Chart</CardTitle>
              <CardDescription className="text-xs">
                Estimasi harga rata-rata modal smart money
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <Bullet color="bg-blue-500">
                  <span>
                    <span className="font-medium text-foreground">Bar SM net lot:</span> total lot yang dibeli SM per
                    hari
                  </span>
                </Bullet>
                <Bullet color="bg-yellow-400">
                  <span>
                    <span className="font-medium text-foreground">Garis Floor Price (dashed):</span>{" "}
                    <code className="rounded bg-muted px-1 text-xs">∑(SM buy val) / ∑(SM buy lot × 100)</code> —
                    estimasi average entry
                  </span>
                </Bullet>
              </div>
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-yellow-400">Konsep Hengki:</span> "Bandar beli gede di harga 140.
                Floor price-nya di sana. Di bawah itu, mereka yang defend posisi."
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── SECTION 8: 3 Doors ── */}
      <div className="space-y-4">
        <SectionTitle number="8" title="3-Door Analysis" sub="Whale Detection & Cohesion Analysis" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm">Door 2 — Whale Detection</CardTitle>
              <CardDescription className="text-xs">
                Mendeteksi broker yang entry dengan lot besar per transaksi
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Dihitung dari <code className="rounded bg-muted px-1 text-xs">bval / freq</code> — nilai rata-rata
                per transaksi. Retail cicil kecil-kecil (10–20 lot/tx), whale masuk besar sekali jalan.
              </p>
              <div className="space-y-2">
                {[
                  { cat: "retail", color: "bg-slate-600 text-white", desc: "Avg lot/tx normal, konsisten kecil" },
                  { cat: "active", color: "bg-blue-600 text-white", desc: "Medium size, frekuensi sedang" },
                  { cat: "whale", color: "bg-orange-500 text-white", desc: "Lot besar per transaksi — bandar muda" },
                  { cat: "institutional", color: "bg-purple-600 text-white", desc: "Sangat besar, broker asing/dana" },
                ].map(({ cat, color, desc }) => (
                  <div key={cat} className="flex items-center gap-2 text-xs">
                    <Badge className={`shrink-0 ${color}`}>{cat}</Badge>
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm">Door 3 — Cohesion Analysis</CardTitle>
              <CardDescription className="text-xs">
                Apakah retail kompak? Apakah ada imposter di antara mereka?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <Bullet color="bg-emerald-500">
                  <span>
                    <span className="font-medium text-foreground">Cohesion Score tinggi:</span> Retail bergerak
                    searah semua — FOMO atau panic bersamaan
                  </span>
                </Bullet>
                <Bullet color="bg-red-500">
                  <span>
                    <span className="font-medium text-foreground">Imposter Move:</span> Retail dominan (&gt;60%) tapi
                    SM tidak ikut (&lt;15%) — sinyal berbahaya (bandar tidak masuk tapi retail sudah FOMO)
                  </span>
                </Bullet>
                <Bullet color="bg-blue-500">
                  <span>
                    <span className="font-medium text-foreground">SM Alignment:</span> Apakah SM dan retail bergerak
                    ke arah yang sama pada hari itu?
                  </span>
                </Bullet>
              </div>
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-red-400">Imposter Move</span> = retail kompak beli tapi SM diam —
                ini sering jadi tanda distribusi atau saham tanpa bandar nyata.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── SECTION 9: Cara baca kolom ── */}
      <div className="space-y-4">
        <SectionTitle number="9" title="Cara Membaca Kolom Remora di Screener" sub="Ringkasan cepat di tabel Stocks & Screener Analysis" />
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Kolom <span className="font-medium text-foreground">Remora</span> di tabel screener menampilkan badge
              ringkasan. Berikut urutan prioritas pembacaan:
            </p>
            <div className="space-y-3">
              {[
                {
                  badge: "UPTREND",
                  badgeCls: "bg-emerald-600 text-white",
                  label: "PVA Trend",
                  desc: "Trend naik terkonfirmasi oleh volume. Kondisi ideal untuk hold/entry.",
                },
                {
                  badge: "DOWNTREND",
                  badgeCls: "bg-red-600 text-white",
                  label: "PVA Trend",
                  desc: "Distribusi aktif atau tekanan jual. Hindari entry baru.",
                },
                {
                  badge: "EXTREME",
                  badgeCls: "bg-red-500 text-white",
                  label: "Volume Anomaly",
                  desc: "Lonjakan volume >5× rata-rata — bisa puncak distribusi.",
                },
                {
                  badge: "HIGH",
                  badgeCls: "bg-red-600 text-white",
                  label: "Wash Trading Risk",
                  desc: "Hanya muncul jika MEDIUM atau HIGH. Volume bolak-balik fiktif.",
                },
                {
                  badge: "Dist >50%",
                  badgeCls: "bg-orange-500 text-white",
                  label: "Distribution Risk",
                  desc: "Hanya muncul jika >30. Skor distribusi composite tinggi.",
                },
                {
                  badge: "⚠ Repo",
                  badgeCls: "bg-yellow-500 text-white",
                  label: "Repo Pattern",
                  desc: "Volume terlalu seragam — pola cicil repo terdeteksi.",
                },
              ].map(({ badge, badgeCls, label, desc }) => (
                <div key={badge} className="flex items-start gap-3">
                  <Badge className={`shrink-0 ${badgeCls}`}>{badge}</Badge>
                  <div>
                    <div className="text-xs font-medium">
                      {label}
                    </div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 10: Workflow ── */}
      <div className="space-y-4">
        <SectionTitle number="10" title="Workflow Membaca Remora" sub="Urutan analisa yang disarankan" />
        <Card>
          <CardContent className="pt-5">
            <ol className="space-y-4">
              {[
                {
                  step: "Cek PVA Trend di kolom Remora",
                  detail: "Filter hanya UPTREND atau SIDEWAYS. Buang semua yang DOWNTREND.",
                },
                {
                  step: "Cek Distribution Risk",
                  detail: "Jika >60, skip meski trend bagus. Bandar mungkin sedang keluar.",
                },
                {
                  step: "Cek Wash Trading Risk",
                  detail: "Jika HIGH, volume besar tidak mencerminkan akumulasi nyata.",
                },
                {
                  step: "Buka Detail Saham → Panel Remora",
                  detail: "Lihat pva score, correction health, dan apakah ada repo pattern.",
                },
                {
                  step: "Buka Retail Exhaustion Chart",
                  detail: "Apakah retail sudah keluar >50%? Jika belum, masih butuh waktu.",
                },
                {
                  step: "Buka Floor Price Chart",
                  detail: "Di mana estimasi harga modal SM? Apakah harga sekarang masih di atas?",
                },
                {
                  step: "Buka Cohesion Analysis",
                  detail: "Apakah SM dan retail searah? Ada imposter move? Jika ada, extra cautious.",
                },
              ].map(({ step, detail }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
