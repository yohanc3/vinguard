# Backend Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend                                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ tRPC
┌───────────────────────────────▼─────────────────────────────────────┐
│                         Backend API                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │  cars   │  │  chat   │  │ extract │  │  files  │               │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘               │
└───────┼────────────┼────────────┼────────────┼─────────────────────┘
        │            │            │            │
┌───────▼────────────▼────────────▼────────────▼─────────────────────┐
│                          Services                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                   │
│  │  Palantir  │  │ Web Search │  │     R2     │                   │
│  │  (LLM/DB)  │  │  (DDG)     │  │  (Files)   │                   │
│  └────────────┘  └────────────┘  └────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
        │
        │ Job Queue
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Worker                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Vehicle Analysis (generate_analysis)           │    │
│  │              LLM + Web Search                                 │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Documentation Index

### Core Services

| Doc | Description |
|-----|-------------|
| [Palantir API Gateway](./palantir-api-gateway.md) | Car CRUD operations via Palantir |
| [Palantir LLM](./palantir-llm.md) | LLM calls via Palantir AIP |
| [Web Search](./web-search.md) | DuckDuckGo search + content extraction |

### Features

| Doc | Description |
|-----|-------------|
| [Vehicle Analysis](./vehicle-analysis.md) | AI-powered deal verdicts and checklists |
| [Chat](./chat.md) | Real-time AI chat with web search |
| [LLM Extraction](./llm-extraction.md) | Extract data from PDFs and listings |
| [Extract Router](./extract-router.md) | tRPC procedures for PDF/listing text extraction |

### Infrastructure

| Doc | Description |
|-----|-------------|
| [Job Queue](./job-queue.md) | Background job processing |
| [Testing](./testing.md) | Test configuration and running |

## Key Flows

### Report Creation

```
1. User enters listing fields + uploads CarFax PDF
2. cars.createReport() saves car, runs LLM extraction, enqueues generate_analysis
3. Worker runs vehicle analysis
4. Analysis saved to car.vehicleAnalysis
```

### Chat Message

```
1. User sends message
2. chat.sendMessageStream() starts SSE
3. LLM generates search queries
4. Web search runs (DDG + result extraction in parallel)
5. LLM generates response with sources
6. Response streamed to frontend
7. Chat history saved to Palantir
```

## Running

```bash
# Install dependencies
bun install

# Run backend API
bun run dev

# Run worker
bun run worker

# Run tests
bun test
```
