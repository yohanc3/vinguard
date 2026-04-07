"use client"

import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Car,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScrapeResult } from "@/components/new-report/new-report-page-types"

interface NewReportStepReviewCardProps {
  scrapeResult: ScrapeResult | null
  pdfFile: File | null
  createReportError: string | null
  createReportMutationIsPending: boolean
  handleCreateReport: () => void
  canProceedStep3: () => boolean
}

export function NewReportStepReviewCard({
  scrapeResult,
  pdfFile,
  createReportError,
  createReportMutationIsPending,
  handleCreateReport,
  canProceedStep3,
}: NewReportStepReviewCardProps) {
  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Review & Create Report</CardTitle>
            <CardDescription>
              Confirm your data and create your Vinguard Report
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary of collected data */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Listing Summary</h3>

          {scrapeResult && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg border border-border">
              <div>
                <span className="text-xs text-muted-foreground block">Price</span>
                <span className="text-lg font-semibold text-emerald-600">{scrapeResult.price ?? "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Mileage</span>
                <span className="text-lg font-semibold text-foreground">{scrapeResult.miles ?? "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground block">Photos</span>
                <span className="text-sm text-foreground">{scrapeResult.photos.length} images captured</span>
              </div>
              {scrapeResult.details && (
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Description</span>
                  <p className="text-sm text-foreground line-clamp-2">{scrapeResult.details}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg border border-border">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-foreground">{pdfFile?.name ?? "CarFax Report"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
          </div>
        </div>

        {/* Vinguard Report Explanation */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-lg border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-foreground">What is the Vinguard Report?</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your Vinguard Report is an AI-powered analysis that combines your listing data and CarFax report
            with real-time market research to give you:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Car className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-foreground"><strong>Deal Verdict</strong> — Clear recommendation on whether to buy</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-foreground"><strong>Market Comparison</strong> — How the price compares to KBB and market value</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardList className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span className="text-foreground"><strong>Action Checklist</strong> — Prioritized steps before purchasing</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground italic">
            The report will be generated in the background and typically takes 1-2 minutes.
          </p>
        </div>

        {createReportError && (
          <p className="text-sm text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {createReportError}
          </p>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreateReport}
          disabled={!canProceedStep3() || createReportMutationIsPending}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-6 text-lg"
        >
          {createReportMutationIsPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Report...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Create Vinguard Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
