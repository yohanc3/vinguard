# Vinguard backend

[Hono](https://hono.dev) serves a [tRPC](https://trpc.io) router: cars (Palantir), chat (streaming + web search), extract (LLM on PDF/listing text), files (R2 presigned URLs), auth (JWT + SQLite users). A separate **worker** polls SQLite for `generate_analysis` jobs and runs vehicle analysis.

## Requirements

- Bun
- Valid `.env` (see below)

## Environment

Copy the template and edit:

```sh
cp .env.example .env
```

| Area | Variables (see `.env.example` for descriptions) |
|------|-----------------------------------------------|
| HTTP | `APP_PORT`, `CORS_ORIGIN` |
| Palantir | `PALANTIR_FOUNDRY_API_URL`, `PALANTIR_ONTOLOGY_RID`, `PALANTIR_AIP_API_KEY` |
| Auth | `JWT_SECRET` |
| Storage | `R2_*` (required for CarFax PDF upload in the app flow) |
| Database | `DB_FILE_NAME` (SQLite path; migrations run when the API starts) |

Optional: `LOG_LEVEL`, `VERBOSE` (on the worker), `VOLUME_PATH` (deployments).

## Scripts

```sh
bun install

# API (hot reload)
bun run dev

# Background worker — run alongside dev for report analysis
bun run worker

# Tests (expect Palantir env; hits live stack where applicable)
bun test
bun run test:watch
```

Default API URL: `http://localhost:3000` (tRPC at `/trpc/*`).

## Project layout (high level)

```
src/
  index.ts              # Hono app + Bun.serve
  trpc/                 # Routers (cars, chat, extract, files, auth)
  services/             # LLM, R2, vehicle-analysis, scraper/job-queue + worker
  db/                   # Drizzle schema + SQLite client
docs/                   # Architecture and feature notes
tests/                  # Integration-style suite (main.test.ts)
```

## Docker

See `Dockerfile` and `start.sh` for a compiled binary + Bun worker layout. You still need env vars and secrets at runtime (not baked into the image).

## Documentation

Start at [`docs/README.md`](docs/README.md) for diagrams and links to Palantir, job queue, chat, and extraction docs.
