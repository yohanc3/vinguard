interface TrustScoreRingProps {
  score: number
  size?: number
}

export function TrustScoreRing({ score, size = 140 }: TrustScoreRingProps) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2 - 4
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const center = size / 2

  function getColor() {
    if (score >= 80) return "#10b981"
    if (score >= 50) return "#f59e0b"
    return "#f43f5e"
  }

  function getTextColor() {
    if (score >= 80) return "text-emerald-400"
    if (score >= 50) return "text-amber-400"
    return "text-rose-400"
  }

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={`text-4xl font-bold font-mono ${getTextColor()}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground uppercase">Trust Score</span>
      </div>
    </div>
  )
}
