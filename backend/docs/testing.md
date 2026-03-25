# Testing

## Run Tests

```bash
bun test tests/main.test.ts
bun test:watch  # watch mode
```

## Test Structure

```
tests/
├── main.test.ts   # Test runner, orchestrates all tests
├── setup.ts       # DB setup/teardown, test app creation
├── state.ts       # Shared test state (app, tokens, test data)
├── auth.ts        # Authentication tests
├── cars.ts        # Cars CRUD tests (Palantir)
└── llm.ts         # LLM extraction tests
```

## Test Flow

1. **Setup**: Create test SQLite DB, run migrations, create Hono app
2. **Auth**: Register, login, validate JWT
3. **Cars CRUD**: Create → Fetch → Update → Verify → Delete → Verify deletion
4. **LLM**: Schema validation, real PDF extraction, listing extraction
5. **Cleanup**: Delete test DB

## PDF Text Extraction

Uses `pdf-parse` to extract text from PDFs:

```typescript
import { readFile } from "node:fs/promises"
import { PDFParse } from "pdf-parse"

const buffer = await readFile("./tests/vin-report-test.pdf")
const parser = new PDFParse({ data: buffer })
const result = await parser.getText()
const text = result.text
await parser.destroy()
```

## Test Data

Defined in `tests/state.ts`:
- `TEST_USER` - email/password for auth tests
- `TEST_CAR` - full car object for CRUD tests
- `UPDATED_CAR_DATA` - partial data for update tests

## Timeouts

- LLM tests: 60s (LLM calls can take 5-20s)
- Individual LLM calls: 15s abort timeout

## Skipping Tests

Tests auto-skip if:
- Palantir unavailable (bad API key)
- Test PDF not found

## Environment

Tests use same `.env` as dev. Required vars:
- `PALANTIR_FOUNDRY_API_URL`
- `PALANTIR_ONTOLOGY_RID`
- `PALANTIR_AIP_API_KEY`
