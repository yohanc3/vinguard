import { Clock, DollarSign, ChevronRight } from "lucide-react"
import { Card } from "#/components/ui/card"
import { RiskBadge } from "#/components/risk-badge"

interface Report {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  riskLevel: "critical" | "medium" | "low"
  riskScore: number
  redFlags: number
  summary: string
  askingPrice: number
  lastUpdated: string
  image: string
}

interface ReportCardProps {
  report: Report
  onClick: () => void
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  return (
    <Card
      className="bg-card/50 border-border hover:border-zinc-600 transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="flex">
        <div className="relative w-40 h-40 flex-shrink-0">
          <img
            src={report.image}
            alt={`${report.year} ${report.make} ${report.model}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                {report.year} {report.make} {report.model}
              </h3>
              <p className="text-xs text-muted-foreground">{report.trim}</p>
            </div>
            <RiskBadge level={report.riskLevel} score={report.riskScore} />
          </div>

          <p className="font-mono text-xs text-muted-foreground mb-3 tracking-wider">
            {report.vin}
          </p>

          <p className="text-sm text-zinc-400 mb-3 line-clamp-1">
            {report.redFlags > 0 ? (
              <span className="text-rose-400">{report.redFlags} Red Flags found</span>
            ) : (
              <span className="text-emerald-400">{report.summary}</span>
            )}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${report.askingPrice.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {report.lastUpdated}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Card>
  )
}
