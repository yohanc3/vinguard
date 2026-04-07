"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface TabsContextValue {
    activeTab: string
    setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export function Tabs({ defaultValue, children, className = "" }: {
    defaultValue: string
    children: ReactNode
    className?: string
}) {
    const [activeTab, setActiveTab] = useState(defaultValue)
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`flex gap-1 bg-secondary/50 p-1 rounded-lg ${className}`}>
            {children}
        </div>
    )
}

export function TabsTrigger({ value, children, className = "" }: {
    value: string
    children: ReactNode
    className?: string
}) {
    const context = useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")
    const isActive = context.activeTab === value
    return (
        <button
            onClick={() => context.setActiveTab(value)}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                } ${className}`}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className = "" }: {
    value: string
    children: ReactNode
    className?: string
}) {
    const context = useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")
    if (context.activeTab !== value) return null
    return <div className={className}>{children}</div>
}
