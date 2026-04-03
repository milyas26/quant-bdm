import { useQuery } from '@tanstack/react-query'
import { getBrokers } from '@/lib/apis/broker/broker-api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import { useMemo } from 'react'
import { getBrokerColor, cn } from '@/lib/utils'

const GROUP_ORDER = ['SMART_MONEY', 'DUMB_MONEY', 'RITEL', 'PEMERINTAH', 'ASING', 'LOKAL']

interface BrokersProps {
  search?: string
}

const Brokers = ({ search = "" }: BrokersProps) => {

  const { data: brokerGroup, isLoading, isError, error } = useQuery({
    queryKey: ['brokers'],
    queryFn: getBrokers,
  })

  const filteredGroup = useMemo((): typeof brokerGroup => {
    if (!brokerGroup) return {}
    const q = search.trim().toLowerCase()
    if (!q) return brokerGroup
    return Object.fromEntries(
      Object.entries(brokerGroup)
        .map(([key, brokers]) => [
          key,
          brokers.filter(
            (b) =>
              b.code.toLowerCase().includes(q) ||
              b.name.toLowerCase().includes(q)
          ),
        ])
        .filter(([, brokers]) => (brokers as typeof brokerGroup[string]).length > 0)
    )
  }, [brokerGroup, search])

  return (
    <div className="space-y-4">

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error?.message}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && Object.keys(filteredGroup ?? {}).length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          {search ? 'Tidak ada broker yang cocok.' : 'Tidak ada data broker.'}
        </div>
      )}

      {!isLoading && !isError && Object.entries(filteredGroup ?? {})
        .sort(([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b))
        .map(([groupKey, brokers]) => (
          <div key={groupKey} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {groupKey}
              </Badge>
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{brokers.length} broker</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {brokers.map((broker) => (
                <Card key={broker.code} className="hover:bg-muted/50 rounded-sm transition-colors cursor-default py-0 shadow-sm border-muted">
                  <CardContent className="p-2 space-y-0.5">
                    <p className={cn("text-xs font-bold leading-none", getBrokerColor(broker.type))}>{broker.code}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-full" title={broker.name}>{broker.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

export default Brokers