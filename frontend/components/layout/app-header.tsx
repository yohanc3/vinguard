import { type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { AppLogo } from "./app-logo"

interface AppHeaderProps {
  onBack?: () => void
  backLabel?: string
  title?: string
  children?: ReactNode
  showLogo?: boolean
  centerContent?: ReactNode
}

export function AppHeader({ 
  onBack, 
  backLabel = "Back", 
  title,
  children,
  showLogo = true,
  centerContent,
}: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{backLabel}</span>
            </button>
          ) : showLogo ? (
            <AppLogo size="sm" />
          ) : (
            <div />
          )}

          {centerContent ? (
            centerContent
          ) : title ? (
            <div className="flex items-center gap-3">
              <AppLogo size="sm" />
              <span className="text-lg font-bold tracking-tight text-foreground">{title}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}
