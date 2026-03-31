# Chat (Palantir + DuckDuckGo + Cheerio)

This section adds a multiturn chat flow backed by your Palantir `cars.chatHistory` field, plus a server-side DuckDuckGo + cheerio scraping helper to optionally gather external sources.

## What was added

### 1. DDG + cheerio service
File: `backend/src/services/ddg-cheerio.ts`

Functions:
- `searchDuckDuckGoPlain(query)`
  - Uses `https://duckduckgo.com/html/?q=...`
  - Extracts the first 5 organic result URLs
  - Filters to valid absolute `http/https` URLs only (skips relative/invalid hrefs)
- `extractFromSources(urls, maxSources, maxCharsPerSource)`
  - Fetches each URL
  - Uses cheerio to remove non-content elements (`script/style/noscript/header/footer/nav/form`)
  - Extracts text from `main`, `article`, falling back to `body`
  - Normalizes whitespace and truncates to `maxCharsPerSource`

Hidden limits used by the chat route:
- `MAX_SOURCES = 5`
- `MAX_CHARS_PER_SOURCE = 700`

### 2. tRPC chat router
File: `backend/src/trpc/routers/chat.ts`

Procedures:
- `chat.getChatHistory({ carId })`
  - Loads the car by `carId` from Palantir and returns `chatHistory` (defaults to `[]`)
- `chat.sendMessage({ carId, message, chatHistory })`
  - Uses `chatHistory` from the frontend (last 10 messages for efficiency)
  - Requires `carContext` from the frontend (lean backend: no extra Palantir reads)
  - Calls the Palantir LLM to generate EXACTLY 2 DDG queries
  - Runs DuckDuckGo + cheerio in parallel:
    - 3 top results per query (6 total extracted snippets)
    - each snippet truncated to 700 chars
  - Calls the Palantir LLM again to produce `{ message, source1, source2, source3 }`
  - Overwrites `cars.chatHistory` in Palantir with:
    - `[...frontendChatHistory, assistantMessage]` (then truncates to last 10)
  - Returns only the assistant reply + citations (`source1..3`)

### 3. Palantir schema support for chatHistory
File: `backend/src/trpc/routers/cars.ts`

- `carSchema` and `carInputSchema` were extended to include:
  - `chatHistory?: { role, message, source1, source2, source3 }[]`

### 4. Route registration
File: `backend/src/trpc/root.ts`

- `chatRouter` is registered under `chat: chatRouter`.

## Tests added

File: `backend/tests/chat.ts`

Includes:
1. `DDG + cheerio extraction` test
   - Query: `Who is lebron james`
   - Uses DDG service limits (first 5 sources, extracted text truncated to 700 chars internally)
   - Prints the first **600 chars** of each extracted source
   - Asserts that at least one extracted snippet includes:
     `Nicknamed "King James"` (with quote normalization to reduce false negatives)

2. `chat.sendMessage` + `chat.getChatHistory` test
   - Skips entirely if Palantir is not available (`testState.palantirAvailable === false`)
   - Sends `{ carId, message, chatHistory }` for `TEST_CAR.id`
   - Asserts a non-empty assistant response and non-empty history.

## How to validate
- Run: `cd backend && bun test tests/main.test.ts`

## Notes / caveats
- DDG HTML parsing is best-effort and may change if DuckDuckGo markup changes.
- The chat procedure relies on Foundry/Palantir `edit-cars/apply` accepting `chatHistory` with the field name `chatHistory`.

