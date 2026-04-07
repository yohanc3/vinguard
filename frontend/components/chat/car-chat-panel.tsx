"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"

import { useTRPC } from "@/lib/trpc"
import type { CarContext, Source, ChatEntry } from "@/components/chat/car-chat-panel-types"
import { normalizeChatHistoryEntry } from "@/components/chat/car-chat-normalize-history"
import { CarChatMessageThread } from "@/components/chat/car-chat-message-thread"
import { CarChatComposer } from "@/components/chat/car-chat-composer"

export type { CarContext, Source, ChatEntry } from "@/components/chat/car-chat-panel-types"

interface CarChatPanelProps {
  carId: string
  carContext: CarContext
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
      <CarChatMessageThread
        chatHistory={chatHistory}
        isStreaming={isStreaming}
        streamStatus={streamStatus}
        messagesEndRef={messagesEndRef}
      />
      <CarChatComposer
        draft={draft}
        setDraft={setDraft}
        canSend={canSend}
        isStreaming={isStreaming}
        textareaRef={textareaRef}
        onSend={handleSend}
      />
    </div>
  )
}
