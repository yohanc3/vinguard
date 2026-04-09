# Vinguard

Web app for vehicle listing review: users enter listing details and a CarFax PDF, the backend talks to **Palantir** for car records and LLM work, **Cloudflare R2** for PDF storage, and a small **SQLite** job queue drives **vehicle analysis** (research + verdict) in a background worker.

## Repository layout

| Directory   | Role |
|------------|------|
| `backend/` | Hono + tRPC API, Drizzle/SQLite, Palantir integration, worker process |
| `frontend/`| Vite + React + TanStack Query + tRPC client |

Deeper architecture notes live in [`backend/docs/`](backend/docs/README.md).

## Prerequisites

- [Bun](https://bun.sh) (used for install scripts and the backend runtime)

## First-time setup

1. **Backend environment**  
   `cd backend && cp .env.example .env`  
   Fill Palantir, JWT, R2, and optional tuning (see [`backend/README.md`](backend/README.md)).

2. **Frontend environment**  
   `cd frontend && cp .env.example .env`  
   Point `VITE_API_URL` at your API (default `http://localhost:3000/trpc`).

3. **Install dependencies** (each app has its own `node_modules`):

   ```sh
   cd backend && bun install
   cd ../frontend && bun install
   ```

## Running locally

You need **two backend processes** plus the **frontend** for the full flow (reports enqueue analysis jobs on the worker).

```sh
# Terminal 1 — API
cd backend && bun run dev

# Terminal 2 — worker (processes generate_analysis jobs)
cd backend && bun run worker

# Terminal 3 — UI
cd frontend && bun run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

## Further reading

- [`backend/README.md`](backend/README.md) — scripts, env, tests, Docker
- [`frontend/README.md`](frontend/README.md) — build, preview, env
