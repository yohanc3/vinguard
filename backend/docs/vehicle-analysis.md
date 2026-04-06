# Vehicle Analysis

Generates AI-powered vehicle analysis reports with deal verdicts, market comparison, and action checklists.

**Related docs:** [Job Queue](./job-queue.md) | [Web Search](./web-search.md) | [Palantir LLM](./palantir-llm.md)

## Overview

The analysis pipeline:

```
Car Data ─────┐
              │
CarFax Data ──┼──▶ LLM (Query Gen) ──▶ 10 Search Queries
              │           │
              │           ▼
              │     Web Search ──▶ 30 Sources (extracted)
              │           │
              │           ▼
              └──▶ LLM (Analysis) ──▶ Structured Report
                          │
                          ▼
                    Save to Palantir
```

## File

`src/services/vehicle-analysis.ts`

## Usage

```typescript
import { generateVehicleAnalysis } from "@/services/vehicle-analysis"

// Called by worker, not directly
await generateVehicleAnalysis("car-123")
```

Typically triggered via the job queue:

```typescript
import { enqueueJob } from "@/services/scraper/job-queue"

enqueueJob("generate_analysis", { carId: "car-123" })
```

## Output Schema

Stored as stringified JSON in `car.vehicleAnalysis`:

```typescript
interface VehicleAnalysis {
  summaryLine: string
  // e.g. "2006 Toyota Corolla · $1,400 · 40% below market · Verdict: Strong Buy"
  
  verdict: {
    label: "strong_buy" | "good_deal" | "proceed_with_caution" | "walk_away"
    justification: string
    upsides: string[]    // 3-4 positive points
    risks: string[]      // 3-4 concerns
  }
  
  market: {
    kbbValue: number | null
    tradeInValue: number | null
    privatePartyValue: number | null
    listingPrice: number
    percentDifference: number  // negative = below market
    negotiationNote: string | null
  }
  
  checklist: ChecklistItem[]
  
  generatedAt: string  // ISO timestamp
  status: "pending" | "generating" | "completed" | "failed"
}

interface ChecklistItem {
  id: string
  priority: number      // 1 = highest
  title: string
  description: string
  category: "recall" | "inspection" | "question" | "test_drive" | "documentation"
  completed: boolean
}
```

## How It Works

### Step 1: Query Generation

LLM receives car data + CarFax and generates 10 search queries distributed across:

- Common problems/reliability (2-3 queries)
- Recall information (1-2 queries)
- Fair market value (2-3 queries)
- Inspection points (1-2 queries)
- Seller questions (1-2 queries)

### Step 2: Web Research

Uses [Web Search](./web-search.md) service:

- Run all 10 queries through DuckDuckGo
- Take top 3 URLs per query (30 total)
- Extract content (700 chars each)
- Aggregate into context string

### Step 3: Analysis Generation

LLM receives:

- Original car data
- CarFax data
- All extracted web context

Returns structured `VehicleAnalysis` JSON.

### Step 4: Persist

Saves stringified analysis to `car.vehicleAnalysis` via [Palantir API](./palantir-api-gateway.md).

## Integration Points

| Trigger | How |
|---------|-----|
| Car creation | Auto-enqueued in `cars.create` mutation |
| Manual | Call `cars.generateAnalysis` mutation |
| Direct | Enqueue `generate_analysis` job |

## tRPC Endpoints

### `cars.generateAnalysis`

Manually trigger analysis for existing car.

```typescript
// Input
{ id: string }

// Output
{ jobId: string }
```

## Example Checklist Output

```json
[
  {
    "id": "item-1",
    "priority": 1,
    "title": "Verify recall status",
    "description": "Check NHTSA for open recalls on 2006 Toyota Corolla",
    "category": "recall",
    "completed": false
  },
  {
    "id": "item-2", 
    "priority": 2,
    "title": "Schedule pre-purchase inspection",
    "description": "Have a mechanic inspect timing chain and transmission",
    "category": "inspection",
    "completed": false
  }
]
```

## Configuration

| Setting | Value |
|---------|-------|
| Max queries | 10 |
| URLs per query | 3 |
| Chars per source | 700 |
| Total sources | ~30 |
