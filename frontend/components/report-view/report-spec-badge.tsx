"use client"

export function SpecBadge({ label, value, highlight = false }: {
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${highlight
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-secondary/50 border border-border'
            }`}>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
            <span className={`text-[11px] font-semibold ${highlight ? 'text-emerald-500' : 'text-foreground'}`}>{value}</span>
        </div>
    )
}
