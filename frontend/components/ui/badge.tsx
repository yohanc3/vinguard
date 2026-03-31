import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info"
  size?: "sm" | "md"
  children: ReactNode
  className?: string
}

export function Badge({ 
  variant = "default", 
  size = "md",
  children, 
  className 
}: BadgeProps) {
  const variantStyles = {
    default: "bg-secondary text-secondary-foreground border-border",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  )
}
