"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  AlertTriangle,
  Plus,
  Search,
  LogOut,
  Zap,
  Activity,
  Loader2,
  Car,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppLogo } from "@/components/layout/app-logo"
import { DashboardActiveReportRow } from "@/components/dashboard/dashboard-active-report-row"
import type { DashboardPageProps, PalantirCar } from "@/components/dashboard/dashboard-page-types"
import { getRiskLevel } from "@/components/dashboard/dashboard-page-types"
import { useTRPC } from "@/lib/trpc"

export function DashboardPage({ onLogout, onSelectReport, onNewReport }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "critical" | "pending">("all")
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null)

  const trpc = useTRPC()
  const carsQuery = useQuery(trpc.cars.list.queryOptions())

  const deleteMutation = useMutation({
    ...trpc.cars.delete.mutationOptions(),
    onSuccess: function() {
      carsQuery.refetch()
      setDeletingCarId(null)
    },
  })

  const cars = (carsQuery.data?.data ?? []) as PalantirCar[]

    console.log("cars", cars)

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
                  className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Active Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">Your ongoing vehicle investigations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "outline" : "ghost"}
              size="sm"
              className={filter === "all" ? "border-border text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"}
              onClick={function handleAllFilter() { setFilter("all") }}
            >
              <Activity className="w-4 h-4 mr-2" />
              All
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

              return (
                <DashboardActiveReportRow
                  key={carId}
                  car={car}
                  carId={carId}
                  riskLevel={riskLevel}
                  deletingCarId={deletingCarId}
                  onSelectReport={onSelectReport}
                  onRequestDelete={function handleRequestDelete(id) {
                    setDeletingCarId(id)
                    deleteMutation.mutate({ id })
                  }}
                />
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
