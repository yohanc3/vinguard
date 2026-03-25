import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

type VerdictType = "critical" | "warning" | "success"

interface VerdictBannerProps {
  type: VerdictType
  verdict: string
  description: string
}

export function VerdictBanner({ type, verdict, description }: VerdictBannerProps) {
  const config = {
    critical: {
      bg: "bg-rose-500/10 border-rose-500/30",
      textColor: "text-rose-400",
      Icon: XCircle,
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30",
      textColor: "text-amber-400",
      Icon: AlertTriangle,
    },
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      textColor: "text-emerald-400",
      Icon: CheckCircle2,
    },
  }

  const { bg, textColor, Icon } = config[type]

  return (
    <div className={`px-6 py-4 rounded-lg border ${bg}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${textColor}`} />
        <span className={`text-lg font-bold tracking-wide ${textColor}`}>
          {verdict}
        </span>
      </div>
      <p className="text-sm text-muted-foreground ml-9">
        {description}
      </p>
    </div>
  )
}
