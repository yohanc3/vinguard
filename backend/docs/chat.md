# Chat Service

Real-time AI chat for vehicle-specific questions using SSE streaming.

**Related docs:** [Web Search](./web-search.md) | [Palantir LLM](./palantir-llm.md) | [Palantir API Gateway](./palantir-api-gateway.md)

## Overview

The chat service uses Server-Sent Events (SSE) to stream progress updates while:

1. Generating search queries based on car context and user question
2. Searching the web for relevant information
3. Extracting content from sources
4. Generating a markdown-formatted response with citations

## File

`src/trpc/routers/chat.ts`

## Endpoints

### `chat.getChatHistory`

Get existing chat history for a car.

```typescript
// Input
{ carId: string }

// Output
{
  chatHistory: {
    role: "user" | "assistant"
    message: string
    sources?: { url: string, title: string }[]
  }[]
}
```

### `chat.sendMessageStream`

Send a message and receive streaming updates.

```typescript
// Input
{
  carId: string
  message: string
  chatHistory: ChatHistoryEntry[]
  carContext: {
    vin, make, model, year, trim,
    listingMileage, listingPrice,
    listingDetails, odometerReadings
  }
}

// Yields (SSE events)
{ type: "status", message: "Thinking..." }
{ type: "status", message: "Searching the web..." }
{ type: "status", message: "Reading sources..." }
{ type: "status", message: "Writing response..." }
{ type: "complete", message: string, sources: Source[] }
```

## Flow

```
User Message ──▶ LLM (Generate 2 queries)
                      │
                      ▼
               Web Search (DDG)
                      │
                      ▼
               Extract Content
                      │
                      ▼
               LLM (Final answer)
                      │
                      ▼
               Save to Palantir
                      │
                      ▼
               Return response
```

## Source Storage

Sources are stored as stringified JSON in Palantir fields:

```typescript
// Palantir storage (source1, source2, source3 as strings)
{
  source1: '{"url":"...","title":"..."}',
  source2: null,
  source3: null
}

// API response (parsed to objects)
{
  sources: [{ url: "...", title: "..." }]
}
```

## Frontend Integration

Uses tRPC subscription with `splitLink`:

```typescript
const subscription = trpc.chat.sendMessageStream.useSubscription(
  { carId, message, chatHistory, carContext },
  {
    onData(event) {
      if (event.type === "status") setStatus(event.message)
      if (event.type === "complete") addMessage(event)
    }
  }
)
```

## Configuration

| Setting | Value |
|---------|-------|
| Max history | 10 messages |
| Queries per request | 2 |
| Sources per query | 3 |
| Chars per source | 700 |
