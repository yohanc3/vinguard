#!/bin/sh

./vinguard-backend &
bun run src/services/scraper/worker.ts &
wait

