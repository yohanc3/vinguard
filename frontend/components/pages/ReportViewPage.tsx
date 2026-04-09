"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTRPC } from "@/lib/trpc"
import type { ReportViewPageProps, PalantirCar, VehicleAnalysis } from "@/components/report-view/report-view-page-types"
import { parseVehicleAnalysis, isCarListingDetailsLoading } from "@/components/report-view/report-view-parsing"
import { ReportViewMediaSidebar } from "@/components/report-view/report-view-media-sidebar"
import { ReportViewChatAnalysisColumn } from "@/components/report-view/report-view-chat-analysis-column"

export function ReportViewPage({ reportId, onBack }: ReportViewPageProps) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const [activePdfKey, setActivePdfKey] = useState<string | null>(null)
    const [vinCopied, setVinCopied] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [localAnalysis, setLocalAnalysis] = useState<VehicleAnalysis | null>(null)

    const carQuery = useQuery({
        ...trpc.cars.getById.queryOptions({ id: reportId }),
        refetchInterval: function refetchUntilAnalysis(query) {
            if (query.state.status !== "success") return false
            const data = query.state.data as PalantirCar | undefined
            if (!data) return false
            if (parseVehicleAnalysis(data.vehicleAnalysis)) return false
            return 4000
        },
    })
    const car = carQuery.data as PalantirCar | undefined
    const serverAnalysis = parseVehicleAnalysis(car?.vehicleAnalysis)
    console.log("server analysis", serverAnalysis)
    const analysis = localAnalysis ?? serverAnalysis

    useEffect(function syncLocalAnalysis() {
        if (serverAnalysis && !localAnalysis) {
            setLocalAnalysis(serverAnalysis)
        }
    }, [serverAnalysis, localAnalysis])

    const updateAnalysisMutation = useMutation({
        ...trpc.cars.updateAnalysis.mutationOptions(),
        onSuccess: function() {
            queryClient.invalidateQueries({ queryKey: ["cars", "getById", { id: reportId }] })
        },
    })

    function handleToggleChecklistItem(itemId: string, completed: boolean) {
        if (!analysis) return

        const updatedAnalysis: VehicleAnalysis = {
            ...analysis,
            checklist: analysis.checklist.map(function(item) {
                if (item.id === itemId) {
                    return { ...item, completed }
                }
                return item
            }),
        }

        setLocalAnalysis(updatedAnalysis)

        updateAnalysisMutation.mutate({
            id: reportId,
            vehicleAnalysis: JSON.stringify(updatedAnalysis),
        })
    }

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
                <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6 max-w-md mx-auto w-full">
                    <div className="w-full space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-7 w-14" />
                        </div>
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">Loading vehicle report…</p>
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
    const isListingDataLoading = isCarListingDetailsLoading({
        car,
        imageCount: (car.listingPictures ?? []).length,
        isFetching: carQuery.isFetching,
        hasVehicleAnalysis: serverAnalysis !== null,
    })
    const awaitingPdfKeySync = Boolean(car.carReport) && !activePdfKey
    const isPdfUrlLoading =
        !pdfDownloadUrlQuery.data?.url &&
        (pdfDownloadUrlQuery.isPending || awaitingPdfKeySync)

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <div className="flex-1 max-w-[1800px] mx-auto w-full flex flex-col lg:flex-row overflow-hidden">

                <ReportViewMediaSidebar
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    onBack={onBack}
                    car={car}
                    carTitle={carTitle}
                    isListingDataLoading={isListingDataLoading}
                    copyVin={copyVin}
                    vinCopied={vinCopied}
                    activePdfKey={activePdfKey}
                    pdfUrl={pdfDownloadUrlQuery.data?.url}
                    isPdfUrlLoading={isPdfUrlLoading}
                />

                <ReportViewChatAnalysisColumn
                    car={car}
                    analysis={analysis}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    isSavingAnalysis={updateAnalysisMutation.isPending}
                />
            </div>
        </div>
    )
}
