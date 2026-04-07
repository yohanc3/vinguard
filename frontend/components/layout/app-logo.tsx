import { Shield } from "lucide-react"

interface AppLogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
}

export function AppLogo({ size = "md", showTagline = false }: AppLogoProps) {
  const iconSize = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size]

  const containerSize = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  }[size]

  const textSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size]

  return (
    <div className="flex items-center gap-3">
      <div className={`bg-gradient-to-br from-emerald-400 to-emerald-600 ${containerSize} rounded-lg`}>
        <Shield className={`${iconSize} text-white`} />
      </div>
      <div className="flex flex-col items-start">
        <span className={`${textSize} font-bold tracking-tight text-foreground`}>VINGUARD</span>
        {showTagline && (
          <span className="text-[10px] tracking-[0.3em] text-emerald-600 uppercase">Security Protocol</span>
        )}
      </div>
    </div>
  )
}
