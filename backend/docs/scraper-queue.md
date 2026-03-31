# Scraper Queue

SQLite-based job queue for Playwright marketplace scraping.

## Architecture

```
Backend (tRPC)          SQLite              Worker
     │                    │                   │
     │── startScrape ────▶│                   │
     │   (insert job)     │                   │
     │                    │◀── poll ──────────│
     │                    │   (claim job)     │
     │                    │                   │
     │                    │◀── update ────────│
     │                    │   (result/error)  │
     │◀── getScrapeStatus │                   │
     │   (poll result)    │                   │
```

## Running

```bash
# Terminal 1: Backend
bun run dev

# Terminal 2: Worker
bun run worker
```

## tRPC Endpoints

### `scrape.startScrape`

Enqueue a scrape job.

```typescript
// Input
{ url: string }

// Output
{ jobId: string }
```

### `scrape.getScrapeStatus`

Get job status and result.

```typescript
// Input
{ jobId: string }

// Output
{
  id: string
  url: string
  status: "pending" | "processing" | "completed" | "failed"
  result: ScrapedListing | null
  error: string | null
}
```

## Result Format

```typescript
interface ScrapedListing {
  miles: string | null    // e.g. "140,000"
  price: string | null    // e.g. "1400" (no $ or comma)
  photos: string[]        // Image URLs
  details: string | null  // Full listing description
}
```

## Configuration

- **Max concurrent tabs:** 4 (see `browser-pool.ts`)
- **Poll interval:** 2 seconds
- **Browser:** Chromium (headless: false for debugging)

## Files

```
src/services/
├── scrape-queue.ts       # Job queue (enqueue, claim, update)
└── scraper/
    ├── browser-pool.ts   # Shared browser with tab pooling
    ├── playwright.ts     # Scraper logic
    └── worker.ts         # Job processor
```
