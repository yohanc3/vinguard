"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Send, Zap, ExternalLink } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTRPC } from "@/lib/trpc"

export interface CarContext {
  vin: string | null
  make: string | null
  model: string | null
  year: number | null
  trim: string | null
  listingMileage: string | null
  listingPrice: number | null
  listingDetails: string[] | null
  odometerReadings: number[] | null
}

export interface Source {
  url: string
  title: string
}

export interface ChatEntry {
  role: string
  message: string
  sources?: Source[]
}

interface CarChatPanelProps {
  carId: string
  carContext: CarContext
}

function normalizeChatHistoryEntry(entry: unknown): ChatEntry {
  const e = entry as Record<string, unknown>
  return {
    role: String(e?.role ?? ""),
    message: String(e?.message ?? ""),
    sources: Array.isArray(e?.sources) ? e.sources as Source[] : [],
  }
}

export function CarChatPanel({ carId, carContext }: CarChatPanelProps) {
  const trpc = useTRPC()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const chatHistoryQuery = useQuery({
    ...trpc.chat.getChatHistory.queryOptions({ carId }),
    enabled: carId.length > 0,
  })

  const [draft, setDraft] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [streamStatus, setStreamStatus] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [subscriptionInput, setSubscriptionInput] = useState<{
    carId: string
    message: string
    chatHistory: ChatEntry[]
    carContext: CarContext
  } | null>(null)

  useEffect(function syncFromQuery() {
    if (chatHistoryQuery.data?.chatHistory) {
      setChatHistory(
        chatHistoryQuery.data.chatHistory.map(function (e) {
          return normalizeChatHistoryEntry(e)
        }),
      )
    }
  }, [chatHistoryQuery.data])

  useEffect(function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, streamStatus])

  useEffect(function autoResizeTextarea() {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = 120
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
    }
  }, [draft])

  const subscriptionEnabled = isStreaming && subscriptionInput !== null

  useSubscription(
    trpc.chat.sendMessageStream.subscriptionOptions(
      isStreaming && subscriptionInput ? subscriptionInput : { carId: "", message: "", chatHistory: [], carContext },
      {
        enabled: subscriptionEnabled,
        onData(event: { type: "status"; message: string } | { type: "complete"; message: string; sources: Source[] }) {
          if (event.type === "status") {
            setStreamStatus(event.message)
          } else if (event.type === "complete") {
            const assistantEntry: ChatEntry = {
              role: "assistant",
              message: event.message,
              sources: event.sources,
            }
            setChatHistory(function (prev) {
              return prev.concat([assistantEntry]).slice(-10)
            })
            setStreamStatus(null)
            setIsStreaming(false)
            setSubscriptionInput(null)
          }
        },
        onError(error: unknown) {
          console.error("[CarChatPanel] subscription error:", error)
          setStreamStatus(null)
          setIsStreaming(false)
          setSubscriptionInput(null)
        },
      },
    ),
  )

  const canSend = useMemo(function canSendCompute() {
    return draft.trim().length > 0 && !isStreaming
  }, [draft, isStreaming])

  function handleSend() {
    if (!canSend) return

    const userMessage = draft.trim()
    const nextHistory = chatHistory
      .concat([
        {
          role: "user",
          message: userMessage,
          sources: [],
        },
      ])
      .slice(-10)

    setChatHistory(nextHistory)
    setDraft("")
    setIsStreaming(true)
    setStreamStatus("Thinking...")

    setSubscriptionInput({
      carId,
      message: userMessage,
      chatHistory: nextHistory.map(function (e) {
        return {
          role: e.role,
          message: e.message,
          sources: e.sources ?? [],
        }
      }),
      carContext,
    })
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Messages - with padding for floating input */}
      <div className="flex-1 overflow-auto px-4 py-4 pb-24 space-y-6 min-h-0">
        {chatHistory.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-emerald-500/50" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              Ask me anything about this vehicle's history, specs, or potential risks.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {chatHistory.map(function (entry, idx) {
              const isUser = entry.role === "user"
              return (
                <div key={String(idx)} className={isUser ? "flex justify-end" : ""}>
                  {isUser ? (
                    <div className="max-w-[80%] rounded-2xl rounded-tr-none px-4 py-2.5 text-sm bg-emerald-600 text-white shadow-sm">
                      {entry.message}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="prose prose-invert prose-sm max-w-none prose-emerald">
                        <Markdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: function renderA({ href, children }) {
                              return (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              )
                            },
                          }}
                        >
                          {entry.message}
                        </Markdown>
                      </div>

                      {entry.sources && entry.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.sources.map(function (src, sIdx) {
                            return (
                              <a 
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] bg-secondary/80 hover:bg-secondary border border-border px-2 py-1 rounded-full text-muted-foreground hover:text-emerald-500 transition-colors flex items-center gap-1.5 max-w-[200px]"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{src.title}</span>
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {isStreaming && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {streamStatus && (
                    <span className="text-xs">{streamStatus}</span>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating input - centered at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-10">
        <div className="relative flex items-end bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg rounded-2xl">
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={function handleDraftChange(e) {
              setDraft(e.target.value)
            }}
            onKeyDown={function handleKeyDown(e) {
              if (e.key === 'Enter' && !e.shiftKey && canSend) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask a question..."
            className="min-h-[40px] max-h-[120px] py-2.5 pl-4 pr-12 bg-transparent border-0 shadow-none focus:ring-0 focus-visible:ring-0 resize-none text-sm rounded-2xl"
            disabled={isStreaming}
            rows={1}
          />
          <Button
            type="button"
            onClick={handleSend}
            className="absolute right-2 bottom-2 h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all"
            disabled={!canSend}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
