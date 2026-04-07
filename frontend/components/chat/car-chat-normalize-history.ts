import type { ChatEntry, Source } from "@/components/chat/car-chat-panel-types"

export function normalizeChatHistoryEntry(entry: unknown): ChatEntry {
  const e = entry as Record<string, unknown>
  return {
    role: String(e?.role ?? ""),
    message: String(e?.message ?? ""),
    sources: Array.isArray(e?.sources) ? e.sources as Source[] : [],
  }
}
