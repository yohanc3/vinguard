import { CheckCircle2, Copy } from "lucide-react"
import { useClipboard } from "#/hooks/use-clipboard"

interface VinDisplayProps {
  vin: string
  vehicleInfo?: string
}

export function VinDisplay({ vin, vehicleInfo }: VinDisplayProps) {
  const { copied, copy } = useClipboard()

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg border border-border">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">VIN</span>
        <span className="font-mono text-2xl text-foreground tracking-[0.2em]">{vin}</span>
        <button
          onClick={() => copy(vin)}
          className="p-1.5 text-muted-foreground hover:text-emerald-400 transition-colors"
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      {vehicleInfo && (
        <div className="text-sm text-muted-foreground">{vehicleInfo}</div>
      )}
    </div>
  )
}
