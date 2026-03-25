interface PriceRange {
  min: number
  max: number
}

interface PriceSliderProps {
  askingPrice: number
  marketValue: number
  scamZone: PriceRange
  fairMarket: PriceRange
  overpriced: PriceRange
  maxRange?: number
}

export function PriceSlider({
  askingPrice,
  marketValue,
  scamZone,
  fairMarket,
  overpriced,
  maxRange = 50000,
}: PriceSliderProps) {
  function getPosition(value: number) {
    return (value / maxRange) * 100
  }

  return (
    <div className="space-y-2">
      <div className="relative h-8 mt-4">
        <div className="absolute inset-x-0 top-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-rose-500/30"
            style={{ left: "0%", width: `${getPosition(scamZone.max)}%` }}
          />
          <div
            className="absolute h-full bg-emerald-500/30"
            style={{
              left: `${getPosition(fairMarket.min)}%`,
              width: `${getPosition(fairMarket.max - fairMarket.min)}%`,
            }}
          />
          <div
            className="absolute h-full bg-amber-500/30"
            style={{
              left: `${getPosition(overpriced.min)}%`,
              width: `${getPosition(overpriced.max - overpriced.min)}%`,
            }}
          />
        </div>

        <div
          className="absolute top-0 w-0.5 h-8 bg-white"
          style={{ left: `${getPosition(askingPrice)}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-white">
              ${askingPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className="absolute top-0 w-0.5 h-8 bg-emerald-400"
          style={{ left: `${getPosition(marketValue)}%` }}
        >
          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-emerald-400">
              ${marketValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8 text-xs">
        <span className="text-rose-400">Scam Zone</span>
        <span className="text-emerald-400">Fair Market</span>
        <span className="text-amber-400">Overpriced</span>
      </div>
    </div>
  )
}
