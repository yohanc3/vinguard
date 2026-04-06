# Web Search Service

A lightweight web search and content extraction service using DuckDuckGo and Cheerio. No API keys required.

**Related docs:** [Vehicle Analysis](./vehicle-analysis.md) | [LLM Extraction](./llm-extraction.md)

## Overview

This service provides two main capabilities:

1. **Search** - Query DuckDuckGo and get back a list of URLs
2. **Extract** - Fetch URLs and extract their main text content

## Usage

```typescript
import { 
  searchDuckDuckGoPlain, 
  extractFromSourcesParallel,
  type DdgSource 
} from "@/services/ddg-cheerio"

// 1. Search DuckDuckGo
const urls = await searchDuckDuckGoPlain("2006 Toyota Corolla reliability")
// Returns: ["https://example.com/review", "https://other.com/article", ...]

// 2. Extract content from URLs
const sources = await extractFromSourcesParallel(
  urls,
  3,    // maxSources - how many URLs to fetch
  1000  // maxCharsPerSource - truncate each result
)
// Returns: [{ url, extractedText }, ...]
```

## API Reference

### `searchDuckDuckGoPlain(query: string): Promise<string[]>`

Searches DuckDuckGo and returns up to 5 organic result URLs.

**How it works:**
- Fetches `https://html.duckduckgo.com/html/?q=<query>`
- Parses the HTML response with Cheerio
- Extracts URLs from `a.result__a` elements
- Unwraps DuckDuckGo redirect URLs (`/l/?uddg=...`)
- Filters to valid `http://` or `https://` URLs only

**Returns:** Array of up to 5 URL strings

---

### `extractFromSourcesParallel(urls, maxSources, maxCharsPerSource): Promise<DdgSource[]>`

Fetches multiple URLs in parallel and extracts their main text content.

**Parameters:**
- `urls: string[]` - URLs to fetch
- `maxSources: number` - Maximum number of URLs to process
- `maxCharsPerSource: number` - Truncate extracted text to this length

**How it works:**
1. Fetches each URL with a browser-like User-Agent
2. Parses HTML with Cheerio
3. Removes non-content elements: `script`, `style`, `noscript`, `header`, `footer`, `nav`, `form`
4. Extracts text from `main`, `article`, or `body` (whichever has more content)
5. Normalizes whitespace and truncates to `maxCharsPerSource`

**Returns:** Array of `DdgSource` objects:
```typescript
interface DdgSource {
  url: string
  title?: string
  extractedText: string
}
```

---

### `extractFromSources(urls, maxSources, maxCharsPerSource): Promise<DdgSource[]>`

Same as `extractFromSourcesParallel` but processes URLs sequentially. Use when you need to avoid rate limiting.

---

### `getDdGContextHiddenLimits(params): Promise<{ sources: DdgSource[] }>`

Convenience function that runs multiple queries and aggregates results.

```typescript
const result = await getDdGContextHiddenLimits({
  queries: ["query 1", "query 2"],
  maxSources: 6,        // total sources to return
  maxCharsPerSource: 700,
  ddgMaxSources: 3,     // sources per query
})
```

## Example: Building Search Context for an LLM

```typescript
async function buildSearchContext(userQuestion: string): Promise<string> {
  // Generate search queries (you might use an LLM for this)
  const queries = [
    `${userQuestion} review`,
    `${userQuestion} problems`,
  ]
  
  // Search and extract
  const allSources: DdgSource[] = []
  
  for (const query of queries) {
    const urls = await searchDuckDuckGoPlain(query)
    const sources = await extractFromSourcesParallel(urls, 3, 700)
    allSources.push(...sources)
  }
  
  // Format for LLM context
  return allSources
    .map((s, i) => `[Source ${i + 1}] ${s.url}\n${s.extractedText}`)
    .join("\n\n")
}
```

## Configuration

The service uses these default behaviors:

| Setting | Value | Notes |
|---------|-------|-------|
| Max search results | 5 | DDG organic results parsed |
| User-Agent | Windows Chrome | Helps avoid blocks |
| Parallel fetching | Yes | Use `extractFromSourcesParallel` |
| Content selectors | `main`, `article`, `body` | Tries each, uses longest |

## Limitations

- **No JavaScript rendering** - Only static HTML is parsed. SPAs won't work.
- **Rate limiting** - DuckDuckGo may block excessive requests. Add delays if needed.
- **HTML changes** - DuckDuckGo's markup may change, breaking the parser.
- **Content quality** - Extraction is best-effort; some sites have poor semantic HTML.

## How It Integrates

This service is used by:

- **[Vehicle Analysis](./vehicle-analysis.md)** - Researches make/model reliability, recalls, market values
- **[Chat](./chat.md)** - Real-time web search for user questions

Typical flow:

```
LLM generates queries → searchDuckDuckGoPlain() → extractFromSourcesParallel() → Context for LLM
```

## Testing

```bash
cd backend
bun test tests/chat.ts
```

The test suite includes a DDG extraction test that:
1. Searches for "Who is lebron james"
2. Extracts content from the top results
3. Verifies that extracted text contains expected content
