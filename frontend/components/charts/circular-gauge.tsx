interface CircularGaugeProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  thresholds?: { warning: number; danger: number }
  showLabel?: boolean
  label?: string
}

export function CircularGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  thresholds = { warning: 50, danger: 30 },
  showLabel = false,
  label,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / max) * circumference
  const center = size / 2

  function getColor() {
    const percentage = (value / max) * 100
    if (percentage <= thresholds.danger) return "#f43f5e"
    if (percentage <= thresholds.warning) return "#f59e0b"
    return "#10b981"
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
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
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
            {label && <p className="text-[10px] text-muted-foreground uppercase">{label}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
