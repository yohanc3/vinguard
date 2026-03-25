import { Loader2, ScanLine } from "lucide-react"
import { Card, CardContent } from "#/components/ui/card"
import { Progress } from "#/components/ui/progress"

interface ScanningOverlayProps {
  progress: number
  stage: string
  apis?: string[]
}

export function ScanningOverlay({ progress, stage, apis = [] }: ScanningOverlayProps) {
  return (
    <Card className="bg-card/95 border-emerald-500/30 backdrop-blur-xl">
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-zinc-700 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <ScanLine className="w-12 h-12 text-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="w-full max-w-md mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Initializing Vinguard Scan...</span>
              <span className="font-mono text-emerald-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} variant="success" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-mono">{stage}</span>
          </div>

          {apis.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {apis.map((api, idx) => (
                <div
                  key={api}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                    progress > (idx + 1) * (100 / apis.length)
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : "bg-zinc-800 border-zinc-700 text-muted-foreground"
                  }`}
                >
                  {api}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
