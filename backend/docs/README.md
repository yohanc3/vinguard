# Backend Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend                                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ tRPC
┌───────────────────────────────▼─────────────────────────────────────┐
│                         Backend API                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │  cars   │  │  chat   │  │ extract │  │ scrape  │  │  files  │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │            │
┌───────▼────────────▼────────────▼────────────▼────────────▼─────────┐
│                          Services                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  Palantir  │  │ Web Search │  │ Marketplace│  │     R2     │    │
│  │  (LLM/DB)  │  │  (DDG)     │  │  (Apify)   │  │  (Files)   │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
        │
        │ Job Queue
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Worker                                      │
│  ┌────────────────────┐  ┌────────────────────────────────┐        │
│  │    Scrape Jobs     │  │    Vehicle Analysis Jobs       │        │
│  │  (Playwright)      │  │  (LLM + Web Search)            │        │
│  └────────────────────┘  └────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## Documentation Index

### Core Services

| Doc | Description |
|-----|-------------|
| [Palantir API Gateway](./palantir-api-gateway.md) | Car CRUD operations via Palantir |
| [Palantir LLM](./palantir-llm.md) | LLM calls via Palantir AIP |
| [Web Search](./web-search.md) | DuckDuckGo search + content extraction |
| [Marketplace Service](./marketplace-service.md) | Facebook Marketplace scraping |

### Features

| Doc | Description |
|-----|-------------|
| [Vehicle Analysis](./vehicle-analysis.md) | AI-powered deal verdicts and checklists |
| [Chat](./chat.md) | Real-time AI chat with web search |
| [LLM Extraction](./llm-extraction.md) | Extract data from PDFs and listings |

### Infrastructure

| Doc | Description |
|-----|-------------|
| [Job Queue](./job-queue.md) | Background job processing |
| [Testing](./testing.md) | Test configuration and running |

## Key Flows

### Report Creation

```
1. User submits URL + PDF
2. extract.combined() extracts data from both
3. cars.create() saves to Palantir
4. Job queued: generate_analysis
5. Worker runs vehicle analysis
6. Analysis saved to car.vehicleAnalysis
```

### Chat Message

```
1. User sends message
2. chat.sendMessageStream() starts SSE
3. LLM generates search queries
4. Web search runs (DDG + extraction)
5. LLM generates response with sources
6. Response streamed to frontend
7. Chat history saved to Palantir
```

### Scrape Job

```
1. scrape.startScrape() queues job
2. Worker claims job
3. Playwright scrapes URL
4. Result saved to job.result
5. Frontend polls getScrapeStatus()
```

## Environment Variables

```env
# Palantir
PALANTIR_FOUNDRY_API_URL=https://...
PALANTIR_ONTOLOGY_RID=ri.ontology...
PALANTIR_AIP_API_KEY=...

# External Services
APIFY_API_TOKEN=...

# R2 Storage
R2_BASE_URL=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# Database
DB_FILE_NAME=database.sqlite
```

## Running

```bash
# Install dependencies
bun install

# Run backend API
bun run dev

# Run worker (separate terminal)
bun run worker

# Run tests
bun test
```
