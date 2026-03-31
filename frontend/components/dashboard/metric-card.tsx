import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  icon: LucideIcon
  title: string
  badge?: ReactNode
  children: ReactNode
}

export function MetricCard({ icon: Icon, title, badge, children }: MetricCardProps) {
  return (
    <Card className="bg-card/50 border-border overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
