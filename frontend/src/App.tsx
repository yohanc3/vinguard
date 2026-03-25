"use client"

import { useState } from "react"
import { LoginPage } from "#/components/pages/LoginPage"
import { DashboardPage } from "#/components/pages/DashboardPage"
import { ReportViewPage } from "#/components/pages/ReportViewPage"
import { NewReportPage } from "#/components/pages/NewReportPage"

type AppView = "login" | "dashboard" | "report" | "new-report"

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("login")
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  function handleLogin() {
    setCurrentView("dashboard")
  }

  function handleLogout() {
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
