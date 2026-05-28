import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ChangeIndicatorProps {
  value: number
  suffix?: string
  showIcon?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
}

export function ChangeIndicator({ value, suffix = "%", showIcon = false, className, size = "sm" }: ChangeIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono font-medium",
        sizeMap[size],
        isPositive && "text-positive",
        isNegative && "text-negative",
        !isPositive && !isNegative && "text-muted-foreground",
        className,
      )}
    >
      {showIcon && isPositive && <TrendingUp className="h-3 w-3" />}
      {showIcon && isNegative && <TrendingDown className="h-3 w-3" />}
      {showIcon && !isPositive && !isNegative && <Minus className="h-3 w-3" />}
      {isPositive ? "+" : ""}{value.toFixed(size === "sm" ? 1 : 2)}{suffix}
    </span>
  )
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "font-mono font-bold",
        score >= 70 ? "text-positive" : score <= 30 ? "text-negative" : "text-warning",
        className,
      )}
    >
      {score}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-mono font-medium",
        status === "Accumulation" && "text-positive bg-positive border border-emerald-400/20",
        status === "Distribution" && "text-negative bg-negative border border-red-400/20",
        status === "Neutral" && "text-muted-foreground bg-muted border border-border",
        className,
      )}
    >
      {status}
    </span>
  )
}
