import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiSectionCardProps {
  icon: LucideIcon
  iconColor?: string
  title: string
  apiSource: string
  children: ReactNode
  className?: string
}

export function ApiSectionCard({
  icon: Icon,
  iconColor = "text-blue-400",
  title,
  apiSource,
  children,
  className = "",
}: ApiSectionCardProps) {
  const bgColor = iconColor.replace("text-", "bg-").replace("-400", "-500/20")

  return (
    <Card className={`bg-card/50 border-border ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${bgColor} rounded-lg`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <CardTitle className="text-foreground">{title}</CardTitle>
            <CardDescription>{apiSource}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
