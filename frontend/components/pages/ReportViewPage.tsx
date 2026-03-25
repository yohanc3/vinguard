"use client"

import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  FileText,
  TrendingDown,
  Wrench,
  Scale,
  AlertCircle,
  Info,
  Share2,
  Download,
  MessageSquare,
  Sparkles,
  Eye,
  Ban,
  Landmark,
} from "lucide-react"
import { Button } from "#/components/ui/button"
import { AppHeader } from "#/components/layout/app-header"
import { TrustScoreRing } from "#/components/report-view/trust-score-ring"
import { VerdictBanner } from "#/components/report-view/verdict-banner"
import { VinDisplay } from "#/components/report-view/vin-display"
import { ApiSectionCard } from "#/components/report-view/api-section-card"
import { PriceSlider } from "#/components/charts/price-slider"

const MOCK_REPORT_DATA = {
  vin: "1HGCM82633A123456",
  year: 2022,
  make: "Honda",
  model: "Accord",
  trim: "Sport 2.0T",
  trustScore: 23,
  verdict: "HIGH RISK - DO NOT PURCHASE",
  verdictType: "critical" as const,
  askingPrice: 28500,
  
  factoryBuild: {
    exterior: { claimed: "Crystal Black Pearl", actual: "Crystal Black Pearl", match: true },
    interior: { claimed: "Leather", actual: "Sport Cloth", match: false },
    engine: { claimed: "2.0T Turbo", actual: "2.0T Turbo", match: true },
    transmission: { claimed: "10-Speed AT", actual: "10-Speed AT", match: true },
    packages: { claimed: "Technology Package", actual: "Base Audio", match: false },
    wheels: { claimed: '19" Alloy', actual: '19" Alloy', match: true },
  },
  
  titleHistory: [
    { date: "2022-03-15", state: "CA", type: "Original Title", status: "clean", note: "First registration" },
    { date: "2023-01-22", state: "NV", type: "Title Transfer", status: "clean", note: "Private sale" },
    { date: "2023-08-10", state: "NV", type: "Salvage Title", status: "alert", note: "Total loss - flood damage" },
    { date: "2024-02-28", state: "AZ", type: "Rebuilt Title", status: "warning", note: "Rebuilt inspection passed" },
    { date: "2024-11-05", state: "CA", type: "Title Transfer", status: "warning", note: "Current - cross-state transfer" },
  ],
  
  phoneVerification: {
    number: "(415) 555-0147",
    carrier: "TextNow",
    carrierType: "VoIP/Non-Fixed",
    isHighRisk: true,
    lineAge: "12 days",
    spam_score: 72,
  },
  
  lienTheft: {
    lienStatus: "ACTIVE LIEN",
    lienholder: "Capital One Auto Finance",
    estimatedPayoff: 18420,
    policeReports: 0,
  },
  
  fairValue: {
    blackBookValue: 31200,
    askingPrice: 28500,
    priceDifference: -2700,
    percentBelow: 8.7,
    scamZone: { min: 0, max: 22000 },
    fairMarket: { min: 28000, max: 33000 },
    overpriced: { min: 35000, max: 50000 },
  },
  
  aiVibeCheck: {
    score: 34,
    redPhrases: ["cash only", "must sell today", "no lowballers", "firm on price", "as-is where-is"],
    yellowPhrases: ["recently moved", "out of state plates"],
    summary: "Listing contains multiple high-pressure sales tactics commonly associated with fraudulent vehicle sales. The combination of VoIP phone, salvage history, and aggressive language suggests elevated risk.",
  },
}

interface ReportViewPageProps {
  reportId: string
  onBack: () => void
}

export function ReportViewPage({ reportId, onBack }: ReportViewPageProps) {
  const report = MOCK_REPORT_DATA

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onBack={onBack} backLabel="Back to Dashboard">
        <Button variant="outline" size="sm" className="border-zinc-700 text-muted-foreground">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="border-zinc-700 text-muted-foreground">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </AppHeader>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <VinDisplay 
              vin={report.vin} 
              vehicleInfo={`${report.year} ${report.make} ${report.model} ${report.trim}`} 
            />
          </div>

          <div className="flex items-start gap-8">
            <TrustScoreRing score={report.trustScore} />
            <div className="flex-1">
              <VerdictBanner
                type={report.verdictType}
                verdict={report.verdict}
                description="This vehicle has significant red flags including salvage history, mismatched specifications, and suspicious seller behavior. We strongly advise against purchase."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApiSectionCard
            icon={Wrench}
            iconColor="text-blue-400"
            title="Factory Build"
            apiSource="MarketCheck API - Manufacturer Records"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground uppercase tracking-wider pb-2 border-b border-zinc-800">
                <span>Spec</span>
                <span>Seller Claims</span>
                <span>Factory Record</span>
              </div>
              {Object.entries(report.factoryBuild).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-zinc-800/50">
                  <span className="text-sm text-muted-foreground capitalize">{key}</span>
                  <span className="text-sm text-zinc-300">{value.claimed}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${value.match ? 'text-zinc-300' : 'text-rose-400 font-medium'}`}>
                      {value.actual}
                    </span>
                    {value.match ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ApiSectionCard>

          <ApiSectionCard
            icon={FileText}
            iconColor="text-purple-400"
            title="Title Status"
            apiSource="NMVTIS / Vitu - Title History"
          >
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-zinc-700" />
              {report.titleHistory.map((event, idx) => (
                <div key={idx} className="relative pb-6 last:pb-0">
                  <div className={`absolute left-[-18px] w-4 h-4 rounded-full border-2 ${
                    event.status === 'alert' 
                      ? 'bg-rose-500/20 border-rose-500' 
                      : event.status === 'warning'
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-emerald-500/20 border-emerald-500'
                  }`} />
                  <div className="ml-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{event.date}</span>
                      <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-muted-foreground">{event.state}</span>
                    </div>
                    <p className={`text-sm font-medium ${
                      event.status === 'alert' ? 'text-rose-400' 
                      : event.status === 'warning' ? 'text-amber-400'
                      : 'text-zinc-300'
                    }`}>
                      {event.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </ApiSectionCard>

          <ApiSectionCard
            icon={Phone}
            iconColor={report.phoneVerification.isHighRisk ? "text-rose-400" : "text-emerald-400"}
            title="Phone Carrier Lookup"
            apiSource="Twilio API - Seller Verification"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-sm text-muted-foreground">Phone Number</span>
                <span className="font-mono text-foreground">{report.phoneVerification.number}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-sm text-muted-foreground">Carrier</span>
                <span className="text-zinc-300">{report.phoneVerification.carrier}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-sm text-muted-foreground">Carrier Type</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.phoneVerification.isHighRisk 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {report.phoneVerification.carrierType}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-sm text-muted-foreground">Line Age</span>
                <span className="text-amber-400">{report.phoneVerification.lineAge}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Spam Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${report.phoneVerification.spam_score}%` }} />
                  </div>
                  <span className="text-rose-400 font-mono text-sm">{report.phoneVerification.spam_score}%</span>
                </div>
              </div>
              
              {report.phoneVerification.isHighRisk && (
                <div className="flex items-start gap-3 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-300">
                    VoIP numbers are commonly used in vehicle scams as they are disposable and untraceable. Exercise extreme caution.
                  </p>
                </div>
              )}
            </div>
          </ApiSectionCard>

          <ApiSectionCard
            icon={Landmark}
            iconColor="text-amber-400"
            title="Lien & Theft Check"
            apiSource="OneAutoAPI - Financial & Police Records"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-400">Police & Theft Clearance</p>
                    <p className="text-xs text-muted-foreground">{report.lienTheft.policeReports} police reports found</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-400">{report.lienTheft.lienStatus}</p>
                    <p className="text-sm text-muted-foreground">{report.lienTheft.lienholder}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-zinc-800">
                <span className="text-sm text-muted-foreground">Estimated Payoff Amount</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  ${report.lienTheft.estimatedPayoff.toLocaleString()}
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  An active lien means the seller does not fully own this vehicle. Purchase requires coordinating payoff with the lienholder directly.
                </p>
              </div>
            </div>
          </ApiSectionCard>

          <ApiSectionCard
            icon={Scale}
            iconColor="text-emerald-400"
            title="Fair Value Analysis"
            apiSource="Black Book API - Price Realism Check"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Asking Price</p>
                <p className="text-2xl font-bold font-mono text-foreground">
                  ${report.fairValue.askingPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Black Book Value</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  ${report.fairValue.blackBookValue.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Difference</p>
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                  <p className="text-2xl font-bold font-mono text-emerald-400">
                    ${Math.abs(report.fairValue.priceDifference).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-emerald-400">{report.fairValue.percentBelow}% below market</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">Price Positioning</p>
              <PriceSlider
                askingPrice={report.fairValue.askingPrice}
                marketValue={report.fairValue.blackBookValue}
                scamZone={report.fairValue.scamZone}
                fairMarket={report.fairValue.fairMarket}
                overpriced={report.fairValue.overpriced}
              />
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                While the price appears fair, <strong>this vehicle has a salvage title</strong>. Salvage vehicles typically sell for 20-40% below market value. At this price point, you may be overpaying for a salvage vehicle.
              </p>
            </div>
          </ApiSectionCard>

          <ApiSectionCard
            icon={Sparkles}
            iconColor="text-purple-400"
            title="AI Vibe Check"
            apiSource="NLP Sentiment Analysis - Listing Language Review"
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-end gap-2 -mt-4 mb-4">
              <span className="text-sm text-muted-foreground">Suspicion Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                report.aiVibeCheck.score < 40 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : report.aiVibeCheck.score < 70
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {report.aiVibeCheck.score}/100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-400" />
                  High-Pressure Language Detected
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.aiVibeCheck.redPhrases.map((phrase, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-sm font-mono border border-rose-500/30"
                    >
                      &quot;{phrase}&quot;
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Phrases Worth Noting
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.aiVibeCheck.yellowPhrases.map((phrase, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-mono border border-amber-500/30"
                    >
                      &quot;{phrase}&quot;
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg border border-zinc-700">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-1">AI Analysis Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {report.aiVibeCheck.summary}
                  </p>
                </div>
              </div>
            </div>
          </ApiSectionCard>
        </div>
      </main>
    </div>
  )
}
