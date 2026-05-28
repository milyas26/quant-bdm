import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: React.ElementType
  valueClass?: string
  loading?: boolean
}

export const StatCard = ({ label, value, sub, icon: Icon, valueClass, loading }: StatCardProps) => (
  <Card className="relative overflow-hidden border-border">
    <CardHeader className="flex items-center space-y-0 px-3 pb-0">
      <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted">
        <Icon className="h-3 w-3 text-muted-foreground" />
      </div>
      <CardTitle className="text-[10px] font-mono font-medium tracking-wider text-muted-foreground uppercase">{label}</CardTitle>
    </CardHeader>
    <CardContent className="px-3">
      {loading ? <Skeleton className="mt-1 h-6 w-16" /> : (
        <>
          <p className={cn("text-lg font-mono font-bold tracking-tight", valueClass)}>{value}</p>
          {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
        </>
      )}
    </CardContent>
  </Card>
)
