interface SparklineProps {
  data: { value: number }[]
  width?: number
  height?: number
  color?: string
  showFill?: boolean
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  color = "#10b981",
  showFill = true,
}: SparklineProps) {
  if (data.length === 0) return null

  const values = data.map(d => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      {showFill && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      {showFill && (
        <polygon
          fill={`url(#${gradientId})`}
          points={`0,${height} ${points} ${width},${height}`}
        />
      )}
    </svg>
  )
}
