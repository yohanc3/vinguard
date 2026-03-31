"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/pages/LoginPage"
import { DashboardPage } from "@/components/pages/DashboardPage"
import { ReportViewPage } from "@/components/pages/ReportViewPage"
import { NewReportPage } from "@/components/pages/NewReportPage"

type AppView = "login" | "dashboard" | "report" | "new-report"

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("login")
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(function checkExistingAuth() {
    const token = localStorage.getItem("token")
    if (token) {
      setCurrentView("dashboard")
    }
    setIsCheckingAuth(false)
  }, [])

  function handleLogin() {
    setCurrentView("dashboard")
  }

  function handleLogout() {
    localStorage.removeItem("token")
    setCurrentView("login")
    setSelectedReportId(null)
  }

  function handleSelectReport(reportId: string) {
    setSelectedReportId(reportId)
    setCurrentView("report")
  }

  function handleNewReport() {
    setCurrentView("new-report")
  }

  function handleBackToDashboard() {
    setCurrentView("dashboard")
    setSelectedReportId(null)
  }

  function handleReportComplete(reportId: string) {
    setSelectedReportId(reportId)
    setCurrentView("report")
  }

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {currentView === "login" && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentView === "dashboard" && (
        <DashboardPage
          onLogout={handleLogout}
          onSelectReport={handleSelectReport}
          onNewReport={handleNewReport}
        />
      )}
      
      {currentView === "report" && selectedReportId && (
        <ReportViewPage
          reportId={selectedReportId}
          onBack={handleBackToDashboard}
        />
      )}
      
      {currentView === "new-report" && (
        <NewReportPage
          onBack={handleBackToDashboard}
          onComplete={handleReportComplete}
        />
      )}
    </main>
  )
}
