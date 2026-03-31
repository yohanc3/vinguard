"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  MapPin,
  Zap,
  Activity,
  Target,
  BarChart3,
  Loader2,
  Car,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppLogo } from "@/components/layout/app-logo"
import { Sparkline } from "@/components/charts/sparkline"
import { CircularGauge } from "@/components/charts/circular-gauge"
import { MetricCard } from "@/components/dashboard/metric-card"
import { useTRPC } from "@/lib/trpc"

interface PalantirCar {
  __primaryKey?: string
  id?: string
  vin?: string
  make?: string
  model?: string
  year?: number
  trim?: string
  listingPrice?: number
  listingMileage?: string
  listingPictures?: string[]
  titleStatus?: string
  salvageRecord?: string
  numberOfPreviousOwners?: number
  carReport?: string
}

const SPARKLINE_DATA = [
  { value: 100 }, { value: 102 }, { value: 98 },
  { value: 103 }, { value: 107 }, { value: 105 },
  { value: 110 }, { value: 108 }, { value: 112 },
  { value: 115 },
]

interface DashboardPageProps {
  onLogout: () => void
  onSelectReport: (reportId: string) => void
  onNewReport: () => void
}

function getRiskLevel(car: PalantirCar): "critical" | "medium" | "low" {
  if (car.salvageRecord === "Yes") return "critical"
  if (car.titleStatus && car.titleStatus.toLowerCase().includes("salvage")) return "critical"
  if (car.titleStatus && car.titleStatus.toLowerCase().includes("rebuilt")) return "medium"
  return "low"
}

function getRiskScore(car: PalantirCar): number {
  const level = getRiskLevel(car)
  if (level === "critical") return 23
  if (level === "medium") return 67
  return 91
}

export function DashboardPage({ onLogout, onSelectReport, onNewReport }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "critical" | "pending">("all")
  
  const trpc = useTRPC()
  const carsQuery = useQuery(trpc.cars.list.queryOptions())
  
  const cars = (carsQuery.data?.data ?? []) as PalantirCar[]
  
  const filteredCars = cars.filter(function filterCar(car) {
    const matchesSearch = searchQuery.trim() === "" || 
      (car.vin?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.make?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.model?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!matchesSearch) return false
    
    if (filter === "critical") {
      return getRiskLevel(car) === "critical"
    }
    
    return true
  })
  
  const totalAtRisk = cars.reduce(function sumPrices(acc, car) {
    return acc + (car.listingPrice ?? 0)
  }, 0)
  
  const criticalCount = cars.filter(function countCritical(car) {
    return getRiskLevel(car) === "critical"
  }).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AppLogo size="sm" />

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by VIN, make, model..."
                  value={searchQuery}
                  onChange={function handleSearchChange(e) { setSearchQuery(e.target.value) }}
                  className="pl-10 bg-secondary/50 border-zinc-700 text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={onNewReport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Report
              </Button>
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-muted-foreground hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={BarChart3}
            title="Market Watch"
            badge={
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.2%
              </span>
            }
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Accord 2022 Avg</p>
                <p className="text-2xl font-bold font-mono text-foreground">$31,240</p>
              </div>
              <Sparkline data={SPARKLINE_DATA} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">30-day price trend for tracked models</p>
          </MetricCard>

          <MetricCard
            icon={Target}
            title="Scam Radar"
            badge={
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                Elevated
              </span>
            }
          >
            <div className="flex items-center justify-between">
              <CircularGauge 
                value={47} 
                showLabel 
                label="FLAGS"
                thresholds={{ warning: 60, danger: 30 }}
              />
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-end gap-1">
                  <MapPin className="w-3 h-3" />
                  San Francisco, CA
                </p>
                <p className="text-sm text-zinc-300">Active scam listings in your area</p>
                <p className="text-xs text-muted-foreground mt-1">Updated 5 min ago</p>
              </div>
            </div>
          </MetricCard>

          <MetricCard
            icon={DollarSign}
            title="Savings at Risk"
            badge={<span className="text-xs text-muted-foreground">{cars.length} active</span>}
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold font-mono text-foreground">
                  ${totalAtRisk.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total value being vetted</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{criticalCount} Critical</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Require attention</p>
              </div>
            </div>
          </MetricCard>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Active Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">Your ongoing vehicle investigations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={filter === "all" ? "outline" : "ghost"} 
              size="sm" 
              className={filter === "all" ? "border-zinc-700 text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"}
              onClick={function handleAllFilter() { setFilter("all") }}
            >
              <Activity className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button 
              variant={filter === "critical" ? "outline" : "ghost"} 
              size="sm" 
              className={filter === "critical" ? "border-zinc-700 text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"}
              onClick={function handleCriticalFilter() { setFilter("critical") }}
            >
              Critical
            </Button>
          </div>
        </div>

        {carsQuery.isPending ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : carsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
            <p className="text-muted-foreground">Failed to load reports</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={function handleRetry() { carsQuery.refetch() }}
            >
              Retry
            </Button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Car className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? "No reports match your search" : "No reports yet"}
            </p>
            <Button 
              onClick={onNewReport}
              className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Report
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCars.map(function renderCarCard(car) {
              const carId = car.id ?? car.__primaryKey ?? ""
              const riskLevel = getRiskLevel(car)
              const riskScore = getRiskScore(car)
              const image = car.listingPictures?.[0] ?? ""
              
              return (
                <div
                  key={carId}
                  onClick={function handleClick() { onSelectReport(carId) }}
                  className="bg-card/50 border border-border hover:border-zinc-600 transition-all duration-300 cursor-pointer group overflow-hidden rounded-lg"
                >
                  <div className="flex">
                    <div className="relative w-40 h-40 flex-shrink-0 bg-secondary/50">
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
                          <h3 className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                            {car.year ?? ""} {car.make ?? "Unknown"} {car.model ?? ""}
                          </h3>
                          <p className="text-xs text-muted-foreground">{car.trim ?? "—"}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          riskLevel === "critical" 
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : riskLevel === "medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {riskScore}
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
                          <span className="text-emerald-400">Clean history</span>
                        )}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {car.listingPrice ? `$${car.listingPrice.toLocaleString()}` : "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            {car.listingMileage ?? "— mi"}
                          </span>
                        </div>
                        <div className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={onNewReport}
          className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/25 flex items-center justify-center text-white transition-all hover:scale-110 group"
        >
          <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </main>
    </div>
  )
}
