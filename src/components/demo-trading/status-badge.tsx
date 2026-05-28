import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps { status: string }

export const StatusBadge = ({ status }: StatusBadgeProps) =>
  status === "OPEN" ? (
    <Badge className="border-emerald-400/20 bg-emerald-400/10 font-mono text-[10px] text-positive rounded-sm">
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
      OPEN
    </Badge>
  ) : (
    <Badge variant="secondary" className="font-mono text-[10px] text-muted-foreground rounded-sm">CLOSED</Badge>
  )
