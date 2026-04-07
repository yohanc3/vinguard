"use client"

import type { RefObject } from "react"
import { Zap, ExternalLink } from "lucide-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ChatEntry } from "@/components/chat/car-chat-panel-types"

interface CarChatMessageThreadProps {
  chatHistory: ChatEntry[]
  isStreaming: boolean
  streamStatus: string | null
  messagesEndRef: RefObject<HTMLDivElement | null>
}

export function CarChatMessageThread({
  chatHistory,
  isStreaming,
  streamStatus,
  messagesEndRef,
}: CarChatMessageThreadProps) {
  return (
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
                    <div className="prose prose-sm max-w-none prose-emerald">
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
  )
}
