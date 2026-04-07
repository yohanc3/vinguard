"use client"

import type { Dispatch, SetStateAction } from "react"
import {
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Image as ImageIcon,
    FileText,
    ExternalLink,
    Copy,
    Check,
    ArrowLeft,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { PalantirCar } from "@/components/report-view/report-view-page-types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/report-view/report-view-tabs"
import { SpecBadge } from "@/components/report-view/report-spec-badge"

interface ReportViewMediaSidebarProps {
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
    onBack: () => void
    car: PalantirCar
    carTitle: string
    isListingDataLoading: boolean
    images: string[]
    activeImageIndex: number
    setActiveImageIndex: Dispatch<SetStateAction<number>>
    copyVin: () => void
    vinCopied: boolean
    activePdfKey: string | null
    pdfUrl: string | undefined
    isPdfUrlLoading: boolean
}

export function ReportViewMediaSidebar({
    sidebarCollapsed,
    setSidebarCollapsed,
    onBack,
    car,
    carTitle,
    isListingDataLoading,
    images,
    activeImageIndex,
    setActiveImageIndex,
    copyVin,
    vinCopied,
    activePdfKey,
    pdfUrl,
    isPdfUrlLoading,
}: ReportViewMediaSidebarProps) {
    return (
        <div className={`flex-shrink-0 lg:border-r border-border flex flex-col bg-card/30 transition-all duration-300 ${sidebarCollapsed ? 'w-0 lg:w-10 overflow-hidden' : 'w-full lg:w-[380px] xl:w-[480px] h-[280px] lg:h-auto'
            }`}>
            {sidebarCollapsed && (
                <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="hidden lg:flex items-center justify-center w-10 h-full hover:bg-secondary/50 transition-colors"
                    aria-label="Expand sidebar"
                >
                    <PanelLeft className="w-4 h-4 text-muted-foreground" />
                </button>
            )}

            {!sidebarCollapsed && (
                <>
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
                            {isListingDataLoading ? (
                                <Skeleton className="h-4 flex-1 max-w-[200px]" />
                            ) : (
                                <h1 className="text-xs font-semibold text-foreground truncate flex-1">{carTitle}</h1>
                            )}
                            {!isListingDataLoading && car.salvageRecord === "Yes" && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-destructive/10 text-destructive text-[10px] font-semibold rounded border border-destructive/20">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Salvage
                                </span>
                            )}
                        </div>
                        {isListingDataLoading ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Skeleton className="h-6 w-[4.5rem]" />
                                    <Skeleton className="h-6 w-[3.5rem]" />
                                    <Skeleton className="h-6 w-[3rem]" />
                                </div>
                                <Skeleton className="h-5 w-full max-w-[220px]" />
                                <p className="text-[10px] text-muted-foreground pt-0.5">Loading vehicle details…</p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>

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

                        <TabsContent value="photos" className="flex-1 flex flex-col m-0 overflow-hidden">
                            {isListingDataLoading ? (
                                <div className="flex-1 flex flex-col min-h-0 p-4 gap-3">
                                    <Skeleton className="flex-1 min-h-[180px] w-full rounded-lg" />
                                    <div className="flex gap-2 justify-center">
                                        <Skeleton className="h-9 w-12 rounded-md" />
                                        <Skeleton className="h-9 w-12 rounded-md" />
                                        <Skeleton className="h-9 w-12 rounded-md" />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">Loading listing photos…</p>
                                </div>
                            ) : images.length > 0 ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
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
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground border border-border">
                                            {activeImageIndex + 1} / {images.length}
                                        </div>
                                    </div>

                                    {images.length > 1 && (
                                        <div className="p-2 border-t border-border bg-secondary/20 flex-shrink-0">
                                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                                                {images.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveImageIndex(idx)}
                                                        className={`relative w-12 h-9 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${idx === activeImageIndex
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

                        <TabsContent value="report" className="flex-1 m-0 flex flex-col overflow-hidden">
                            {activePdfKey && pdfUrl ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="px-3 py-1.5 border-b border-border bg-secondary/20 flex items-center justify-between flex-shrink-0">
                                        <span className="text-[10px] text-muted-foreground font-medium">Vehicle History Report</span>
                                        <a
                                            href={pdfUrl}
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
                                            src={pdfUrl}
                                            className="w-full h-full border-none"
                                            title="Vehicle History Report PDF"
                                        />
                                    </div>
                                </div>
                            ) : isPdfUrlLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 min-h-0">
                                    <Skeleton className="h-full min-h-[200px] w-full max-w-sm rounded-lg" />
                                    <p className="text-xs text-muted-foreground text-center">Loading vehicle history report…</p>
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
    )
}
