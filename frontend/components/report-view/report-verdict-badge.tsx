"use client"

import {
    TrendingUp,
    AlertTriangle,
    CircleCheck,
    CircleAlert,
} from "lucide-react"
import type { VehicleAnalysis } from "@/components/report-view/report-view-page-types"

const VERDICT_CONFIG = {
    strong_buy: { label: "Strong Buy", color: "emerald", icon: TrendingUp },
    good_deal: { label: "Good Deal", color: "blue", icon: CircleCheck },
    proceed_with_caution: { label: "Proceed with Caution", color: "amber", icon: CircleAlert },
    walk_away: { label: "Walk Away", color: "red", icon: AlertTriangle },
} as const

export function VerdictBadge({ verdict }: { verdict: VehicleAnalysis["verdict"]["label"] }) {
    const config = VERDICT_CONFIG[verdict]
    const Icon = config.icon
    const colorClasses = {
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClasses[config.color]}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    )
}
