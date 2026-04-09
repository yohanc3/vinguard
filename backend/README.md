# Vinguard backend
We use [Hono](https://hono.dev) to serve a [tRPC](https://trpc.io) router with routes for: CRUD
logic for cars (Palantir), handling AI chats (streaming + web search),
extracting vehicle report data (LLM on PDF/listing text), CRUD logic for files (R2 presigned URLs), auth (JWT + SQLite users). 
A separate **worker** polls SQLite for jobs and runs vehicle analysis.

## Requirements

- Bun
- Valid `.env` (see below)

## Environment

Copy the template and edit:

```sh
cp .env.example .env
```

Fill in each variable accordingly

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

See `Dockerfile` and `start.sh` for a compiled binary + Bun worker layout. You still need env vars and secrets at runtime, example in how to incorporate these below.

The Dockerfile at `/docker` is a good and simple way to deploy your backend. It uses a [distroless image](https://github.com/GoogleContainerTools/distroless/tree/main) to run only the application with its dependencies, thus making the container a lot smaller.

To deploy using Docker, first build the image, and then run the container. There is an example you can modify at `/docker/docker_deploy_example.sh`. It looks like this:

```bash 
# Build image
$ docker build -t [image-name] .

# Run container
# 1. Make sure to expose a port if you choose to use Nginx to expose your API 
# 2. Adding a volume is essential if you want a persistent database
docker run -d --env-file .env -p 3000:3000 -v [volume source]:[container destination] [image-name]:latest

```

Make sure to pass your .env file if you want to avoid the headache of manually adding env vars, and use a [Docker volume](https://docs.docker.com/engine/storage/volumes/) if you want a persistent database.


## Documentation

Start at [`docs/README.md`](docs/README.md) for diagrams and links to Palantir, job queue, chat, and extraction docs.
