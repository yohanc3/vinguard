# Job Queue

SQLite-based job queue for async background tasks.

**Related docs:** [Vehicle Analysis](./vehicle-analysis.md) | [Web Search](./web-search.md)

## Architecture

```
API (tRPC)              SQLite Jobs           Worker
    │                       │                   │
    │── enqueueJob ────────▶│                   │
    │   (type + data)       │                   │
    │                       │◀── poll ──────────│
    │                       │   (claim job)     │
    │                       │                   │
    │                       │   ── process ────▶│
    │                       │   (by job type)   │
    │                       │                   │
    │                       │◀── update ────────│
    │                       │   (result/error)  │
```

## Job Types

| Type | Data Payload | Processor |
|------|--------------|-----------|
| `generate_analysis` | `{ carId, scrapeResult?, carfaxText? }` (see `cars.createReport`) | Vehicle analysis generator |

## Files

```
src/
├── db/schema.ts                    # Jobs table schema
└── services/scraper/
    ├── job-queue.ts                # Queue operations
    └── worker.ts                   # Job processor
```

## Running

```bash
# Terminal 1: Backend API
bun run dev

# Terminal 2: Worker (processes jobs)
bun run worker
```

## Queue API

### `enqueueJob(type, data): string`

Add a job to the queue.

```typescript
import { enqueueJob } from "@/services/scraper/job-queue"

const jobId = enqueueJob("generate_analysis", { carId: "car-123", scrapeResult, carfaxText }, true)
```

### `getJob(id): Job | undefined`

Get job by ID.

```typescript
const job = getJob(jobId)
// { id, type, data, status, result, error, createdAt, updatedAt }
```

### `claimNextJob(): Job | null`

Claim the next pending job (used by worker).

### `updateJob(id, { status?, result?, error? })`

Update job status (used by worker).

## Job Schema

```typescript
interface Job {
  id: string
  type: string           // e.g. "generate_analysis"
  data: string | null    // JSON payload
  status: string         // "pending" | "processing" | "completed" | "failed"
  result: string | null  // JSON result on success
  error: string | null   // Error message on failure
  createdAt: number
  updatedAt: number
}
```

## How It Integrates

1. **Car / report creation** → Enqueues `generate_analysis` job
2. **Worker** → Claims job, runs [Vehicle Analysis](./vehicle-analysis.md)
3. **Analysis** → Uses [Web Search](./web-search.md) for research
4. **Result** → Saved to Palantir via [API Gateway](./palantir-api-gateway.md)

## Adding New Job Types

1. Add handler in `worker.ts`:

```typescript
case "my_new_job": {
  await myProcessor(data.someField)
  updateJob(job.id, { status: "completed" })
  break
}
```

2. Enqueue from your code:

```typescript
enqueueJob("my_new_job", { someField: "value" })
```
