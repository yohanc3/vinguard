# Vinguard frontend

The frontend handles all user interactions, such as: auth, dashboard actions, creating new reports (manual listing fields + Vehicle Report PDF), and report view (Vehicle Report view, Vinguard analysis, AI chat).

For the tech stack, we have [Vite](https://vite.dev) + [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) + [tRPC](https://trpc.io) (via TanStack Query).

## Requirements

- Bun (or Node with your own package runner; scripts below use Bun)

## Environment

```sh
cp .env.example .env
```

`VITE_API_URL` must point at the backend tRPC base URL, including the `/trpc` path, for example:

`http://localhost:3000/trpc`

Vite only exposes variables prefixed with `VITE_`. For production builds, set the same variable in `.env.production` or your CI environment before `bun run build` so it is inlined into the client bundle.

## Scripts

```sh
bun install

# Dev server
bun run dev

# Typecheck + production build
bun run build

# Local preview of dist/
bun run preview

bun run lint
```

## Layout (high level)

```
components/     # Pages, layout, report view, chat, new-report flow
lib/            # tRPC client + React Query provider
hooks/          # Shared hooks (e.g. PDF text extraction)
```

The tRPC client is configured in `lib/trpc.tsx` and uses `VITE_API_URL` with a localhost default for development.

## Backend dependency

The UI expects the API and (for full reports) the **worker** running; see the root [`README.md`](../README.md) and [`backend/README.md`](../backend/README.md).
