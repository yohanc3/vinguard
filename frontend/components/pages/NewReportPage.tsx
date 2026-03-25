"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Link2,
  Hash,
  FileText,
  Camera,
  CheckCircle2,
  Zap,
  Globe,
  Search,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { AppHeader } from "#/components/layout/app-header"
import { StepIndicator } from "#/components/new-report/step-indicator"
import { ScanningOverlay } from "#/components/new-report/scanning-overlay"
import { useUrlValidation } from "#/hooks/use-url-validation"
import { useVinValidation } from "#/hooks/use-vin-validation"

interface NewReportPageProps {
  onBack: () => void
  onComplete: (reportId: string) => void
}

type Step = 1 | 2 | 3

const STEPS = [
  { number: 1, label: "Listing URL" },
  { number: 2, label: "Enter VIN" },
  { number: 3, label: "Description" },
]

const SCAN_STAGES = [
  "Connecting to NMVTIS database...",
  "Querying manufacturer records...",
  "Verifying title history...",
  "Analyzing phone carrier data...",
  "Checking lien and theft records...",
  "Running AI sentiment analysis...",
  "Calculating fair market value...",
  "Generating trust score...",
  "Compiling final report...",
]

const SCAN_APIS = ["NMVTIS", "MarketCheck", "Twilio", "OneAutoAPI", "Black Book", "NLP Engine"]

export function NewReportPage({ onBack, onComplete }: NewReportPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStage, setScanStage] = useState("")
  
  const [listingUrl, setListingUrl] = useState("")
  const [vin, setVin] = useState("")
  const [sellerDescription, setSellerDescription] = useState("")
  
  const { isValid: urlValid } = useUrlValidation(listingUrl)
  const { isValid: vinValid, error: vinError } = useVinValidation(vin)

  function startScan() {
    setIsScanning(true)
    setScanProgress(0)
    
    let currentStageIdx = 0
    setScanStage(SCAN_STAGES[0])

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + (100 / 30)
        
        const newStageIdx = Math.min(
          Math.floor((next / 100) * SCAN_STAGES.length),
          SCAN_STAGES.length - 1
        )
        if (newStageIdx !== currentStageIdx) {
          currentStageIdx = newStageIdx
          setScanStage(SCAN_STAGES[newStageIdx])
        }
        
        if (next >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            setIsScanning(false)
            onComplete("RPT-NEW-001")
          }, 500)
          return 100
        }
        return next
      })
    }, 100)
  }

  function canProceed() {
    switch (currentStep) {
      case 1:
        return urlValid === true
      case 2:
        return vinValid === true
      case 3:
        return sellerDescription.length >= 20
      default:
        return false
    }
  }

  function nextStep() {
    if (currentStep < 3) setCurrentStep((currentStep + 1) as Step)
  }

  function prevStep() {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onBack={onBack} backLabel="Cancel" title="New Report" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {isScanning ? (
          <ScanningOverlay progress={scanProgress} stage={scanStage} apis={SCAN_APIS} />
        ) : (
          <>
            {currentStep === 1 && (
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Link2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Paste Listing URL</CardTitle>
                      <CardDescription>
                        Enter the URL of the vehicle listing from Facebook Marketplace, Craigslist, or other platforms
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={listingUrl}
                        onChange={(e) => setListingUrl(e.target.value)}
                        placeholder="https://www.facebook.com/marketplace/item/..."
                        className={`pl-12 pr-12 h-14 bg-secondary/50 border-zinc-700 text-foreground placeholder:text-muted-foreground font-mono text-sm ${
                          urlValid === true
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : urlValid === false
                            ? "border-rose-500/50 focus:border-rose-500"
                            : "focus:border-zinc-600"
                        }`}
                      />
                      {urlValid !== null && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {urlValid ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {urlValid === false && (
                      <p className="text-sm text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Please enter a valid listing URL from a supported platform
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Supported Platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {["Facebook Marketplace", "Craigslist", "Cars.com", "AutoTrader", "CarGurus"].map((platform) => (
                        <div
                          key={platform}
                          className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg border border-zinc-700"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-muted-foreground">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setListingUrl("https://www.facebook.com/marketplace/item/123456789012345/")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Demo: Auto-fill example URL
                  </button>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Hash className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Enter VIN</CardTitle>
                      <CardDescription>
                        The 17-character Vehicle Identification Number found on the dashboard or door jamb
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="1HGCM82633A123456"
                        maxLength={17}
                        className={`pl-12 pr-12 h-14 bg-secondary/50 border-zinc-700 text-foreground placeholder:text-muted-foreground font-mono text-lg tracking-[0.15em] uppercase ${
                          vinValid === true
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : vinValid === false
                            ? "border-rose-500/50 focus:border-rose-500"
                            : "focus:border-zinc-600"
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{vin.length}/17</span>
                        {vinValid !== null && (
                          vinValid ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          )
                        )}
                      </div>
                    </div>

                    {vinValid === false && vin.length > 0 && vinError && (
                      <p className="text-sm text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {vinError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg border border-zinc-700">
                    <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Scan VIN from Photo
                    </Button>
                    <div className="flex-1 text-sm text-muted-foreground">
                      Take a photo of the VIN plate and we&apos;ll extract it automatically
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-300 flex items-start gap-3">
                      <span className="text-blue-400 mt-0.5">ℹ</span>
                      <span>
                        The VIN is typically found on the driver&apos;s side dashboard (visible through the windshield) 
                        or on a sticker inside the driver&apos;s door jamb. Never trust VIN photos from the seller alone.
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => setVin("1HGCM82633A123456")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Demo: Auto-fill example VIN
                  </button>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <FileText className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Paste Seller&apos;s Description</CardTitle>
                      <CardDescription>
                        Copy and paste the full listing description for AI analysis of red flags
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Textarea
                      value={sellerDescription}
                      onChange={(e) => setSellerDescription(e.target.value)}
                      placeholder="Paste the full listing description here..."
                      rows={8}
                      className="bg-secondary/50 border-zinc-700 text-foreground placeholder:text-muted-foreground resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {sellerDescription.length} characters
                        {sellerDescription.length < 20 && sellerDescription.length > 0 && (
                          <span className="text-amber-400 ml-2">(minimum 20 characters)</span>
                        )}
                      </p>
                      {sellerDescription.length >= 20 && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready for analysis
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Our AI Scans For</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "High-pressure tactics",
                        "Inconsistent claims",
                        "Red flag keywords",
                        "Price manipulation",
                        "Urgency language",
                        "Contact avoidance",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSellerDescription("2022 Honda Accord Sport 2.0T. Clean title, no accidents. Leather interior, technology package. Must sell today - need to move urgently. Cash only, no lowballers. Price is firm. As-is where-is. Recently moved from Nevada, still has out of state plates. Don't waste my time with questions, serious buyers only.")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Demo: Auto-fill suspicious listing
                  </button>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={startScan}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Initialize Vinguard Scan
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
