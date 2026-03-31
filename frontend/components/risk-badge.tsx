import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type RiskLevel = "critical" | "medium" | "low"

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  showIcon?: boolean
}

export function RiskBadge({ level, score, showIcon = true }: RiskBadgeProps) {
  const config = {
    critical: {
      variant: "danger" as const,
      label: "Critical Risk",
      Icon: AlertTriangle,
    },
    medium: {
      variant: "warning" as const,
      label: "Verifying",
      Icon: Clock,
    },
    low: {
      variant: "success" as const,
      label: "Low Risk",
      Icon: CheckCircle2,
    },
  }

  const { variant, label, Icon } = config[level]

  return (
    <Badge variant={variant}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className="font-semibold">{label}</span>
      {score !== undefined && (
        <span className="font-mono opacity-75">{score}</span>
      )}
    </Badge>
  )
}
