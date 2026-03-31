"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  ChevronLeft, 
  ChevronRight, 
  FileQuestion, 
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/lib/trpc"
import { CarChatPanel } from "@/components/chat/car-chat-panel"

interface ReportViewPageProps {
  reportId: string
  onBack: () => void
}

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
  listingDetails?: string[]
  listingPictures?: string[]
  odometerReadings?: number[]
  titleStatus?: string
  salvageRecord?: string
  floodDamageHistory?: string
  fairMarketValueHigh?: number
  fairMarketValueLow?: number
  carReport?: string
  numberOfPreviousOwners?: number
  stateOfRegistration?: string
}

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ defaultValue, children, className = "" }: { 
  defaultValue: string
  children: React.ReactNode
  className?: string 
}) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex gap-1 bg-secondary/50 p-1 rounded-lg ${className}`}>
      {children}
    </div>
  )
}

function TabsTrigger({ value, children, className = "" }: { 
  value: string
  children: React.ReactNode
  className?: string 
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  const isActive = context.activeTab === value
  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, children, className = "" }: { 
  value: string
  children: React.ReactNode
  className?: string 
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  if (context.activeTab !== value) return null
  return <div className={className}>{children}</div>
}

function SpecBadge({ label, value, highlight = false }: { 
  label: string
  value: string
  highlight?: boolean 
}) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
      highlight 
        ? 'bg-emerald-500/10 border border-emerald-500/20' 
        : 'bg-secondary/50 border border-border'
    }`}>
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <span className={`text-[11px] font-semibold ${highlight ? 'text-emerald-500' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}

export function ReportViewPage({ reportId, onBack }: ReportViewPageProps) {
  const trpc = useTRPC()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activePdfKey, setActivePdfKey] = useState<string | null>(null)
  const [vinCopied, setVinCopied] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const carQuery = useQuery(trpc.cars.getById.queryOptions({ id: reportId }))
  const car = carQuery.data as PalantirCar | undefined

  const pdfDownloadUrlQuery = useQuery({
    ...trpc.files.getPresignedDownloadUrl.queryOptions({ key: activePdfKey ?? "" }),
    enabled: Boolean(activePdfKey),
  })

  useEffect(function syncPdfKey() {
    if (car?.carReport) {
      setActivePdfKey(car.carReport)
    } else {
      setActivePdfKey(null)
    }
  }, [car])

  function copyVin() {
    if (car?.vin) {
      navigator.clipboard.writeText(car.vin)
      setVinCopied(true)
      setTimeout(() => setVinCopied(false), 2000)
    }
  }

  if (carQuery.isPending) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading vehicle report...</p>
        </main>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="inline-flex p-4 bg-secondary/50 rounded-full mb-4">
            <FileQuestion className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Report not found</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
            This report does not exist or has not been loaded yet.
          </p>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </main>
      </div>
    )
  }

  const carTitle = `${car.year ? String(car.year) + " " : ""}${car.make ?? "Vehicle"} ${car.model ?? ""}`
  const images = car.listingPictures ?? []

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Main Content Area - Two Column Layout */}
      <div className="flex-1 max-w-[1800px] mx-auto w-full flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Collapsible Tabbed Images/PDF */}
        <div className={`flex-shrink-0 lg:border-r border-border flex flex-col bg-card/30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-0 lg:w-10 overflow-hidden' : 'w-full lg:w-[380px] xl:w-[480px] h-[280px] lg:h-auto'
        }`}>
          {/* Collapsed state - just show expand button */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex items-center justify-center w-10 h-full hover:bg-secondary/50 transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Expanded sidebar content */}
          {!sidebarCollapsed && (
            <>
              {/* Header with back button + vehicle info */}
              <div className="px-3 py-2.5 border-b border-border bg-secondary/30 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <div className="h-3 w-px bg-border" />
                  <h1 className="text-xs font-semibold text-foreground truncate flex-1">{carTitle}</h1>
                  {car.salvageRecord === "Yes" && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-destructive/10 text-destructive text-[10px] font-semibold rounded border border-destructive/20">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Salvage
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <SpecBadge label="Price" value={car.listingPrice ? `$${car.listingPrice.toLocaleString()}` : "N/A"} highlight />
                  <SpecBadge label="Miles" value={car.listingMileage ?? "N/A"} />
                  <SpecBadge label="Title" value={car.titleStatus ?? "N/A"} />
                  {car.numberOfPreviousOwners && (
                    <SpecBadge label="Owners" value={car.numberOfPreviousOwners.toString()} />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-muted-foreground">VIN:</span>
                  <code className="text-[11px] font-mono text-foreground bg-secondary px-1 py-0.5 rounded tracking-wider">{car.vin ?? "N/A"}</code>
                  <button 
                    onClick={copyVin}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copy VIN"
                  >
                    {vinCopied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Tabs with collapse button */}
              <Tabs defaultValue="photos" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border bg-secondary/30 flex-shrink-0 flex items-center gap-2">
                  <TabsList className="flex-1">
                    <TabsTrigger value="photos" className="flex-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Photos
                      {images.length > 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 rounded-full">
                          {images.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="report" className="flex-1">
                      <FileText className="w-3.5 h-3.5" />
                      Report
                    </TabsTrigger>
                  </TabsList>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden lg:flex items-center justify-center w-17 h-10 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Photos Tab */}
                <TabsContent value="photos" className="flex-1 flex flex-col m-0 overflow-hidden">
                  {images.length > 0 ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Main Image */}
                      <div className="relative flex-1 min-h-0 bg-secondary/20">
                        <img
                          src={images[activeImageIndex]}
                          alt={`${carTitle} - Image ${activeImageIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setActiveImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full transition-all shadow-lg border border-border"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-4 h-4 text-foreground" />
                            </button>
                            <button
                              onClick={() => setActiveImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full transition-all shadow-lg border border-border"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-4 h-4 text-foreground" />
                            </button>
                          </>
                        )}
                        {/* Image Counter */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground border border-border">
                          {activeImageIndex + 1} / {images.length}
                        </div>
                      </div>
                      
                      {/* Thumbnail Strip */}
                      {images.length > 1 && (
                        <div className="p-2 border-t border-border bg-secondary/20 flex-shrink-0">
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`relative w-12 h-9 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                                  idx === activeImageIndex 
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                                    : 'border-transparent hover:border-muted-foreground/30'
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-8">
                      <ImageIcon className="w-10 h-10 opacity-20" />
                      <span className="text-sm">No photos available</span>
                    </div>
                  )}
                </TabsContent>
                
                {/* Report Tab */}
                <TabsContent value="report" className="flex-1 m-0 flex flex-col overflow-hidden">
                  {activePdfKey && pdfDownloadUrlQuery.data?.url ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="px-3 py-1.5 border-b border-border bg-secondary/20 flex items-center justify-between flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground font-medium">Vehicle History Report</span>
                        <a 
                          href={pdfDownloadUrlQuery.data.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-500 hover:underline font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          Open Full
                        </a>
                      </div>
                      <div className="flex-1 bg-secondary/10 min-h-0">
                        <iframe
                          src={pdfDownloadUrlQuery.data.url}
                          className="w-full h-full border-none"
                          title="Vehicle History Report PDF"
                        />
                      </div>
                    </div>
                  ) : pdfDownloadUrlQuery.isPending ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
                      <Loader2 className="w-6 h-6 animate-spin opacity-40" />
                      <p className="text-xs">Loading report...</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-8">
                      <FileText className="w-10 h-10 opacity-20" />
                      <span className="text-sm">No report available</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Right Panel: AI Chat (Main Focus) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CarChatPanel
              carId={car.id ?? car.__primaryKey ?? ""}
              carContext={{
                vin: car.vin ?? null,
                make: car.make ?? null,
                model: car.model ?? null,
                year: car.year ?? null,
                trim: car.trim ?? null,
                listingMileage: car.listingMileage ?? null,
                listingPrice: car.listingPrice ?? null,
                listingDetails: car.listingDetails ?? null,
                odometerReadings: car.odometerReadings ?? null,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
