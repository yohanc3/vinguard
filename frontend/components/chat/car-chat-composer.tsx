"use client"

import { Send } from "lucide-react"
import type { RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CarChatComposerProps {
  draft: string
  setDraft: (value: string) => void
  canSend: boolean
  isStreaming: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onSend: () => void
}

export function CarChatComposer({
  draft,
  setDraft,
  canSend,
  isStreaming,
  textareaRef,
  onSend,
}: CarChatComposerProps) {
  return (
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
              onSend()
            }
          }}
          placeholder="Ask a question..."
          className="min-h-[40px] max-h-[120px] py-2.5 pl-4 pr-12 bg-transparent border-0 shadow-none focus:ring-0 focus-visible:ring-0 resize-none text-sm rounded-2xl"
          disabled={isStreaming}
          rows={1}
        />
        <Button
          type="button"
          onClick={onSend}
          className="absolute right-2 bottom-2 h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all"
          disabled={!canSend}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
