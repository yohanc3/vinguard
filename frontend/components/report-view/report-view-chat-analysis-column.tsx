"use client"

import { Shield, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { CarChatPanel } from "@/components/chat/car-chat-panel"
import type { PalantirCar, VehicleAnalysis } from "@/components/report-view/report-view-page-types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/report-view/report-view-tabs"
import { AnalysisPanel } from "@/components/report-view/report-analysis-panel"

interface ReportViewChatAnalysisColumnProps {
    car: PalantirCar
    analysis: VehicleAnalysis | null
    onToggleChecklistItem: (itemId: string, completed: boolean) => void
    isSavingAnalysis: boolean
}

export function ReportViewChatAnalysisColumn({
    car,
    analysis,
    onToggleChecklistItem,
    isSavingAnalysis,
}: ReportViewChatAnalysisColumnProps) {
    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
                    <TabsList>
                        <TabsTrigger value="chat">
                            <MessageSquare className="w-3.5 h-3.5" />
                            AI Chat
                        </TabsTrigger>
                        <TabsTrigger value="vinguard-report">
                            <Shield className="w-3.5 h-3.5" />
                            Vinguard Report
                            {analysis && (
                                <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
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
                            marketplaceListing: car.marketplaceListing ?? null,
                        }}
                    />
                </TabsContent>

                <TabsContent value="vinguard-report" className="flex-1 m-0 overflow-y-auto">
                    {analysis ? (
                        <AnalysisPanel
                            analysis={analysis}
                            onToggleChecklistItem={onToggleChecklistItem}
                            isSaving={isSavingAnalysis}
                        />
                    ) : (
                        <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 p-6 max-w-lg mx-auto w-full">
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-24 w-full rounded-lg mt-4" />
                                <Skeleton className="h-16 w-full rounded-lg" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium text-foreground">Generating Vinguard Report…</p>
                                <p className="text-xs text-muted-foreground">This may take a few minutes.</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
