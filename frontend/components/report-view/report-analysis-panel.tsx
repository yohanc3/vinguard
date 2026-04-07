"use client"

import { useState } from "react"
import {
    ChevronRight,
    Loader2,
    AlertTriangle,
    ExternalLink,
    Check,
    TrendingUp,
    TrendingDown,
    MessageSquare,
    Wrench,
    Car,
    FileSearch,
    CheckCircle2,
    CircleAlert,
    ClipboardList,
    FileText,
    Globe,
    Link,
} from "lucide-react"
import type { VehicleAnalysis } from "@/components/report-view/report-view-page-types"
import { VerdictBadge } from "@/components/report-view/report-verdict-badge"

const CATEGORY_ICONS = {
    recall: AlertTriangle,
    inspection: Wrench,
    question: MessageSquare,
    test_drive: Car,
    documentation: FileSearch,
} as const

interface AnalysisPanelProps {
    analysis: VehicleAnalysis
    onToggleChecklistItem?: (itemId: string, completed: boolean) => void
    isSaving?: boolean
}

export function AnalysisPanel({ analysis, onToggleChecklistItem, isSaving }: AnalysisPanelProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    function toggleItem(id: string) {
        setExpandedItems(function(prev) {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    function handleCheckboxChange(itemId: string, currentCompleted: boolean) {
        if (onToggleChecklistItem) {
            onToggleChecklistItem(itemId, !currentCompleted)
        }
    }

    console.log("sources", analysis.sources)
    return (
        <div className="flex flex-col gap-4 p-4">

            {/* Verdict Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deal Verdict</h3>
                    <VerdictBadge verdict={analysis.verdict.label} />
                </div>
                <p className="text-sm text-foreground">{analysis.verdict.justification}</p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Upsides
                        </span>
                        <ul className="space-y-1">
                            {analysis.verdict.upsides.map(function(item, idx) {
                                return (
                                    <li key={idx} className="text-xs text-foreground flex items-start gap-1.5">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Risks
                        </span>
                        <ul className="space-y-1">
                            {analysis.verdict.risks.map(function(item, idx) {
                                return (
                                    <li key={idx} className="text-xs text-foreground flex items-start gap-1.5">
                                        <CircleAlert className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Market Comparison */}
            <div className="space-y-3 pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Comparison</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/30 rounded-lg p-2 border border-border">
                        <span className="text-[10px] text-muted-foreground">Listing Price</span>
                        <p className="text-sm font-semibold text-foreground">
                            ${analysis.market.listingPrice.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2 border border-border">
                        <span className="text-[10px] text-muted-foreground">vs Market</span>
                        <p className={`text-sm font-semibold flex items-center gap-1 ${analysis.market.percentDifference < 0 ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                            {analysis.market.percentDifference < 0 ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                                <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            {Math.abs(analysis.market.percentDifference)}% {analysis.market.percentDifference < 0 ? 'below' : 'above'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    {analysis.market.kbbValue && (
                        <div className="text-xs">
                            <span className="text-muted-foreground block">KBB</span>
                            <span className="text-foreground font-medium">${analysis.market.kbbValue.toLocaleString()}</span>
                        </div>
                    )}
                    {analysis.market.tradeInValue && (
                        <div className="text-xs">
                            <span className="text-muted-foreground block">Trade-In</span>
                            <span className="text-foreground font-medium">${analysis.market.tradeInValue.toLocaleString()}</span>
                        </div>
                    )}
                    {analysis.market.privatePartyValue && (
                        <div className="text-xs">
                            <span className="text-muted-foreground block">Private Party</span>
                            <span className="text-foreground font-medium">${analysis.market.privatePartyValue.toLocaleString()}</span>
                        </div>
                    )}
                </div>
                {analysis.market.negotiationNote && (
                    <p className="text-xs text-muted-foreground italic bg-secondary/20 px-2 py-1.5 rounded">
                        💡 {analysis.market.negotiationNote}
                    </p>
                )}
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />
                        Action Checklist
                    </h3>
                    {isSaving && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    {analysis.checklist
                        .sort(function(a, b) { return a.priority - b.priority })
                        .map(function(item) {
                            const Icon = CATEGORY_ICONS[item.category] ?? FileText
                            const isExpanded = expandedItems.has(item.id)
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-secondary/20 rounded-lg border overflow-hidden transition-colors ${item.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 p-2">
                                        <button
                                            onClick={function() { handleCheckboxChange(item.id, item.completed) }}
                                            disabled={isSaving}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-muted-foreground/30 hover:border-emerald-500/50'
                                                }`}
                                        >
                                            {item.completed && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <button
                                            onClick={function() { toggleItem(item.id) }}
                                            className={`flex-1 flex items-center gap-2 text-left ${item.completed ? 'opacity-60' : ''}`}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                            <span className={`text-xs font-medium flex-1 ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-secondary rounded">
                                                P{item.priority}
                                            </span>
                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                    {isExpanded && (
                                        <div className="px-2 pb-2 pt-0">
                                            <p className="text-xs text-muted-foreground pl-12">{item.description}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                </div>
            </div>

            {/* Sources */}
            {analysis.sources && analysis.sources.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Research Sources
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        We used {analysis.sources.length} sources to analyze this vehicle in the status it's being sold
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.sources.map(function(src, sIdx) {
                            const hostname = new URL(src.url).hostname.replace("www.", "")
                            return (
                                <a
                                    key={sIdx}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-secondary/80 hover:bg-secondary border border-border px-2 py-1 rounded-full text-muted-foreground hover:text-emerald-500 transition-colors flex items-center gap-1.5 max-w-[200px]"
                                >
                                    <Link className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 flex-shrink-0" />
                                    <span className="truncate">{src.title ?? hostname}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Generated timestamp */}
            <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
                Analysis generated {new Date(analysis.generatedAt).toLocaleDateString()}
            </div>
        </div>
    )
}
