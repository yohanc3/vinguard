"use client"

import { Car, Loader2, Trash2 } from "lucide-react"
import type { PalantirCar } from "@/components/dashboard/dashboard-page-types"
import { getRiskLevel } from "@/components/dashboard/dashboard-page-types"

interface DashboardActiveReportRowProps {
  car: PalantirCar
  carId: string
  riskLevel: ReturnType<typeof getRiskLevel>
  deletingCarId: string | null
  onSelectReport: (reportId: string) => void
  onRequestDelete: (carId: string) => void
}

export function DashboardActiveReportRow({
  car,
  carId,
  riskLevel,
  deletingCarId,
  onSelectReport,
  onRequestDelete,
}: DashboardActiveReportRowProps) {
  const image = car.listingPictures?.[0] ?? ""

  return (
    <div
      onClick={function handleClick() { onSelectReport(carId) }}
      className="bg-card/50 border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden rounded-lg"
    >
      <div className="flex">
        <div className="relative w-45 h-45 flex-shrink-0 bg-secondary/50">
          {image ? (
            <img
              src={image}
              alt={`${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {car.year ?? ""} {car.make ?? "Unknown"} {car.model ?? ""}
              </h3>
              <p className="text-xs text-muted-foreground">{car.trim ?? "—"}</p>
            </div>
          </div>

          <p className="font-mono text-xs text-muted-foreground mb-3 tracking-wider">
            {car.vin ?? "VIN not available"}
          </p>

          <p className="text-sm text-zinc-400 mb-3 line-clamp-1">
            {riskLevel === "critical" ? (
              <span className="text-rose-400">
                {car.salvageRecord === "Yes" ? "Salvage record found" : "High risk detected"}
              </span>
            ) : riskLevel === "medium" ? (
              <span className="text-amber-400">Requires verification</span>
            ) : (
              <span className="text-primary">Clean history</span>
            )}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {car.listingPrice ? `$${car.listingPrice.toLocaleString()}` : "N/A"}
              </span>
              <span className="flex items-center gap-1">
                {car.listingMileage ? `${car.listingMileage} miles` : "- mi"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={function handleDelete(e) {
                  e.stopPropagation()
                  if (confirm("Are you sure you want to delete this report?")) {
                    onRequestDelete(carId)
                  }
                }}
                disabled={deletingCarId === carId}
                className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              >
                {deletingCarId === carId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
              <div className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
