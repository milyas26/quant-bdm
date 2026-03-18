import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

export const StatusBadge = ({ status }: StatusBadgeProps) =>
  status === "OPEN" ? (
    <Badge className="border-emerald-500/25 bg-emerald-500/15 font-medium text-emerald-500">
      <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      OPEN
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-muted-foreground">
      CLOSED
    </Badge>
  )
