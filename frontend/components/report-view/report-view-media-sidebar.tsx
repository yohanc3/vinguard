"use client"

import {
    AlertTriangle,
    FileText,
    ExternalLink,
    Copy,
    Check,
    ArrowLeft,
    PanelLeftClose,
    PanelLeft,
    Image as ImageIcon,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { PalantirCar } from "@/components/report-view/report-view-page-types"
import { SpecBadge } from "@/components/report-view/report-spec-badge"

interface ReportViewMediaSidebarProps {
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
    onBack: () => void
    car: PalantirCar
    carTitle: string
    isListingDataLoading: boolean
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

                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        <div className="px-3 py-1.5 border-b border-border bg-secondary/30 flex-shrink-0 flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-foreground">Vehicle History Report</span>
                            <button
                                onClick={() => setSidebarCollapsed(true)}
                                className="hidden lg:flex items-center justify-center w-10 h-9 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors flex-shrink-0"
                                aria-label="Collapse sidebar"
                            >
                                <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-shrink-0 px-3 py-2.5 border-b border-border bg-secondary/10 flex items-center gap-2 text-muted-foreground">
                            <ImageIcon className="w-4 h-4 opacity-50 flex-shrink-0" />
                            <span className="text-sm">No photos available</span>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            {activePdfKey && pdfUrl ? (
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <div className="px-3 py-1.5 border-b border-border bg-secondary/20 flex items-center justify-end flex-shrink-0">
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
                                            className="w-full h-full border-none min-h-[200px]"
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
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
