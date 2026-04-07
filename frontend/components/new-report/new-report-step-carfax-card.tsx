"use client"

import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NewReportStepCarfaxCardProps {
  pdfFile: File | null
  carfaxText: string | null
  carReportKey: string | null
  isPdfPipelineBusy: boolean
  pdfError: string | null
  pdfUploadError: string | null
  handlePdfUpload: (file: File) => void
}

export function NewReportStepCarfaxCard({
  pdfFile,
  carfaxText,
  carReportKey,
  isPdfPipelineBusy,
  pdfError,
  pdfUploadError,
  handlePdfUpload,
}: NewReportStepCarfaxCardProps) {
  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Upload CarFax Report</CardTitle>
            <CardDescription>
              Upload your vehicle history report (CarFax, AutoCheck, etc.) as a PDF
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            pdfFile && carfaxText && carReportKey && !isPdfPipelineBusy
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-border hover:border-primary/50 bg-secondary/30"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handlePdfUpload(file)
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isPdfPipelineBusy}
          />

          {isPdfPipelineBusy ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              <p className="text-sm text-muted-foreground">
                {carfaxText ? "Uploading to secure storage..." : "Extracting text from PDF..."}
              </p>
            </div>
          ) : pdfFile && carfaxText && carReportKey ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-foreground">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {carfaxText.length.toLocaleString()} characters extracted
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Drop your PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports CarFax, AutoCheck, and similar reports</p>
              </div>
            </div>
          )}
        </div>

        {(pdfError || pdfUploadError) && (
          <p className="text-sm text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {pdfUploadError ?? pdfError}
          </p>
        )}

        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-300 flex items-start gap-3">
            <span className="text-blue-400 mt-0.5">ℹ</span>
            <span>
              Your CarFax report will be securely stored and used to extract vehicle history data.
              The AI will analyze it along with the listing to generate your Vinguard Report.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
