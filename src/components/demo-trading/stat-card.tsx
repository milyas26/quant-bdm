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

export const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  valueClass,
  loading,
}: StatCardProps) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pb-0">
      <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </CardTitle>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent className="px-4">
      {loading ? (
        <Skeleton className="mt-1 h-7 w-20" />
      ) : (
        <>
          <p className={cn("text-2xl font-bold tracking-tight", valueClass)}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </>
      )}
    </CardContent>
  </Card>
)
