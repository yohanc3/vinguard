"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { AppLogo } from "#/components/layout/app-logo"
import { Sparkline } from "#/components/charts/sparkline"
import { CircularGauge } from "#/components/charts/circular-gauge"
import { MetricCard } from "#/components/dashboard/metric-card"
import { ReportCard } from "#/components/dashboard/report-card"

const MOCK_REPORTS = [
  {
    id: "RPT-001",
    vin: "1HGCM82633A123456",
    year: 2022,
    make: "Honda",
    model: "Accord",
    trim: "Sport 2.0T",
    riskLevel: "critical" as const,
    riskScore: 23,
    redFlags: 3,
    status: "complete",
    summary: "Salvage title found, odometer discrepancy",
    askingPrice: 28500,
    marketValue: 31200,
    lastUpdated: "2 hours ago",
    image: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=400&h=250&fit=crop",
  },
  {
    id: "RPT-002",
    vin: "5YJ3E1EA7MF123456",
    year: 2023,
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range",
    riskLevel: "low" as const,
    riskScore: 91,
    redFlags: 0,
    status: "complete",
    summary: "All records match, clean history",
    askingPrice: 42000,
    marketValue: 43500,
    lastUpdated: "5 hours ago",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop",
  },
  {
    id: "RPT-003",
    vin: "WVWZZZ3CZWE123456",
    year: 2021,
    make: "Volkswagen",
    model: "Golf GTI",
    trim: "Autobahn",
    riskLevel: "medium" as const,
    riskScore: 67,
    redFlags: 1,
    status: "verifying",
    summary: "Pending lien verification",
    askingPrice: 29900,
    marketValue: 28500,
    lastUpdated: "1 hour ago",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: "RPT-004",
    vin: "JN1TANT31U0123456",
    year: 2020,
    make: "Nissan",
    model: "GT-R",
    trim: "Premium",
    riskLevel: "low" as const,
    riskScore: 88,
    redFlags: 0,
    status: "complete",
    summary: "Clean title, single owner",
    askingPrice: 89000,
    marketValue: 92000,
    lastUpdated: "1 day ago",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop",
  },
]

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

export function DashboardPage({ onLogout, onSelectReport, onNewReport }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const totalAtRisk = MOCK_REPORTS.reduce((acc, r) => acc + r.askingPrice, 0)
  const criticalCount = MOCK_REPORTS.filter(r => r.riskLevel === "critical").length

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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            badge={<span className="text-xs text-muted-foreground">{MOCK_REPORTS.length} active</span>}
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
            <Button variant="outline" size="sm" className="border-zinc-700 text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Activity className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Critical
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Pending
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_REPORTS.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => onSelectReport(report.id)}
            />
          ))}
        </div>

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
